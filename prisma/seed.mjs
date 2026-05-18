import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

function participantHash(seed) {
  return createHash("sha256").update(`demo-participant:${seed}`).digest("hex");
}

const ADMIN = "clujparticipa-team";
const seedImageManifestPath = new URL("../public/seed/manifest.json", import.meta.url);
const seedImageManifest = existsSync(seedImageManifestPath)
  ? JSON.parse(readFileSync(seedImageManifestPath, "utf8"))
  : {};

const seedImages = [
  { path: "https://imagedelivery.net/placeholder/seed-1/public", alt: "Demo image", width: 800, height: 600, mimeType: "image/png", sizeBytes: 204800 },
  { path: "https://imagedelivery.net/placeholder/seed-2/public", alt: "Demo image", width: 800, height: 600, mimeType: "image/png", sizeBytes: 204800 },
  { path: "https://imagedelivery.net/placeholder/seed-3/public", alt: "Demo image", width: 800, height: 600, mimeType: "image/png", sizeBytes: 204800 },
  { path: "https://imagedelivery.net/placeholder/seed-4/public", alt: "Demo image", width: 800, height: 600, mimeType: "image/png", sizeBytes: 204800 },
  { path: "https://imagedelivery.net/placeholder/seed-5/public", alt: "Demo image", width: 800, height: 600, mimeType: "image/png", sizeBytes: 204800 },
  { path: "https://imagedelivery.net/placeholder/seed-6/public", alt: "Demo image", width: 800, height: 600, mimeType: "image/png", sizeBytes: 204800 },
  { path: "https://imagedelivery.net/placeholder/seed-7/public", alt: "Demo image", width: 800, height: 600, mimeType: "image/png", sizeBytes: 204800 },
];

const ideaImageMap = {
  0: [0, 1, 2],
  1: [3],
  2: [4, 5],
  3: [6],
  4: [0],
  5: [1, 4],
  6: [2, 5],
  7: [3],
};

const ideas = [
  {
    title: "Outdoor cinema at Grigorescu Beach",
    description:
      "Organizing a series of outdoor film screenings on the banks of the Someș River at Grigorescu Beach. Free entry, projection equipment, and licenses provided by the City Hall. Participants bring their own blankets and chairs. Model inspired by similar programs at TIFF and the Vantaa experience (Finland).",
    category: "CULTURE",
    district: "GRIGORESCU",
    status: "COMPLETED",
    latitude: 46.7695,
    longitude: 23.6148,
    statusChanges: [
      {
        fromStatus: null,
        toStatus: "SUBMITTED",
        note: "Proposal submitted by a Grigorescu resident.",
        changedBy: ADMIN,
      },
      {
        fromStatus: "SUBMITTED",
        toStatus: "IN_VOTING",
        note: "Proposal is open for public voting for 30 days.",
        changedBy: ADMIN,
      },
      {
        fromStatus: "IN_VOTING",
        toStatus: "SELECTED",
        note: "Proposal won the public vote with 47 supports. Funding approved.",
        changedBy: ADMIN,
      },
      {
        fromStatus: "SELECTED",
        toStatus: "ACCEPTED",
        note: "Proposal accepted by the municipal committee. Budget allocated.",
        changedBy: ADMIN,
      },
      {
        fromStatus: "ACCEPTED",
        toStatus: "IN_PROGRESS",
        note: "Contract signed with the organizer. First screening planned for July 18.",
        changedBy: ADMIN,
      },
      {
        fromStatus: "IN_PROGRESS",
        toStatus: "COMPLETED",
        note: "Three screenings organized in July–August. Over 320 participants. Project successfully completed.",
        changedBy: ADMIN,
      },
    ],
    votes: 47,
    comments: [
      {
        text: "Exactly what was missing on the Someș banks. Hope it becomes an annual tradition!",
        participantSeed: "c1-1",
        status: "VISIBLE",
      },
      {
        text: "I was at the first screening — the atmosphere was fantastic. Congratulations to the team!",
        participantSeed: "c1-2",
        status: "VISIBLE",
      },
      {
        text: "When is the 2026 edition? Looking forward to it.",
        participantSeed: "c1-3",
        status: "VISIBLE",
      },
    ],
  },
  {
    title: "Calisthenics park on the Someș embankment, Grigorescu area",
    description:
      "Developing a calisthenics park with pull-up bars, parallel bars, and fitness equipment on the Someș embankment in the Grigorescu area. Inspired by the similar park on the Bega embankment in Timișoara. Free access, open to the general public, with equipment for all fitness levels.",
    category: "HEALTH",
    district: "GRIGORESCU",
    status: "IN_PROGRESS",
    latitude: 46.7702,
    longitude: 23.6095,
    statusChanges: [
      {
        fromStatus: null,
        toStatus: "SUBMITTED",
        note: "Proposal submitted by a group of Grigorescu residents.",
        changedBy: ADMIN,
      },
      {
        fromStatus: "SUBMITTED",
        toStatus: "IN_VOTING",
        note: "Proposal is open for public voting.",
        changedBy: ADMIN,
      },
      {
        fromStatus: "IN_VOTING",
        toStatus: "SELECTED",
        note: "Proposal won with 31 supports. Funding approved.",
        changedBy: ADMIN,
      },
      {
        fromStatus: "SELECTED",
        toStatus: "ACCEPTED",
        note: "Proposal accepted. Budget allocated for implementation.",
        changedBy: ADMIN,
      },
      {
        fromStatus: "ACCEPTED",
        toStatus: "IN_PROGRESS",
        note: "Auction completed. Installation works have started. Estimated completion: September.",
        changedBy: ADMIN,
      },
    ],
    votes: 31,
    comments: [
      {
        text: "Timișoara already has this on the Bega. It's time for Cluj on the Someș too.",
        participantSeed: "c2-1",
        status: "VISIBLE",
      },
      {
        text: "Important to have equipment for seniors as well, not just for youth.",
        participantSeed: "c2-2",
        status: "VISIBLE",
      },
    ],
  },
  {
    title: "Shade structures and seating areas on the Someș embankment",
    description:
      "Installing shade structures (pergolas or sails), benches, and trash bins on the Someș embankment in the Mărăști area. Summers in Cluj are getting hotter, and the riverbank is practically unusable during peak hours without shade infrastructure. Similar projects have been funded through participatory budgeting in Riga and Cambridge.",
    category: "ENVIRONMENT",
    district: "MARASTI",
    status: "IN_VOTING",
    latitude: 46.7738,
    longitude: 23.5715,
    statusChanges: [
      {
        fromStatus: null,
        toStatus: "SUBMITTED",
        note: "Proposal submitted by a Mărăști resident.",
        changedBy: ADMIN,
      },
      {
        fromStatus: "SUBMITTED",
        toStatus: "IN_VOTING",
        note: "Proposal is open for public voting.",
        changedBy: ADMIN,
      },
    ],
    votes: 18,
    comments: [
      {
        text: "Last summer it was impossible to stay on the Someș bank after 12 PM without shade. This proposal is necessary.",
        participantSeed: "c3-1",
        status: "VISIBLE",
      },
      {
        text: "I support this, but I would also include some additional trash bins in the area.",
        participantSeed: "c3-2",
        status: "VISIBLE",
      },
    ],
  },
  {
    title: "Kayaking and SUP seasonal access point at Grigorescu Beach",
    description:
      "Setting up a water access point with floating docks for kayaking, SUP (stand-up paddleboarding), and other non-motorized nautical activities, active during the summer season (May–September). Includes the possibility of a rental service managed by a local operator.",
    category: "CULTURE",
    district: "GRIGORESCU",
    status: "IN_VOTING",
    latitude: 46.7690,
    longitude: 23.6160,
    statusChanges: [
      {
        fromStatus: null,
        toStatus: "SUBMITTED",
        note: "Proposal submitted by a group of water sports enthusiasts.",
        changedBy: ADMIN,
      },
      {
        fromStatus: "SUBMITTED",
        toStatus: "IN_VOTING",
        note: "Proposal is open for public voting. Checking water access regulations and possible environmental restrictions.",
        changedBy: ADMIN,
      },
    ],
    votes: 12,
    comments: [
      {
        text: "Excellent! We should also include introductory courses for children in partnership with a kayaking school.",
        participantSeed: "c4-1",
        status: "VISIBLE",
      },
    ],
  },
  {
    title: "Temporary weekend pedestrian zone on the left bank of the Someș",
    description:
      "Temporarily closing the road on the left bank of the Someș for car traffic on weekends (Saturday–Sunday, May–September), transforming the area into a pedestrian and cycling space. Model successfully applied in European cities like Vienna (Ringstrasse) and Paris (banks of the Seine).",
    category: "TRANSPORT",
    district: "CENTRU",
    status: "SUBMITTED",
    latitude: 46.766329971734244,
    longitude: 23.554104145941157,
    statusChanges: [
      {
        fromStatus: null,
        toStatus: "SUBMITTED",
        note: "Proposal submitted. Initial evaluation follows.",
        changedBy: ADMIN,
      },
    ],
    votes: 3,
    comments: [
      {
        text: "Vienna does this on Ringstrasse, Paris on the Seine banks. Why not Cluj on the Someș too?",
        participantSeed: "c5-1",
        status: "VISIBLE",
      },
    ],
  },
  {
    title: "Community garden in the Manastur district",
    description:
      "Creating a community garden with raised beds, a tool shed, and a rainwater collection system in the Manastur district. Residents can apply for individual plots to grow vegetables and herbs. The project includes composting stations and educational workshops on urban agriculture.",
    category: "ENVIRONMENT",
    district: "MANASTUR",
    status: "MERGED",
    latitude: 46.7580,
    longitude: 23.5450,
    statusChanges: [
      {
        fromStatus: null,
        toStatus: "SUBMITTED",
        note: "Proposal submitted by a Manastur resident.",
        changedBy: ADMIN,
      },
      {
        fromStatus: "SUBMITTED",
        toStatus: "IN_VOTING",
        note: "Proposal is open for public voting.",
        changedBy: ADMIN,
      },
      {
        fromStatus: "IN_VOTING",
        toStatus: "MERGED",
        note: "Merged with idea #[idea0Id] — outdoor cinema at Grigorescu Beach covers a similar green community space initiative. Combined resources for a larger impact.",
        changedBy: ADMIN,
      },
    ],
    votes: 8,
    comments: [
      {
        text: "Great idea for Manastur! We need more green spaces in the district.",
        participantSeed: "c6-1",
        status: "VISIBLE",
      },
    ],
  },
  {
    title: "Bike repair stations along the Someș corridor",
    description:
      "Installing self-service bike repair stations with basic tools, a tire pump, and a QR-code linked video tutorial at five points along the Someș corridor. Aimed at cyclists commuting between the city center and residential areas. Model based on similar stations in Amsterdam and Copenhagen.",
    category: "TRANSPORT",
    district: "CENTRU",
    status: "NEEDS_REVISION",
    latitude: 46.7650,
    longitude: 23.5580,
    statusChanges: [
      {
        fromStatus: null,
        toStatus: "SUBMITTED",
        note: "Proposal submitted by a cycling advocacy group.",
        changedBy: ADMIN,
      },
      {
        fromStatus: "SUBMITTED",
        toStatus: "IN_VOTING",
        note: "Proposal is open for public voting.",
        changedBy: ADMIN,
      },
      {
        fromStatus: "IN_VOTING",
        toStatus: "SELECTED",
        note: "Proposal selected with 22 supports.",
        changedBy: ADMIN,
      },
      {
        fromStatus: "SELECTED",
        toStatus: "NEEDS_REVISION",
        note: "Feedback: The proposed locations overlap with existing municipal repair points. Please revise the site selection to avoid duplication and include a maintenance plan for the stations.",
        changedBy: ADMIN,
      },
    ],
    votes: 22,
    comments: [
      {
        text: "Very useful for daily commuters. The Someș corridor is the main cycling route.",
        participantSeed: "c7-1",
        status: "VISIBLE",
      },
      {
        text: "Make sure the tools are vandalism-resistant and weatherproof.",
        participantSeed: "c7-2",
        status: "VISIBLE",
      },
    ],
  },
  {
    title: "Dog park in Zorilor district",
    description:
      "Building a fenced off-leash dog park with separate areas for small and large dogs, agility equipment, waste bag dispensers, and shaded benches for owners in the Zorilor district. Currently, dog owners have no designated public space in the area.",
    category: "OTHER",
    district: "ZORILOR",
    status: "WITHDRAWN",
    latitude: 46.7520,
    longitude: 23.5620,
    statusChanges: [
      {
        fromStatus: null,
        toStatus: "SUBMITTED",
        note: "Proposal submitted by a Zorilor dog owner.",
        changedBy: "citizen:a1b2c3",
      },
      {
        fromStatus: "SUBMITTED",
        toStatus: "WITHDRAWN",
        note: "Withdrawn by the submitter. A similar private dog park opened nearby, reducing the need for a public one.",
        changedBy: "citizen:a1b2c3",
      },
    ],
    votes: 5,
    comments: [],
  },
  {
    seedKey: "manastur-trasee-scolare-protejate",
    title: "Trasee pietonale protejate pentru școlile din Mănăștur",
    description:
      "Amenajarea unor trasee pietonale sigure către școlile din Mănăștur, cu treceri de pietoni supraînălțate, zone de 30 km/h, trotuare lărgite și un sistem de tip \"oprește la distanță + mers protejat\". Părinții ar opri la 1-2 străzi de școală, iar copiii ar parcurge în siguranță ultimii 100-300 de metri pe jos. Astfel, zona din fața școlilor poate deveni în mare parte pietonală, fără a încerca să înghesuim sute de mașini direct la porți, pe străzi deja înguste.",
    category: "SAFETY",
    district: "MANASTUR",
    status: "SUBMITTED",
    latitude: 46.7526,
    longitude: 23.5487,
    statusChanges: [
      {
        fromStatus: null,
        toStatus: "SUBMITTED",
        note: "Propunere depusă pentru cartierul Mănăștur. Urmează evaluarea inițială a traseelor școlare și a punctelor de oprire la distanță.",
        changedBy: ADMIN,
      },
    ],
    votes: 14,
    comments: [
      {
        text: "În fața școlilor e aglomerație în fiecare dimineață. O zonă de oprire la distanță ar face intrarea mult mai sigură pentru copii.",
        participantSeed: "c9-1",
        status: "VISIBLE",
      },
      {
        text: "Important să fie incluse treceri supraînălțate și limită reală de 30 km/h, nu doar indicatoare.",
        participantSeed: "c9-2",
        status: "VISIBLE",
      },
    ],
  },
  {
    seedKey: "canalul-morii-master-plan",
    title: "Master Plan prin Master Process pentru coridorul pietonal Canalul Morii",
    description:
      "Realizarea unui proces public de planificare pentru transformarea Canalului Morii într-un coridor pietonal și verde pe cât mai multe tronsoane între Plopilor și Iris, de la Someșul Mic spre zonele traversate de canal. Propunerea pornește de la campania grupului civic Verde pe Canalul Morii și implică studenți la arhitectură, locuitori, specialiști și administrația locală. Scopul este un master plan construit printr-un master process: cartarea traseului, identificarea blocajelor, prioritizarea intervențiilor mici și stabilirea unor reguli coerente pentru spațiu public, acces pietonal, vegetație, mobilier urban și legături cu cartierele.",
    category: "ENVIRONMENT",
    district: "CENTRU",
    status: "UNDER_REVIEW",
    latitude: 46.7731,
    longitude: 23.5942,
    statusChanges: [
      {
        fromStatus: null,
        toStatus: "SUBMITTED",
        note: "Propunere depusă pentru valorificarea Canalului Morii ca traseu pietonal și verde.",
        changedBy: ADMIN,
      },
      {
        fromStatus: "SUBMITTED",
        toStatus: "UNDER_REVIEW",
        note: "În evaluare pentru clarificarea tronsoanelor prioritare, a proprietății terenurilor și a cadrului de colaborare cu locuitorii și mediul universitar.",
        changedBy: ADMIN,
      },
    ],
    votes: 21,
    comments: [
      {
        text: "Canalul Morii poate lega cartierele printr-un traseu plăcut, nu doar prin intervenții izolate.",
        participantSeed: "c10-1",
        status: "VISIBLE",
      },
      {
        text: "E important ca locuitorii de pe traseu să fie consultați din prima etapă, altfel planul rămâne doar pe hârtie.",
        participantSeed: "c10-2",
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

  const createdIdeaIds = [];

  for (const [index, idea] of ideas.entries()) {
    const { seedKey, statusChanges, votes, comments, ...ideaData } = idea;

    // For idea 5 (MERGED), we need to set mergedIntoIdeaId after idea 0 is created
    const createData = { ...ideaData };
    if (index === 5) {
      // Will update mergedIntoIdeaId after idea 0 is created
      // Remove mergedIntoIdeaId from createData for now, will set after
    }

    const created = await prisma.idea.create({
      data: {
        ...createData,
        statusChanges: {
          create: statusChanges,
        },
      },
    });

    createdIdeaIds.push(created.id);

    // For idea 5 (MERGED), set mergedIntoIdeaId to idea 0's ID
    if (index === 5 && createdIdeaIds[0]) {
      await prisma.idea.update({
        where: { id: created.id },
        data: { mergedIntoIdeaId: createdIdeaIds[0] },
      });
    }

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
    const manifestImages = seedImageManifest[seedKey ?? `idea-${index}`];
    if (manifestImages?.length) {
      const imageRecords = manifestImages.map((image, order) => ({
        url: image.url,
        alt: image.alt ?? created.title,
        width: image.width ?? null,
        height: image.height ?? null,
        mimeType: image.mimeType,
        sizeBytes: image.sizeBytes,
        order,
        ideaId: created.id,
      }));
      await prisma.ideaImage.createMany({ data: imageRecords });
    } else if (ideaImageMap[index]) {
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
      reason: "Demonstration data created for validating the ClujParticipa prototype.",
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
