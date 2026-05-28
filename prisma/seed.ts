import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const TOPICS = [
  { slug: "ateismo", name: "Ateísmo", description: "Debates sobre ateísmo, ceticismo e religião." },
  { slug: "religiao", name: "Religião", description: "Teologia, espiritualidade e tradições religiosas." },
  { slug: "filosofia", name: "Filosofia", description: "Ética, epistemologia, metafísica e correntes filosóficas." },
  { slug: "nodejs", name: "Node.js", description: "Runtime, ecossistema, performance e padrões em Node.js." },
  { slug: "ciencia", name: "Ciência", description: "Método científico, descobertas e divulgação científica." },
];

async function main() {
  for (const t of TOPICS) {
    await prisma.topic.upsert({
      where: { slug: t.slug },
      update: { name: t.name, description: t.description },
      create: t,
    });
  }
  console.log(`Seed concluído: ${TOPICS.length} assuntos.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
