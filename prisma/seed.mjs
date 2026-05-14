import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { createHash } from "node:crypto";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

function participantHash(seed) {
  return createHash("sha256").update(`demo-participant:${seed}`).digest("hex");
}

const ADMIN = "clujparticipa-team";

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
        toStatus: "UNDER_REVIEW",
        note: "Proposal entered technical evaluation. Team is checking feasibility, costs, and venue availability.",
        changedBy: ADMIN,
      },
      {
        fromStatus: "UNDER_REVIEW",
        toStatus: "ELIGIBLE",
        note: "Proposal declared eligible. Estimated cost: €7,200. Grigorescu Beach space is available and suitable.",
        changedBy: ADMIN,
      },
      {
        fromStatus: "ELIGIBLE",
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
        toStatus: "UNDER_REVIEW",
        note: "Proposal entered technical evaluation.",
        changedBy: ADMIN,
      },
      {
        fromStatus: "UNDER_REVIEW",
        toStatus: "ELIGIBLE",
        note: "Proposal eligible. Estimated cost: €22,000. Land available on the embankment, no conflict with other uses.",
        changedBy: ADMIN,
      },
      {
        fromStatus: "ELIGIBLE",
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
        toStatus: "UNDER_REVIEW",
        note: "Proposal entered evaluation.",
        changedBy: ADMIN,
      },
      {
        fromStatus: "UNDER_REVIEW",
        toStatus: "ELIGIBLE",
        note: "Proposal eligible. Estimated cost: €14,500. Weather-resistant street furniture options will be analyzed.",
        changedBy: ADMIN,
      },
      {
        fromStatus: "ELIGIBLE",
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
    status: "UNDER_REVIEW",
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
        toStatus: "UNDER_REVIEW",
        note: "Proposal is under technical and legal evaluation. Checking water access regulations and possible environmental restrictions.",
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
