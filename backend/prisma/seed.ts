import { PrismaClient } from '../src/generated/prisma';

const prisma = new PrismaClient();

async function main() {
  console.log('Seed file is ready. No dummy data seeded.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
