import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@roombot.com';
  const username = 'adminboss';
  const password = 'adminpassword';
  const passwordHash = await bcrypt.hash(password, 10);

  const existing = await prisma.admin.findUnique({
    where: { email }
  });

  if (existing) {
    console.log(`Admin account already exists: ${email}`);
    return;
  }

  const admin = await prisma.admin.create({
    data: {
      username,
      email,
      passwordHash
    }
  });

  console.log(`✅ Admin account created successfully!`);
  console.log(`Email: ${email}`);
  console.log(`Password: ${password}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
