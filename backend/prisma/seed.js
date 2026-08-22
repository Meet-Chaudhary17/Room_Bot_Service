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

  // Clean up any old administrator records to prevent constraints/duplicates issues
  await prisma.accountCredential.deleteMany({
    where: { email: { in: ['admin@roombot.local', 'Meetu_2006@gmail.com'] } }
  });
  await prisma.administrator.deleteMany({
    where: { username: { in: ['Meetu_2006', 'Meetu_2006@gmail.com'] } }
  });

  const administrator = await prisma.administrator.create({
    data: {
      username: 'Meetu_2006@gmail.com',
      fullName: 'Room-Bot Administrator',
      email: 'Meetu_2006@gmail.com',
    },
  });

  await prisma.accountCredential.create({
    data: {
      userType: UserType.ADMINISTRATOR,
      userId: administrator.id,
      email: 'Meetu_2006@gmail.com',
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

