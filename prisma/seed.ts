import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DIRECT_URL ?? process.env.DATABASE_URL,
});
const prisma = new PrismaClient({ adapter });

// Deve combaciare con DORMS in src/lib/constants.ts
const DORMS = [
  "Butler Hall",
  "Academy Hall",
  "Gerard Hall",
  "Gaines Hall",
  "Lugari Hall",
  "Ursula Hall",
  "St. John's Hall",
];

async function main() {
  // Rimuove i dorm non più in elenco (gli utenti collegati avranno dormId = null)
  await prisma.dorm.deleteMany({ where: { name: { notIn: DORMS } } });

  for (const name of DORMS) {
    await prisma.dorm.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }
  console.log(`Seed completato: ${DORMS.length} dormitori.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
