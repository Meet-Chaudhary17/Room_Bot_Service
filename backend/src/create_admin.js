import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const username = process.argv[2] || 'admin_roombot';
  const password = process.argv[3] || 'AdminPass123!';
  const email = `${username}@roombot.local`;

  const existing = await prisma.administrator.findFirst({
    where: { username }
  });

  if (existing) {
    console.log(`Admin account already exists with username: ${username}`);
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.$transaction(async (tx) => {
    const admin = await tx.administrator.create({
      data: {
        username,
        fullName: 'Administrator',
        email
      }
    });

    await tx.accountCredential.create({
      data: {
        userType: 'ADMINISTRATOR',
        userId: admin.id,
        email,
        passwordHash,
        emailVerified: true
      }
    });
  });

  console.log(`✅ Admin account created successfully!`);
  console.log(`Username/Email: ${username}`);
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
