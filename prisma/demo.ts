import "dotenv/config";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DIRECT_URL ?? process.env.DATABASE_URL,
});
const prisma = new PrismaClient({ adapter });

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

const GRADIENTS = [
  ["#ff5a5f", "#ff8a5b"],
  ["#6c5ce7", "#a29bfe"],
  ["#00b894", "#55efc4"],
  ["#0984e3", "#74b9ff"],
  ["#e17055", "#fab1a0"],
  ["#e84393", "#fd79a8"],
];

async function avatar(initial: string, idx: number): Promise<string> {
  await mkdir(UPLOAD_DIR, { recursive: true });
  const [a, b] = GRADIENTS[idx % GRADIENTS.length];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="800" viewBox="0 0 600 800">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
  <stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs>
  <rect width="600" height="800" fill="url(#g)"/>
  <text x="300" y="440" font-family="Arial" font-size="260" font-weight="bold"
  fill="rgba(255,255,255,0.9)" text-anchor="middle">${initial}</text></svg>`;
  const name = `demo-${idx}-${Math.random().toString(36).slice(2, 8)}.svg`;
  await writeFile(path.join(UPLOAD_DIR, name), svg);
  return `/uploads/${name}`;
}

const DEMO = [
  { firstName: "Sofia", lastName: "Rossi", nat: "IT", eng: "B2", days: 20, bio: "I love coffee and long chats. Looking for people to explore the city with!" },
  { firstName: "Lucas", lastName: "Silva", nat: "BR", eng: "B1", days: 45, bio: "Football, música e novos amigos. Let's practice English together!" },
  { firstName: "Yuki", lastName: "Tanaka", nat: "JP", eng: "A2", days: 60, bio: "Here for 2 months. I love photography and quiet places." },
  { firstName: "Marie", lastName: "Dubois", nat: "FR", eng: "C1", days: 12, bio: "Last weeks here — let's make them count. Wine & board games." },
  { firstName: "Chen", lastName: "Wang", nat: "CN", eng: "B1", days: 90, bio: "Engineering student. Looking for study buddies and gym partners." },
  { firstName: "Elena", lastName: "Petrova", nat: "RU", eng: "B2", days: 30, bio: "Dancer and foodie. Show me the best spots on campus!" },
];

async function main() {
  const dorms = await prisma.dorm.findMany();
  if (dorms.length === 0) throw new Error("Esegui prima il seed dei dormitori (npm run db:seed)");
  const pinHash = await bcrypt.hash("1234", 10);

  // Account di test personale
  const meCode = "TEST-ME";
  await prisma.user.deleteMany({ where: { studentCode: meCode } });
  const mePhoto = await avatar("IO", 99);
  const me = await prisma.user.create({
    data: {
      studentCode: meCode,
      firstName: "Test",
      lastName: "User",
      email: "test-me@example.com",
      pinHash,
      birthDate: new Date("2002-05-10"),
      nationality: "IT",
      englishLevel: "B2",
      departureDate: new Date(Date.now() + 40 * 864e5),
      dormId: dorms[0].id,
      bio: "Test account",
      photos: { create: [{ url: mePhoto, order: 0 }] },
    },
  });

  let i = 0;
  for (const d of DEMO) {
    const code = `DEMO-${i}`;
    await prisma.user.deleteMany({ where: { studentCode: code } });
    const p1 = await avatar(d.firstName[0], i);
    const u = await prisma.user.create({
      data: {
        studentCode: code,
        firstName: d.firstName,
        lastName: d.lastName,
        email: `demo${i}@example.com`,
        pinHash,
        birthDate: new Date(2000 + (i % 6), i % 12, 1 + i),
        nationality: d.nat,
        englishLevel: d.eng,
        departureDate: new Date(Date.now() + d.days * 864e5),
        dormId: dorms[i % dorms.length].id,
        bio: d.bio,
        photos: { create: [{ url: p1, order: 0 }] },
      },
    });
    // L'utente demo mette like a "me": così basta che io ricambi per fare match
    await prisma.swipe.create({
      data: { fromUserId: u.id, toUserId: me.id, liked: true },
    });
    i++;
  }

  console.log(`Demo pronta: 6 utenti + account di test (codice ${meCode}, PIN 1234).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
