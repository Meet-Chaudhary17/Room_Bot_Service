import { prisma } from '../config/prisma.js';
import { AppError } from '../utils/app-error.js';
import { logger } from '../utils/logger.js';

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

class AllocationEngineService {
  constructor() {
    this.initialized = false;
    this.initPromise = null;
    this.categories = new Map();
    this.staffMembers = new Map();
    this.staffByBlock = new Map();
    this.statsMap = new Map();
    this.activeRoomRequests = new Set();
    this.studentsCache = new Map();
    this.uncommittedByStudent = new Map();
    this.queue = [];
    this.isDraining = false;
    this.recentRequestTimes = [];
    this.activeInBlockCounts = new Map();
    this.blockStudentCounts = new Map();
    this.nextTempId = 500000;
  }

  async ensureInitialized() {
    if (this.initialized) return;
    if (this.initPromise) return this.initPromise;
    this.initPromise = this.init();
    return this.initPromise;
  }

  async init() {
    try {
      logger.info('AllocationEngineService: Initializing in-memory state from PostgreSQL...');
      const [cats, staffList, stats, students, activeReqs] = await Promise.all([
        prisma.serviceCategory.findMany(),
        prisma.staff.findMany({ where: { isActive: true } }),
        prisma.staffCategoryStats.findMany(),
        prisma.student.findMany({ select: { id: true, blockId: true, floor: true, roomNumber: true } }),
        prisma.serviceRequest.findMany({
          where: { requestStatus: { in: ['PENDING', 'ASSIGNED', 'IN_PROGRESS'] } },
          select: { id: true, roomNumber: true, categoryId: true, student: { select: { blockId: true } } }
        })
      ]);

      this.categories.clear();
      for (const c of cats) this.categories.set(c.id, c);

      this.studentsCache.clear();
      this.blockStudentCounts.clear();
      for (const s of students) {
        this.studentsCache.set(s.id, s);
        const bCount = this.blockStudentCounts.get(s.blockId) || 0;
        this.blockStudentCounts.set(s.blockId, bCount + 1);
      }

      this.staffMembers.clear();
      this.staffByBlock.clear();
      for (const s of staffList) {
        this.staffMembers.set(s.id, { ...s });
        if (!this.staffByBlock.has(s.blockId)) this.staffByBlock.set(s.blockId, []);
        this.staffByBlock.get(s.blockId).push(this.staffMembers.get(s.id));
      }

      this.statsMap.clear();
      for (const stat of stats) {
        this.statsMap.set(`${stat.staffId}_${stat.categoryId}`, stat);
      }

      this.activeRoomRequests.clear();
      this.activeInBlockCounts.clear();
      for (const req of activeReqs) {
        this.activeRoomRequests.add(`${req.roomNumber}_${req.categoryId}`);
        if (req.student) {
          const key = `${req.student.blockId}_${req.categoryId}`;
          this.activeInBlockCounts.set(key, (this.activeInBlockCounts.get(key) || 0) + 1);
        }
      }

      this.initialized = true;
      this.startBackgroundDrainWorker();
      logger.info(`AllocationEngineService initialized: ${cats.length} categories, ${staffList.length} staff, ${students.length} students loaded.`);
    } catch (err) {
      logger.error({ err: err.message }, 'AllocationEngineService initialization failed');
      this.initPromise = null;
      throw err;
    }
  }

  async getStudent(studentId) {
    let student = this.studentsCache.get(studentId);
    if (!student) {
      student = await prisma.student.findUnique({
        where: { id: studentId },
        select: { id: true, blockId: true, floor: true, roomNumber: true }
      });
      if (student) {
        this.studentsCache.set(student.id, student);
        const bCount = this.blockStudentCounts.get(student.blockId) || 0;
        this.blockStudentCounts.set(student.blockId, bCount + 1);
      }
    }
    return student;
  }

  async getCategory(categoryId) {
    let cat = this.categories.get(categoryId);
    if (!cat) {
      cat = await prisma.serviceCategory.findUnique({ where: { id: categoryId } });
      if (cat) this.categories.set(cat.id, cat);
    }
    return cat;
  }

  calculateSkillScarcity(staff, allActiveStaff, categoryRole) {
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

    const c_r = categoryRole;
    const K_i = [];
    if (staff.primaryRole) K_i.push(staff.primaryRole);
    if (staff.secondaryRole) K_i.push(staff.secondaryRole);

    const c_s = K_i.find(r => r !== c_r) || null;

    const A_tilde_cr = getTildeA(allActiveStaff, c_r);
    const A_tilde_cs = c_s ? getTildeA(allActiveStaff, c_s) : 0;

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

  calculateFutureWorkload(staff, requestedServiceRole, recencyAdj, blockSupp, estimatedServiceTime) {
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

  async createRequestFast(studentId, { title, description, category_id, room_number }) {
    await this.ensureInitialized();

    const student = await this.getStudent(studentId);
    if (!student) {
      throw new AppError(404, 'STUDENT_NOT_FOUND', 'Student not found.');
    }

    const category = await this.getCategory(category_id);
    if (!category) {
      throw new AppError(404, 'CATEGORY_NOT_FOUND', 'Service category not found.');
    }

    const roomKey = `${room_number}_${category_id}`;
    if (this.activeRoomRequests.has(roomKey)) {
      throw new AppError(400, 'DUPLICATE_REQUEST', 'Your roommate has already applied for this service request. You cannot submit another request of the same type until the current request is completed.');
    }

    const blockStaff = this.staffByBlock.get(student.blockId) || [];
    const eligibleStaff = blockStaff.filter(s =>
      s.isActive && (s.primaryRole === category.serviceRole || s.secondaryRole === category.serviceRole)
    );

    if (eligibleStaff.length === 0) {
      throw new AppError(400, 'NO_STAFF_AVAILABLE', 'Request cannot be sent because no staff is available in your block for this service.');
    }

    // 5-Factor Scoring in RAM
    const now = Date.now();
    const twoHoursAgo = now - 120 * 60 * 1000;
    this.recentRequestTimes = this.recentRequestTimes.filter(ts => ts >= twoHoursAgo);
    this.recentRequestTimes.push(now);
    const observedCount = this.recentRequestTimes.length;

    let expectedCount = 0;
    const roleIdx = getRoleIndex(category.serviceRole);
    for (let j = 0; j < 8; j++) {
      const checkTime = now - j * 15 * 60 * 1000;
      const date = new Date(checkTime);
      const day = date.getDay();
      const hour = date.getHours();
      const hourOfWeek = day * 24 + hour;
      const lambda_base = BASELINE_DEMAND[roleIdx][hourOfWeek];
      expectedCount += lambda_base * 900;
    }
    const beta_recency = 0.5;
    const recencyAdj = (observedCount + beta_recency * expectedCount) / (expectedCount + beta_recency * expectedCount);

    const blockKey = `${student.blockId}_${category_id}`;
    const activeInBlock = this.activeInBlockCounts.get(blockKey) || 0;
    const totalStudentsInBlock = Math.max(this.blockStudentCounts.get(student.blockId) || 1, 1);
    const blockSupp = Math.max(0, (totalStudentsInBlock - activeInBlock) / totalStudentsInBlock);

    const allActiveStaff = Array.from(this.staffMembers.values()).filter(s => s.isActive);

    const candidates = [];
    for (const staff of eligibleStaff) {
      const stat = this.statsMap.get(`${staff.id}_${category_id}`);
      const rawF1 = stat && stat.completedCount > 0 ? stat.averageTime : 0;
      const rawF2 = staff.currentWorkload;
      const estTime = rawF1 > 0 ? rawF1 : getDefaultTime(category.serviceRole);
      const rawF3 = this.calculateFutureWorkload(staff, category.serviceRole, recencyAdj, blockSupp, estTime);
      const rawF4 = this.calculateSkillScarcity(staff, allActiveStaff, category.serviceRole);
      const staffFloor = staff.floor !== null ? staff.floor : 1;
      const rawF5 = Math.abs(staffFloor - student.floor);

      candidates.push({ staff, rawF1, rawF2, rawF3, rawF4, rawF5, estTime });
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

    const normVal = (val, min, max) => (max === min ? 0.0 : (val - min) / (max - min));

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
      if (Math.abs(a.finalCost - b.finalCost) > 1e-9) return a.finalCost - b.finalCost;
      if (Math.abs(a.rawF2 - b.rawF2) > 1e-9) return a.rawF2 - b.rawF2;
      if (a.rawF5 !== b.rawF5) return a.rawF5 - b.rawF5;
      return a.staff.id - b.staff.id;
    });

    const chosen = candidates[0];
    const assignedStaff = chosen.staff;

    // Immediately update in-memory state for workload distribution
    assignedStaff.currentWorkload += chosen.estTime;
    this.activeRoomRequests.add(roomKey);
    this.activeInBlockCounts.set(blockKey, activeInBlock + 1);

    const tempId = ++this.nextTempId;
    const requestRecord = {
      id: tempId,
      studentId,
      categoryId: category_id,
      title,
      description,
      roomNumber: room_number,
      assignedStaffId: assignedStaff.id,
      requestStatus: 'ASSIGNED',
      assignedAt: new Date(),
      createdAt: new Date(),
      category,
      assignedStaff: { id: assignedStaff.id, fullName: assignedStaff.fullName },
      persistedDbId: null,
      timestamp: Date.now()
    };

    // Track for immediate read-your-own-writes
    if (!this.uncommittedByStudent.has(studentId)) {
      this.uncommittedByStudent.set(studentId, []);
    }
    this.uncommittedByStudent.get(studentId).push(requestRecord);

    // Queue for DB background write
    this.queue.push({
      tempId,
      data: {
        studentId,
        categoryId: category_id,
        title,
        description,
        roomNumber: room_number,
        assignedStaffId: assignedStaff.id,
        requestStatus: 'ASSIGNED',
        assignedAt: requestRecord.assignedAt
      },
      staffId: assignedStaff.id,
      workload: assignedStaff.currentWorkload
    });

    return requestRecord;
  }

  getUncommittedForStudent(studentId) {
    return this.uncommittedByStudent.get(studentId) || [];
  }

  notifyRequestResolved(roomNumber, categoryId, staffId, durationReduction = 0) {
    const roomKey = `${roomNumber}_${categoryId}`;
    this.activeRoomRequests.delete(roomKey);

    if (staffId && this.staffMembers.has(staffId)) {
      const s = this.staffMembers.get(staffId);
      s.currentWorkload = Math.max(0, s.currentWorkload - durationReduction);
    }
  }

  startBackgroundDrainWorker() {
    if (this.workerInterval) return;

    this.workerInterval = setInterval(async () => {
      if (this.isDraining || this.queue.length === 0) return;
      this.isDraining = true;

      const batch = this.queue.splice(0, 20);
      try {
        await Promise.all(batch.map(async (item) => {
          try {
            const created = await prisma.serviceRequest.create({ data: item.data });
            await prisma.staff.update({
              where: { id: item.staffId },
              data: { currentWorkload: item.workload }
            });

            // Mark uncommitted record with real DB ID
            const list = this.uncommittedByStudent.get(item.data.studentId);
            if (list) {
              const rec = list.find(r => r.id === item.tempId);
              if (rec) rec.persistedDbId = created.id;
            }

            // Prune after safe delay
            setTimeout(() => {
              const l = this.uncommittedByStudent.get(item.data.studentId);
              if (l) {
                const idx = l.findIndex(r => r.id === item.tempId);
                if (idx !== -1) l.splice(idx, 1);
              }
            }, 15000);
          } catch (err) {
            logger.error({ err: err.message, item }, 'Error saving queued request to DB');
          }
        }));
      } catch (err) {
        logger.error({ err: err.message }, 'Queue drain worker error');
      } finally {
        this.isDraining = false;
      }
    }, 100);
  }
}

export const allocationEngine = new AllocationEngineService();
