const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const REAL_USER_IDS = [
  "tLNcB9tMvjchGdQFJOBTAy87IrC2",
  "Ef9vjc2oAVYLui2tN8S7ZP2n6Yb2",
  "u1Xxd5UCJvRw93PHnqeHn4CRopy2",
  "MK7Df2dCi5Xc5QM5vIxLhKv39M22",
  "MxkgpcifJnQGZpnWpKlbL0luQz42",
  "FvvxwRRM7MWXQUWUjZmFTA6iPC82"
];

const SAMPLE_POLLS = [
  {
    title: "Favorite Programming Language",
    question: "What's your favorite programming language?",
    description: "Help us understand the most popular languages among developers",
    answers: ["JavaScript", "TypeScript", "Python", "Java", "C#"],
    deadline: admin.firestore.Timestamp.fromDate(new Date("2025-06-30T23:59:59.999Z")),
    startTime: admin.firestore.Timestamp.fromDate(new Date("2025-05-25T08:00:00.000Z")),
    isActive: true,
    realtime: false,
    created: admin.firestore.Timestamp.fromDate(new Date("2025-05-20T16:00:00.000Z")),
    createdBy: REAL_USER_IDS[0],
    results: ["0", "0", "0", "0", "0"],
    voted: [],
    voters: REAL_USER_IDS
  },
  {
    title: "Preferred Framework",
    question: "Which frontend framework do you prefer?",
    description: "We're deciding which framework to use for our next project",
    answers: ["Angular", "React", "Vue", "Svelte"],
    deadline: admin.firestore.Timestamp.fromDate(new Date("2025-06-25T23:59:59.999Z")),
    startTime: admin.firestore.Timestamp.fromDate(new Date("2025-06-01T08:00:00.000Z")),
    isActive: true,
    realtime: false,
    created: admin.firestore.Timestamp.fromDate(new Date("2025-05-19T16:00:00.000Z")),
    createdBy: REAL_USER_IDS[1],
    results: ["0", "0", "0", "0"],
    voted: [],
    voters: REAL_USER_IDS
  },
  {
    title: "Remote Work Preference",
    question: "What's your preferred work arrangement?",
    description: "Help shape our company's future work policy",
    answers: ["Fully remote", "Hybrid (2-3 days in office)", "Mostly in office", "Fully in office"],
    deadline: admin.firestore.Timestamp.fromDate(new Date("2025-06-20T23:59:59.999Z")),
    startTime: admin.firestore.Timestamp.fromDate(new Date("2025-05-20T08:00:00.000Z")),
    isActive: true,
    realtime: false,
    created: admin.firestore.Timestamp.fromDate(new Date("2025-05-18T16:00:00.000Z")),
    createdBy: REAL_USER_IDS[2],
    results: ["0", "0", "0", "0"],
    voted: [],
    voters: REAL_USER_IDS
  },
  {
    title: "Database Selection",
    question: "Which database should we use for our new application?",
    description: "We need to select a database for a high-traffic e-commerce site",
    answers: ["MongoDB", "PostgreSQL", "MySQL", "Firestore", "DynamoDB"],
    deadline: admin.firestore.Timestamp.fromDate(new Date("2025-06-15T23:59:59.999Z")),
    startTime: admin.firestore.Timestamp.fromDate(new Date("2025-05-25T08:00:00.000Z")),
    isActive: true,
    realtime: false,
    created: admin.firestore.Timestamp.fromDate(new Date("2025-05-17T16:00:00.000Z")),
    createdBy: REAL_USER_IDS[3],
    results: ["0", "0", "0", "0", "0"],
    voted: [],
    voters: REAL_USER_IDS
  },
  {
    title: "Office Location",
    question: "Where should we locate our new office?",
    description: "We're expanding and need to choose a new location",
    answers: ["Downtown", "Tech Park", "Suburb", "Mixed Use Development"],
    deadline: admin.firestore.Timestamp.fromDate(new Date("2025-06-10T23:59:59.999Z")),
    startTime: admin.firestore.Timestamp.fromDate(new Date("2025-05-25T08:00:00.000Z")),
    isActive: true,
    realtime: false,
    created: admin.firestore.Timestamp.fromDate(new Date("2025-05-16T16:00:00.000Z")),
    createdBy: REAL_USER_IDS[4],
    results: ["0", "0", "0", "0"],
    voted: [],
    voters: REAL_USER_IDS
  },
  {
    title: "Team Event",
    question: "What should we do for our quarterly team building?",
    description: "Vote on our next team activity",
    answers: ["Escape Room", "Outdoor Adventure", "Cooking Class", "Board Game Night", "Volunteering"],
    deadline: admin.firestore.Timestamp.fromDate(new Date("2025-05-15T23:59:59.999Z")),
    startTime: admin.firestore.Timestamp.fromDate(new Date("2025-05-05T08:00:00.000Z")),
    isActive: false,
    realtime: false,
    created: admin.firestore.Timestamp.fromDate(new Date("2025-05-01T16:00:00.000Z")),
    createdBy: REAL_USER_IDS[5],
    results: ["2", "1", "0", "3", "0"],
    voted: [REAL_USER_IDS[0], REAL_USER_IDS[1], REAL_USER_IDS[2]],
    voters: REAL_USER_IDS
  },
  {
    title: "Lunch Options",
    question: "Which restaurant should we order from for the team lunch?",
    description: "Friday team lunch selection",
    answers: ["Italian", "Mexican", "Indian", "Thai", "American"],
    deadline: admin.firestore.Timestamp.fromDate(new Date("2025-05-10T23:59:59.999Z")),
    startTime: admin.firestore.Timestamp.fromDate(new Date("2025-05-01T08:00:00.000Z")),
    isActive: false,
    realtime: false,
    created: admin.firestore.Timestamp.fromDate(new Date("2025-04-28T16:00:00.000Z")),
    createdBy: REAL_USER_IDS[0],
    results: ["1", "0", "2", "0", "0"],
    voted: [REAL_USER_IDS[3], REAL_USER_IDS[4], REAL_USER_IDS[5]],
    voters: REAL_USER_IDS
  },
  {
    title: "New Project Naming",
    question: "What should we name our new customer portal?",
    description: "Help us choose a name for our upcoming customer portal",
    answers: ["HubConnect", "ClientZone", "PortalPlus", "CustomerHQ"],
    deadline: admin.firestore.Timestamp.fromDate(new Date("2025-05-05T23:59:59.999Z")),
    startTime: admin.firestore.Timestamp.fromDate(new Date("2025-04-25T08:00:00.000Z")),
    isActive: false,
    realtime: false,
    created: admin.firestore.Timestamp.fromDate(new Date("2025-04-20T16:00:00.000Z")),
    createdBy: REAL_USER_IDS[1],
    results: ["1", "0", "2", "0"],
    voted: [REAL_USER_IDS[0], REAL_USER_IDS[2], REAL_USER_IDS[4]],
    voters: REAL_USER_IDS
  },
  {
    title: "Technology Stack Decision",
    question: "Which stack should we use for our new microservices?",
    description: "We're transitioning to microservices and need to decide on technologies",
    answers: ["Node.js + Express", "Spring Boot", "Django", ".NET Core", "Go + Gin"],
    deadline: admin.firestore.Timestamp.fromDate(new Date("2025-04-25T23:59:59.999Z")),
    startTime: admin.firestore.Timestamp.fromDate(new Date("2025-04-16T08:00:00.000Z")),
    isActive: false,
    realtime: false,
    created: admin.firestore.Timestamp.fromDate(new Date("2025-04-15T16:00:00.000Z")),
    createdBy: REAL_USER_IDS[2],
    results: ["0", "0", "0", "3", "0"],
    voted: [REAL_USER_IDS[1], REAL_USER_IDS[3], REAL_USER_IDS[5]],
    voters: REAL_USER_IDS
  },
  {
    title: "Conference Topic",
    question: "Which topic would you most like to learn about at our next tech conference?",
    description: "Planning next year's company tech conference",
    answers: ["AI/Machine Learning", "DevOps & CI/CD", "Cloud Architecture", "Frontend Development", "Security"],
    deadline: admin.firestore.Timestamp.fromDate(new Date("2025-04-15T23:59:59.999Z")),
    startTime: admin.firestore.Timestamp.fromDate(new Date("2025-04-05T08:00:00.000Z")),
    isActive: false,
    realtime: false,
    created: admin.firestore.Timestamp.fromDate(new Date("2025-04-01T16:00:00.000Z")),
    createdBy: REAL_USER_IDS[3],
    results: ["2", "0", "1", "0", "0"],
    voted: [REAL_USER_IDS[0], REAL_USER_IDS[2], REAL_USER_IDS[4]],
    voters: REAL_USER_IDS
  }
];

async function seedDatabase() {
  console.log('Seeding database with sample polls using real user IDs...');

  try {
    const batch = db.batch();
    const pollsRef = db.collection('polls');

    const existingPolls = await pollsRef.limit(1).get();

    for (const poll of SAMPLE_POLLS) {
      const newPollRef = pollsRef.doc();
      batch.set(newPollRef, poll);
      console.log(`Added poll: ${poll.title}`);
    }

    await batch.commit();
    console.log('Successfully added all polls!');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}

seedDatabase().then(() => {
  console.log('Database seeding completed.');
  process.exit(0);
}).catch(error => {
  console.error('Fatal error during seeding:', error);
  process.exit(1);
});
