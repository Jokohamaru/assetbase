const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const assignments = await prisma.assetAssignment.findMany({
    where: {
      assetId: '2d580b28-eca6-42e1-8343-5e51c0f88cd4'
    }
  });
  console.log(assignments);
}

run()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
