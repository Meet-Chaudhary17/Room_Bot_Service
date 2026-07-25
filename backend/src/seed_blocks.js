import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const blockNames = [
  'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J',
  'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T'
];

const serviceTypes = [
  { id: 'cleaning', name: 'Cleaning', description: 'Hostel room vacuum and washing' },
  { id: 'ac', name: 'AC Maintenance', description: 'Air conditioner filter cleaning and repair' },
  { id: 'electrical', name: 'Electrical', description: 'Power sockets and light repair' },
  { id: 'plumbing', name: 'Plumbing', description: 'Bathroom leak and tap repair' },
  { id: 'furniture', name: 'Furniture', description: 'Bed frames, drawers and chair repair' }
];

async function main() {
  console.log('🌱 Seeding hostel blocks A to T...');
  for (const name of blockNames) {
    const existing = await prisma.block.findUnique({
      where: { id: name }
    });

    if (!existing) {
      await prisma.block.create({
        data: {
          id: name,
          name: name
        }
      });
      console.log(`Created Block: ${name}`);
    }
  }

  console.log('🌱 Seeding default service types...');
  for (const st of serviceTypes) {
    const existing = await prisma.serviceType.findUnique({
      where: { id: st.id }
    });

    if (!existing) {
      await prisma.serviceType.create({
        data: {
          id: st.id,
          name: st.name,
          description: st.description,
          isActive: true
        }
      });
      console.log(`Created Service Type: ${st.name}`);
    }
  }

  console.log('✅ Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
