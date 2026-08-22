/**
 * Base class for repositories. Prisma may only be imported/configured in this layer.
 */
export class BaseRepository {
  constructor(prisma) {
    this.prisma = prisma;
  }
}

