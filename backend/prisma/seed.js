import bcrypt from 'bcrypt';
import { PrismaClient, ServiceRole, UserType } from '@prisma/client';

const prisma = new PrismaClient();

const categories = [
  ['Cleaning', ServiceRole.CLEANING],
  ['Electrical Maintenance', ServiceRole.ELECTRICAL_MAINTENANCE],
  ['Plumbing', ServiceRole.PLUMBING],
  ['AC Maintenance', ServiceRole.AC_MAINTENANCE],
  ['Furniture Repair', ServiceRole.FURNITURE_REPAIR],
];

async function main() {
  const passwordHash = await bcrypt.hash('u6002_teeM', 12);

  const administrator = await prisma.administrator.upsert({
    where: { username: 'Meetu_2006' },
    update: {},
    create: {
      username: 'Meetu_2006',
      fullName: 'Room-Bot Administrator',
      email: 'admin@roombot.local',
    },
  });

  await prisma.accountCredential.upsert({
    where: { email: 'admin@roombot.local' },
    update: {
      userType: UserType.ADMINISTRATOR,
      userId: administrator.id,
      passwordHash,
      emailVerified: true,
      lastPasswordChange: new Date(),
    },
    create: {
      userType: UserType.ADMINISTRATOR,
      userId: administrator.id,
      email: 'admin@roombot.local',
      passwordHash,
      emailVerified: true,
      lastPasswordChange: new Date(),
    },
  });

  const blocks = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T'];
  for (let i = 0; i < blocks.length; i++) {
    const id = i + 1;
    const blockName = `${blocks[i]} Block`;
    await prisma.hostelBlock.upsert({
      where: { id },
      update: { blockName },
      create: { id, blockName },
    });
  }

  for (const [categoryName, serviceRole] of categories) {
    await prisma.serviceCategory.upsert({
      where: { categoryName },
      update: { serviceRole },
      create: { categoryName, serviceRole },
    });
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });

