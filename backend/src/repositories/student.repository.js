import { BaseRepository } from './base.repository.js';
import { AppError } from '../utils/app-error.js';
import { allocationEngine } from '../services/allocation-engine.service.js';

const ROLE_TO_INDEX = {
  CLEANING: 0,
  ELECTRICAL_MAINTENANCE: 1,
  PLUMBING: 2,
  FURNITURE_REPAIR: 3,
  AC_MAINTENANCE: 4,
};

function getRoleIndex(role) {
  return ROLE_TO_INDEX[role] !== undefined ? ROLE_TO_INDEX[role] : 4;
}

const BASELINE_DEMAND = Array.from({ length: 5 }, () => Array(168).fill(1 / 3600));

function getDefaultTime(role) {
  if (role === 'CLEANING') return 420;
  if (role === 'ELECTRICAL_MAINTENANCE') return 1200;
  if (role === 'PLUMBING') return 1800;
  if (role === 'FURNITURE_REPAIR') return 1500;
  return 900;
}

async function getRecencyAdjustment(tx, categoryId, serviceRole) {
  const t = Date.now();
  const twoHoursAgo = new Date(t - 120 * 60 * 1000);
  
  const observedCount = await tx.serviceRequest.count({
    where: {
      categoryId,
      createdAt: { gte: twoHoursAgo }
    }
  });

  let expectedCount = 0;
  const roleIdx = getRoleIndex(serviceRole);
  for (let j = 0; j < 8; j++) {
    const checkTime = t - j * 15 * 60 * 1000;
    const date = new Date(checkTime);
    const day = date.getDay();
    const hour = date.getHours();
    const hourOfWeek = day * 24 + hour;
    const lambda_base = BASELINE_DEMAND[roleIdx][hourOfWeek];
    expectedCount += lambda_base * 900;
  }

  const beta_recency = 0.5;
  const alpha_k = (observedCount + beta_recency * expectedCount) / (expectedCount + beta_recency * expectedCount);
  return alpha_k;
}

const studentCountCache = new Map();

async function getBlockSuppression(tx, categoryId, blockId) {
  const activeInBlock = await tx.serviceRequest.count({
    where: {
      categoryId,
      student: { blockId },
      requestStatus: { in: ['PENDING', 'ASSIGNED', 'IN_PROGRESS'] }
    }
  });

  const now = Date.now();
  const cached = studentCountCache.get(blockId);
  let totalStudentsInBlock;
  if (cached && cached.expiresAt > now) {
    totalStudentsInBlock = cached.count;
  } else {
    totalStudentsInBlock = await tx.student.count({
      where: { blockId }
    });
    studentCountCache.set(blockId, { count: totalStudentsInBlock, expiresAt: now + 30000 });
  }

  const N_block = Math.max(totalStudentsInBlock, 1);
  return Math.max(0, (N_block - activeInBlock) / N_block);
}

async function getFutureWorkload(tx, staff, requestedServiceRole, recencyAdj, blockSupp, estimatedServiceTime) {
  const currentWorkload = staff.currentWorkload;
  const t = Date.now();
  const deltaTau = 900;
  const M_i = Math.max(1, Math.ceil(estimatedServiceTime / deltaTau));
  
  let futureWorkload = 0;
  const staffRoles = [];
  if (staff.primaryRole) staffRoles.push(staff.primaryRole);
  if (staff.secondaryRole) staffRoles.push(staff.secondaryRole);

  for (let m = 1; m <= M_i; m++) {
    const tau_m_seconds = t + currentWorkload + (m - 0.5) * deltaTau * 1000;
    const date = new Date(tau_m_seconds);
    const day = date.getDay();
    const hour = date.getHours();
    const hourOfWeek = day * 24 + hour;

    let sumLambda = 0;
    for (const role of staffRoles) {
      const roleIdx = getRoleIndex(role);
      const lambda_base = BASELINE_DEMAND[roleIdx][hourOfWeek];
      sumLambda += lambda_base * recencyAdj * blockSupp;
    }

    const timeDiff = (m - 0.5) * deltaTau;
    const mu_i = estimatedServiceTime;
    const expTerm = Math.exp(-2 * timeDiff / mu_i);
    const S_i = expTerm * (1 + 2 * timeDiff / mu_i);

    futureWorkload += sumLambda * S_i * deltaTau;
  }

  return futureWorkload;
}

function getSkillScarcity(staff, allActiveStaff, categoryRole) {
  const getAlpha = (s) => {
    if (!s.isActive) return 0;
    if (s.currentWorkload === 0) return 1.0;
    const lambda_scarcity = Math.log(2) / 900;
    return Math.exp(-lambda_scarcity * s.currentWorkload);
  };

  const getTildeA = (allStaff, role) => {
    let sum = 0;
    for (const s of allStaff) {
      if (s.primaryRole === role || s.secondaryRole === role) {
        sum += getAlpha(s);
      }
    }
    return sum;
  };

  const allStaff = allActiveStaff;

  const c_r = categoryRole;
  const K_i = [];
  if (staff.primaryRole) K_i.push(staff.primaryRole);
  if (staff.secondaryRole) K_i.push(staff.secondaryRole);

  const c_s = K_i.find(r => r !== c_r) || null;

  const A_tilde_cr = getTildeA(allStaff, c_r);
  const A_tilde_cs = c_s ? getTildeA(allStaff, c_s) : 0;

  const alpha_i = getAlpha(staff);
  const epsilon_s = 0.0001;
  const beta_s = 1.0;

  const term1 = Math.log(A_tilde_cr / (A_tilde_cr - alpha_i + epsilon_s));
  let term2 = 0;
  if (K_i.length === 2 && c_s) {
    term2 = beta_s * Math.log(A_tilde_cs / (A_tilde_cs - alpha_i + epsilon_s)) * (alpha_i / A_tilde_cr);
  }

  return term1 + term2;
}

async function updateStaffWorkload(tx, staffId) {
  const assigned = await tx.serviceRequest.findMany({
    where: {
      assignedStaffId: staffId,
      requestStatus: { in: ['ASSIGNED', 'IN_PROGRESS'] }
    },
    include: { category: true }
  });

  const categoryIds = [...new Set(assigned.map(r => r.categoryId))];
  const statsList = categoryIds.length > 0
    ? await tx.staffCategoryStats.findMany({
        where: { staffId, categoryId: { in: categoryIds } }
      })
    : [];
  const statsMap = new Map(statsList.map(s => [s.categoryId, s]));

  let workload = 0;
  for (const req of assigned) {
    const stats = statsMap.get(req.categoryId);
    const avg = stats && stats.completedCount > 0 ? stats.averageTime : 0;
    if (avg > 0) {
      workload += avg;
    } else {
      workload += getDefaultTime(req.category.serviceRole);
    }
  }

  await tx.staff.update({
    where: { id: staffId },
    data: { currentWorkload: workload }
  });
}

export class StudentRepository extends BaseRepository {
  profile(id) { return this.prisma.student.findUnique({ where: { id }, include: { block: true } }); }
  updateProfile(id, data) { return this.prisma.student.update({ where: { id }, data }); }
  async requests(studentId, where = {}) {
    const dbRequests = await this.prisma.serviceRequest.findMany({
      where: { studentId, ...where },
      include: { category: true, assignedStaff: { select: { id: true, fullName: true } } },
      orderBy: { createdAt: 'desc' }
    });
    const uncommitted = allocationEngine.getUncommittedForStudent(studentId);
    if (!uncommitted || uncommitted.length === 0) return dbRequests;

    const existingIds = new Set(dbRequests.map(r => r.id));
    const existingRooms = new Set(dbRequests.map(r => `${r.roomNumber}_${r.categoryId}`));

    const extra = uncommitted.filter(r => {
      if (r.persistedDbId && existingIds.has(r.persistedDbId)) return false;
      if (existingRooms.has(`${r.roomNumber}_${r.categoryId}`)) return false;
      return true;
    });

    return [...extra, ...dbRequests];
  }
  request(id, studentId) { return this.prisma.serviceRequest.findFirst({ where: { id, studentId }, include: { category: true, feedback: true } }); }
  
  createRequest(data) {
    return this.prisma.$transaction(async (tx) => {
      const student = await tx.student.findUnique({
        where: { id: data.studentId },
        select: { blockId: true, floor: true }
      });
      if (!student) throw new AppError(404, 'STUDENT_NOT_FOUND', 'Student not found.');

      const category = await tx.serviceCategory.findUnique({
        where: { id: data.categoryId },
        select: { serviceRole: true }
      });
      if (!category) throw new AppError(404, 'CATEGORY_NOT_FOUND', 'Service category not found.');

      const unresolvedStatuses = ['PENDING', 'ASSIGNED', 'IN_PROGRESS'];
      const existingRequest = await tx.serviceRequest.findFirst({
        where: {
          roomNumber: data.roomNumber,
          categoryId: data.categoryId,
          requestStatus: { in: unresolvedStatuses }
        }
      });
      if (existingRequest) {
        throw new AppError(400, 'DUPLICATE_REQUEST', 'Your roommate has already applied for this service request. You cannot submit another request of the same type until the current request is completed.');
      }

      const staffMembers = await tx.staff.findMany({
        where: {
          blockId: student.blockId,
          isActive: true,
          OR: [
            { primaryRole: category.serviceRole },
            { secondaryRole: category.serviceRole }
          ]
        }
      });

      let assignedStaffId = null;
      let requestStatus = 'PENDING';
      let assignedAt = null;

      if (staffMembers.length > 0) {
        const candidates = [];
        const recencyAdj = await getRecencyAdjustment(tx, data.categoryId, category.serviceRole);
        const blockSupp = await getBlockSuppression(tx, data.categoryId, student.blockId);

        const staffIds = staffMembers.map(s => s.id);
        const allStats = await tx.staffCategoryStats.findMany({
          where: { staffId: { in: staffIds }, categoryId: data.categoryId }
        });
        const statsMap = new Map(allStats.map(s => [s.staffId, s]));

        const allActiveStaff = await tx.staff.findMany({ where: { isActive: true } });

        for (const staff of staffMembers) {
          const stats = statsMap.get(staff.id);
          const rawF1 = stats && stats.completedCount > 0 ? stats.averageTime : 0;

          const rawF2 = staff.currentWorkload;

          const estTime = rawF1 > 0 ? rawF1 : getDefaultTime(category.serviceRole);
          const rawF3 = await getFutureWorkload(tx, staff, category.serviceRole, recencyAdj, blockSupp, estTime);

          const rawF4 = getSkillScarcity(staff, allActiveStaff, category.serviceRole);

          const staffFloor = staff.floor !== null ? staff.floor : 1;
          const rawF5 = Math.abs(staffFloor - student.floor);

          candidates.push({
            staff,
            rawF1,
            rawF2,
            rawF3,
            rawF4,
            rawF5
          });
        }

        const getMinMax = (key) => {
          const vals = candidates.map(c => c[key]);
          return { min: Math.min(...vals), max: Math.max(...vals) };
        };

        const f1Range = getMinMax('rawF1');
        const f2Range = getMinMax('rawF2');
        const f3Range = getMinMax('rawF3');
        const f4Range = getMinMax('rawF4');
        const f5Range = getMinMax('rawF5');

        const normVal = (val, min, max) => {
          if (max === min) return 0.0;
          return (val - min) / (max - min);
        };

        for (const c of candidates) {
          c.normF1 = normVal(c.rawF1, f1Range.min, f1Range.max);
          c.normF2 = normVal(c.rawF2, f2Range.min, f2Range.max);
          c.normF3 = normVal(c.rawF3, f3Range.min, f3Range.max);
          c.normF4 = normVal(c.rawF4, f4Range.min, f4Range.max);
          c.normF5 = normVal(c.rawF5, f5Range.min, f5Range.max);

          c.finalCost = 0.2778 * c.normF1 +
                        0.2222 * c.normF2 +
                        0.2222 * c.normF3 +
                        0.1667 * c.normF4 +
                        0.1111 * c.normF5;
        }

        candidates.sort((a, b) => {
          if (Math.abs(a.finalCost - b.finalCost) > 1e-9) {
            return a.finalCost - b.finalCost;
          }
          if (Math.abs(a.rawF2 - b.rawF2) > 1e-9) {
            return a.rawF2 - b.rawF2;
          }
          if (a.rawF5 !== b.rawF5) {
            return a.rawF5 - b.rawF5;
          }
          return a.staff.id - b.staff.id;
        });

        const chosen = candidates[0];
        assignedStaffId = chosen.staff.id;
        requestStatus = 'ASSIGNED';
        assignedAt = new Date();
      }

      const request = await tx.serviceRequest.create({
        data: {
          ...data,
          assignedStaffId,
          requestStatus,
          assignedAt
        },
        include: {
          category: true,
          assignedStaff: { select: { id: true, fullName: true } }
        }
      });

      if (assignedStaffId) {
        await updateStaffWorkload(tx, assignedStaffId);
      }

      return request;
    }, { timeout: 20000 });
  }
  cancelRequest(id, studentId) { return this.prisma.serviceRequest.updateMany({ where: { id, studentId, requestStatus: { in: ['PENDING', 'ASSIGNED'] } }, data: { requestStatus: 'CANCELLED', cancelledAt: new Date() } }); }
  createComplaint(data) { return this.prisma.complaint.create({ data }); }
  complaints(studentId) { return this.prisma.complaint.findMany({ where: { studentId }, include: { category: true }, orderBy: { createdAt: 'desc' } }); }
  createFeedback(data) { return this.prisma.feedback.create({ data }); }
  stats(studentId) { return this.prisma.serviceRequest.groupBy({ by: ['requestStatus'], where: { studentId }, _count: { _all: true } }); }
}
