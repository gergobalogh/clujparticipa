import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { createHash } from "node:crypto";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

function participantHash(seed) {
  return createHash("sha256").update(`demo-participant:${seed}`).digest("hex");
}

const ADMIN = "echipa-clujparticipa";

const seedImages = [
  { path: "https://imagedelivery.net/placeholder/seed-1/public", alt: "Imagine demonstrativă", width: 800, height: 600, mimeType: "image/png", sizeBytes: 204800 },
  { path: "https://imagedelivery.net/placeholder/seed-2/public", alt: "Imagine demonstrativă", width: 800, height: 600, mimeType: "image/png", sizeBytes: 204800 },
  { path: "https://imagedelivery.net/placeholder/seed-3/public", alt: "Imagine demonstrativă", width: 800, height: 600, mimeType: "image/png", sizeBytes: 204800 },
  { path: "https://imagedelivery.net/placeholder/seed-4/public", alt: "Imagine demonstrativă", width: 800, height: 600, mimeType: "image/png", sizeBytes: 204800 },
  { path: "https://imagedelivery.net/placeholder/seed-5/public", alt: "Imagine demonstrativă", width: 800, height: 600, mimeType: "image/png", sizeBytes: 204800 },
  { path: "https://imagedelivery.net/placeholder/seed-6/public", alt: "Imagine demonstrativă", width: 800, height: 600, mimeType: "image/png", sizeBytes: 204800 },
  { path: "https://imagedelivery.net/placeholder/seed-7/public", alt: "Imagine demonstrativă", width: 800, height: 600, mimeType: "image/png", sizeBytes: 204800 },
];

// Which ideas get images: idea index -> array of seedImages indices (0-based)
const ideaImageMap = {
  0: [0, 1, 2],
  1: [3],
  2: [4, 5],
  3: [6],
  4: [0],
};

const ideas = [
  {
    title: "Cinema în aer liber la Plaja Grigorescu",
    description:
      "Organizarea unei serii de proiecții de film în aer liber pe malul Someșului, la Plaja Grigorescu. Intrare liberă, echipament de proiecție și licențe asigurate de Primărie. Participanții își aduc pături și scaune. Model inspirat din programele similare de la TIFF și din experiența Vantaa (Finlanda).",
    category: "CULTURE",
    district: "GRIGORESCU",
    status: "COMPLETED",
    latitude: 46.7695,
    longitude: 23.6148,
    statusChanges: [
      {
        fromStatus: null,
        toStatus: "SUBMITTED",
        note: "Propunere depusă de un locuitor din Grigorescu.",
        changedBy: ADMIN,
      },
      {
        fromStatus: "SUBMITTED",
        toStatus: "UNDER_REVIEW",
        note: "Propunerea a intrat în evaluare tehnică. Echipa verifică fezabilitatea, costurile și disponibilitatea spațiului.",
        changedBy: ADMIN,
      },
      {
        fromStatus: "UNDER_REVIEW",
        toStatus: "ELIGIBLE",
        note: "Propunere declarată eligibilă. Cost estimat: 7.200 €. Spațiul Plaja Grigorescu este disponibil și potrivit.",
        changedBy: ADMIN,
      },
      {
        fromStatus: "ELIGIBLE",
        toStatus: "IN_VOTING",
        note: "Propunerea este deschisă la vot public pentru 30 de zile.",
        changedBy: ADMIN,
      },
      {
        fromStatus: "IN_VOTING",
        toStatus: "SELECTED",
        note: "Propunerea a câștigat votul public cu 47 de susțineri. Finanțare aprobată.",
        changedBy: ADMIN,
      },
      {
        fromStatus: "SELECTED",
        toStatus: "IN_PROGRESS",
        note: "Contract semnat cu organizatorul. Prima proiecție planificată pentru 18 iulie.",
        changedBy: ADMIN,
      },
      {
        fromStatus: "IN_PROGRESS",
        toStatus: "COMPLETED",
        note: "Trei proiecții organizate în iulie–august. Peste 320 de participanți. Proiect finalizat cu succes.",
        changedBy: ADMIN,
      },
    ],
    votes: 47,
    comments: [
      {
        text: "Exact ce lipsea pe malul Someșului. Sper să devină o tradiție anuală!",
        participantSeed: "c1-1",
        status: "VISIBLE",
      },
      {
        text: "Am fost la prima proiecție — atmosfera a fost fantastică. Felicitări echipei!",
        participantSeed: "c1-2",
        status: "VISIBLE",
      },
      {
        text: "Când vine ediția 2026? Așteptăm cu nerăbdare.",
        participantSeed: "c1-3",
        status: "VISIBLE",
      },
    ],
  },
  {
    title: "Parc de calisthenics pe faleza Someșului, zona Grigorescu",
    description:
      "Amenajarea unui parc de calisthenics cu bare fixe, paralele și echipamente de fitness pe faleza Someșului în zona Grigorescu. Inspirat de parcul similar de pe malul Begăi din Timișoara. Acces gratuit, deschis publicului larg, cu echipamente pentru toate nivelurile de fitness.",
    category: "HEALTH",
    district: "GRIGORESCU",
    status: "IN_PROGRESS",
    latitude: 46.7702,
    longitude: 23.6095,
    statusChanges: [
      {
        fromStatus: null,
        toStatus: "SUBMITTED",
        note: "Propunere depusă de un grup de locuitori din Grigorescu.",
        changedBy: ADMIN,
      },
      {
        fromStatus: "SUBMITTED",
        toStatus: "UNDER_REVIEW",
        note: "Propunerea a intrat în evaluare tehnică.",
        changedBy: ADMIN,
      },
      {
        fromStatus: "UNDER_REVIEW",
        toStatus: "ELIGIBLE",
        note: "Propunere eligibilă. Cost estimat: 22.000 €. Teren disponibil pe faleză, fără conflict cu alte utilizări.",
        changedBy: ADMIN,
      },
      {
        fromStatus: "ELIGIBLE",
        toStatus: "IN_VOTING",
        note: "Propunerea este deschisă la vot public.",
        changedBy: ADMIN,
      },
      {
        fromStatus: "IN_VOTING",
        toStatus: "SELECTED",
        note: "Propunerea a câștigat cu 31 de susțineri. Finanțare aprobată.",
        changedBy: ADMIN,
      },
      {
        fromStatus: "SELECTED",
        toStatus: "IN_PROGRESS",
        note: "Licitație finalizată. Lucrările de instalare au început. Finalizare estimată: septembrie.",
        changedBy: ADMIN,
      },
    ],
    votes: 31,
    comments: [
      {
        text: "Timișoara are deja asta pe Bega. E timpul și pentru Cluj pe Someș.",
        participantSeed: "c2-1",
        status: "VISIBLE",
      },
      {
        text: "Important să fie echipamente și pentru seniori, nu doar pentru tineri.",
        participantSeed: "c2-2",
        status: "VISIBLE",
      },
    ],
  },
  {
    title: "Structuri de umbră și zone de odihnă pe malul Someșului",
    description:
      "Instalarea de structuri de umbră (pergole sau voile), bănci și coșuri de gunoi pe faleza Someșului în zona Mărăști. Verile din Cluj sunt tot mai calde, iar malul râului este practic inutilizabil în orele de vârf fără infrastructură de umbră. Proiecte similare au fost finanțate prin bugetare participativă în Riga și Cambridge.",
    category: "ENVIRONMENT",
    district: "MARASTI",
    status: "IN_VOTING",
    latitude: 46.7738,
    longitude: 23.5715,
    statusChanges: [
      {
        fromStatus: null,
        toStatus: "SUBMITTED",
        note: "Propunere depusă de o locuitoare din Mărăști.",
        changedBy: ADMIN,
      },
      {
        fromStatus: "SUBMITTED",
        toStatus: "UNDER_REVIEW",
        note: "Propunerea a intrat în evaluare.",
        changedBy: ADMIN,
      },
      {
        fromStatus: "UNDER_REVIEW",
        toStatus: "ELIGIBLE",
        note: "Propunere eligibilă. Cost estimat: 14.500 €. Se vor analiza și opțiunile de mobilier urban rezistent la intemperii.",
        changedBy: ADMIN,
      },
      {
        fromStatus: "ELIGIBLE",
        toStatus: "IN_VOTING",
        note: "Propunerea este deschisă la vot public.",
        changedBy: ADMIN,
      },
    ],
    votes: 18,
    comments: [
      {
        text: "Vara trecută era imposibil să stai pe malul Someșului după ora 12 fără umbră. Această propunere e necesară.",
        participantSeed: "c3-1",
        status: "VISIBLE",
      },
      {
        text: "Susțin, dar aș include și câteva coșuri de gunoi suplimentare în zonă.",
        participantSeed: "c3-2",
        status: "VISIBLE",
      },
    ],
  },
  {
    title: "Pontoane pentru caiac și SUP sezonier la Plaja Grigorescu",
    description:
      "Amenajarea unui punct de acces la apă cu pontoane flotante pentru caiac, SUP (stand-up paddleboard) și alte activități nautice neMotorizate, activ în sezonul estival (mai–septembrie). Include și posibilitatea unui serviciu de închiriere gestionat de un operator local.",
    category: "CULTURE",
    district: "GRIGORESCU",
    status: "UNDER_REVIEW",
    latitude: 46.7690,
    longitude: 23.6160,
    statusChanges: [
      {
        fromStatus: null,
        toStatus: "SUBMITTED",
        note: "Propunere depusă de un grup de entuziaști de sporturi nautice.",
        changedBy: ADMIN,
      },
      {
        fromStatus: "SUBMITTED",
        toStatus: "UNDER_REVIEW",
        note: "Propunerea este în evaluare tehnică și juridică. Se verifică reglementările privind accesul la cursul de apă și posibilele restricții de mediu.",
        changedBy: ADMIN,
      },
    ],
    votes: 12,
    comments: [
      {
        text: "Excelent! Ar trebui incluse și cursuri de inițiere pentru copii în parteneriat cu o școală de caiac.",
        participantSeed: "c4-1",
        status: "VISIBLE",
      },
    ],
  },
  {
    title: "Pietonal temporar pe malul stâng al Someșului în weekenduri",
    description:
      "Închiderea temporară a drumului de pe malul stâng al Someșului pentru traficul auto în weekenduri (sâmbătă–duminică, mai–septembrie), transformând zona într-un spațiu pietonal și ciclist. Model aplicat cu succes în orașe europene precum Viena (Ringstrasse) și Paris (malurile Senei).",
    category: "TRANSPORT",
    district: "CENTRU",
    status: "SUBMITTED",
    latitude: 46.7755,
    longitude: 23.5940,
    statusChanges: [
      {
        fromStatus: null,
        toStatus: "SUBMITTED",
        note: "Propunere depusă. Urmează evaluarea inițială.",
        changedBy: ADMIN,
      },
    ],
    votes: 3,
    comments: [
      {
        text: "Viena face asta pe Ringstrasse, Paris pe malurile Senei. De ce nu și Cluj pe Someș?",
        participantSeed: "c5-1",
        status: "VISIBLE",
      },
    ],
  },
];

async function main() {
  await prisma.moderationEvent.deleteMany();
  await prisma.statusChange.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.vote.deleteMany();
  await prisma.idea.deleteMany();

  for (const [index, idea] of ideas.entries()) {
    const { statusChanges, votes, comments, ...ideaData } = idea;

    const created = await prisma.idea.create({
      data: {
        ...ideaData,
        statusChanges: {
          create: statusChanges,
        },
      },
    });

    await prisma.vote.createMany({
      data: Array.from({ length: votes }, (_, voteIndex) => ({
        ideaId: created.id,
        participantHash: participantHash(`idea-${index}-vote-${voteIndex}`),
        direction: "SUPPORT",
      })),
    });

    for (const [commentIndex, comment] of comments.entries()) {
      await prisma.comment.create({
        data: {
          ideaId: created.id,
          participantHash: participantHash(
            `idea-${index}-comment-${commentIndex}-${comment.participantSeed}`
          ),
          text: comment.text,
          status: comment.status,
        },
      });
    }

    // Attach seed images
    if (ideaImageMap[index]) {
      const imageRecords = ideaImageMap[index].map((imgIdx, order) => ({
        url: seedImages[imgIdx].path,
        alt: seedImages[imgIdx].alt,
        width: seedImages[imgIdx].width,
        height: seedImages[imgIdx].height,
        mimeType: seedImages[imgIdx].mimeType,
        sizeBytes: seedImages[imgIdx].sizeBytes,
        order,
        ideaId: created.id,
      }));
      await prisma.ideaImage.createMany({ data: imageRecords });
    }
  }

  await prisma.moderationEvent.create({
    data: {
      targetType: "IDEA",
      targetId: "seed-dataset",
      action: "STATUS_CHANGE",
      reason: "Date demonstrative create pentru validarea prototipului ClujParticipa.",
      changedBy: ADMIN,
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
