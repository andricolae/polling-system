const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const USER_EMAILS = [
  "tudor.atodiresei45@gmail.com",
  "maritathurianna@gmail.com",
  "andreicalutiu@gmail.com",
  "maria.mi08@yahoo.com",
  "tudor.atodiresei@emeal.nttdata.com",
  "tovidiua@emeal.nttdata.com",
  "rares.suciu@emeal.nttdata.com",
  "andrebalanoiu67@gmail.com"
];

function getRandomEmail() {
  return USER_EMAILS[Math.floor(Math.random() * USER_EMAILS.length)];
}

function getRandomVotedEmails(count) {
  const shuffled = [...USER_EMAILS].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

const SAMPLE_POLLS = [
  {
    title: "Database Selection",
    question: "Which database should we use for our new application?",
    description: "We need to select a database for a high-traffic e-commerce site",
    answers: ["MongoDB", "PostgreSQL", "MySQL", "Firestore", "DynamoDB"],
    deadline: admin.firestore.Timestamp.fromDate(new Date("2025-06-15T23:59:59.999Z")),
    startTime: admin.firestore.Timestamp.fromDate(new Date("2025-05-25T08:00:00.000Z")),
    isActive: true,
    realtime: false,
    isPublic: true,
    pollType: "public_account_required",
    created: admin.firestore.Timestamp.fromDate(new Date("2025-05-17T16:00:00.000Z")),
    createdBy: getRandomEmail(),
    results: ["0", "0", "0", "0", "0"],
    voted: [],
    voters: []
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
    isPublic: false,
    pollType: "members_only",
    created: admin.firestore.Timestamp.fromDate(new Date("2025-05-16T16:00:00.000Z")),
    createdBy: getRandomEmail(),
    results: ["0", "0", "0", "0"],
    voted: [],
    voters: USER_EMAILS
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
    isPublic: true,
    pollType: "public_no_account",
    created: admin.firestore.Timestamp.fromDate(new Date("2025-05-01T16:00:00.000Z")),
    createdBy: getRandomEmail(),
    results: ["2", "1", "0", "3", "0"],
    voted: getRandomVotedEmails(6),
    voters: []
  },
  {
    title: "Favorite Frontend Framework",
    question: "Which frontend framework do you prefer for new projects?",
    description: "Community poll to see current preferences in web development",
    answers: ["React", "Angular", "Vue.js", "Svelte", "Next.js"],
    deadline: admin.firestore.Timestamp.fromDate(new Date("2025-06-25T23:59:59.999Z")),
    startTime: admin.firestore.Timestamp.fromDate(new Date("2025-06-12T08:00:00.000Z")),
    isActive: true,
    realtime: true,
    isPublic: true,
    created: admin.firestore.Timestamp.fromDate(new Date("2025-06-12T16:45:00.000Z")),
    createdBy: getRandomEmail(),
    results: ["12", "7", "4", "2", "5"],
    voted: getRandomVotedEmails(5),
    voters: []
  },
  {
    title: "Coffee vs Tea Debate",
    question: "What's your go-to morning beverage?",
    description: "The eternal workplace question - settle it once and for all!",
    answers: ["Coffee (Black)", "Coffee (With Milk)", "Tea", "Energy Drinks", "Just Water"],
    deadline: admin.firestore.Timestamp.fromDate(new Date("2025-08-01T23:59:59.999Z")),
    startTime: admin.firestore.Timestamp.fromDate(new Date("2025-06-11T08:00:00.000Z")),
    isActive: true,
    realtime: true,
    isPublic: true,
    created: admin.firestore.Timestamp.fromDate(new Date("2025-06-11T09:20:00.000Z")),
    createdBy: getRandomEmail(),
    results: ["18", "14", "9", "3", "6"],
    voted: getRandomVotedEmails(8),
    voters: []
  },
  {
    title: "Best Cloud Platform",
    question: "Which cloud platform do you recommend for enterprise applications?",
    description: "We're evaluating cloud providers for our next major deployment",
    answers: ["AWS", "Google Cloud Platform", "Microsoft Azure", "DigitalOcean", "Vercel"],
    deadline: admin.firestore.Timestamp.fromDate(new Date("2025-07-15T23:59:59.999Z")),
    startTime: admin.firestore.Timestamp.fromDate(new Date("2025-06-10T08:00:00.000Z")),
    isActive: true,
    realtime: false,
    isPublic: false,
    created: admin.firestore.Timestamp.fromDate(new Date("2025-06-10T11:00:00.000Z")),
    createdBy: getRandomEmail(),
    results: ["3", "1", "2", "0", "1"],
    voted: getRandomVotedEmails(3),
    voters: USER_EMAILS
  },
  {
    title: "Weekend Activity Preference",
    question: "How do you prefer to spend your weekends?",
    description: "Just curious about our community's lifestyle preferences",
    answers: ["Outdoor Adventures", "Coding Side Projects", "Reading", "Gaming", "Social Events", "Relaxing at Home"],
    deadline: admin.firestore.Timestamp.fromDate(new Date("2025-06-18T23:59:59.999Z")),
    startTime: admin.firestore.Timestamp.fromDate(new Date("2025-06-09T08:00:00.000Z")),
    isActive: false,
    realtime: false,
    isPublic: true,
    created: admin.firestore.Timestamp.fromDate(new Date("2025-06-09T13:30:00.000Z")),
    createdBy: getRandomEmail(),
    results: ["8", "12", "6", "10", "4", "15"],
    voted: getRandomVotedEmails(6),
    voters: []
  }
];

async function seedDatabase() {
  console.log('Seeding database with sample polls including isPublic field...');

  try {
    const batch = db.batch();
    const pollsRef = db.collection('polls');

    // const existingPolls = await pollsRef.get();
    // if (!existingPolls.empty) {
    //   console.log('Clearing existing polls...');
    //   existingPolls.docs.forEach(doc => {
    //     batch.delete(doc.ref);
    //   });
    // }

    for (const poll of SAMPLE_POLLS) {
      const newPollRef = pollsRef.doc();
      batch.set(newPollRef, poll);
      console.log(`Added poll: ${poll.title} (Public: ${poll.isPublic}, Active: ${poll.isActive})`);
    }

    await batch.commit();
    console.log('Successfully added all polls!');
    console.log(`Total polls created: ${SAMPLE_POLLS.length}`);
    console.log(`Public polls: ${SAMPLE_POLLS.filter(p => p.isPublic).length}`);
    console.log(`Active public polls: ${SAMPLE_POLLS.filter(p => p.isPublic && p.isActive).length}`);
    console.log(`Closed public polls: ${SAMPLE_POLLS.filter(p => p.isPublic && !p.isActive).length}`);
    console.log(`Users who can vote on private polls: ${USER_EMAILS.join(', ')}`);
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}

seedDatabase().then(() => {
  console.log('Database seeding completed.');
  console.log('\n--- Poll Summary ---');
  SAMPLE_POLLS.forEach((poll, index) => {
    const totalVotes = poll.results.reduce((sum, votes) => sum + parseInt(votes), 0);
    console.log(`${index + 1}. ${poll.title}`);
    console.log(`   Public: ${poll.isPublic ? 'Yes' : 'No'} | Active: ${poll.isActive ? 'Yes' : 'No'} | Votes: ${totalVotes}`);
  });
  process.exit(0);
}).catch(error => {
  console.error('Fatal error during seeding:', error);
  process.exit(1);
});
