import { BaseRepository } from './base.repository.js';
export class StudentRepository extends BaseRepository {
  profile(id) { return this.prisma.student.findUnique({ where: { id }, include: { block: true } }); }
  updateProfile(id, data) { return this.prisma.student.update({ where: { id }, data }); }
  requests(studentId, where = {}) { return this.prisma.serviceRequest.findMany({ where: { studentId, ...where }, include: { category: true, assignedStaff: { select: { id: true, fullName: true } } }, orderBy: { createdAt: 'desc' } }); }
  request(id, studentId) { return this.prisma.serviceRequest.findFirst({ where: { id, studentId }, include: { category: true, feedback: true } }); }
  createRequest(data) {
    return this.prisma.$transaction(async (tx) => {
      // 1. Get student profile block
      const student = await tx.student.findUnique({
        where: { id: data.studentId },
        select: { blockId: true }
      });
      if (!student) throw new Error('Student not found.');

      // 2. Get service role from category
      const category = await tx.serviceCategory.findUnique({
        where: { id: data.categoryId },
        select: { serviceRole: true }
      });
      if (!category) throw new Error('Service category not found.');

      // 3. Find active staff in same block with matching role
      const staffMembers = await tx.staff.findMany({
        where: {
          blockId: student.blockId,
          serviceRole: category.serviceRole,
          isActive: true
        }
      });

      let assignedStaffId = null;
      let requestStatus = 'PENDING';
      let assignedAt = null;

      if (staffMembers.length > 0) {
        // 4. Calculate active workload
        const staffWorkloads = await Promise.all(
          staffMembers.map(async (staff) => {
            const count = await tx.serviceRequest.count({
              where: {
                assignedStaffId: staff.id,
                requestStatus: { in: ['ASSIGNED', 'IN_PROGRESS'] }
              }
            });
            return { staffId: staff.id, count };
          })
        );

        // 5. Find min workload
        const minWorkload = Math.min(...staffWorkloads.map(sw => sw.count));
        const candidates = staffWorkloads.filter(sw => sw.count === minWorkload);

        // 6. Random selection on tie
        const chosen = candidates[Math.floor(Math.random() * candidates.length)];
        assignedStaffId = chosen.staffId;
        requestStatus = 'ASSIGNED';
        assignedAt = new Date();
      }

      // 7. Create request
      return tx.serviceRequest.create({
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
    });
  }
  cancelRequest(id, studentId) { return this.prisma.serviceRequest.updateMany({ where: { id, studentId, requestStatus: { in: ['PENDING', 'ASSIGNED'] } }, data: { requestStatus: 'CANCELLED', cancelledAt: new Date() } }); }
  createComplaint(data) { return this.prisma.complaint.create({ data }); }
  complaints(studentId) { return this.prisma.complaint.findMany({ where: { studentId }, include: { category: true }, orderBy: { createdAt: 'desc' } }); }
  createFeedback(data) { return this.prisma.feedback.create({ data }); }
  stats(studentId) { return this.prisma.serviceRequest.groupBy({ by: ['requestStatus'], where: { studentId }, _count: { _all: true } }); }
}
