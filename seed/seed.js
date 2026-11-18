const path = require('path');
module.paths.push(path.resolve(__dirname, '../server/node_modules'));
require('dotenv').config({ path: path.resolve(__dirname, '../server/.env') });
const mongoose = require('mongoose');
const User = require('../server/src/models/User');
const Expo = require('../server/src/models/Expo');
const Booth = require('../server/src/models/Booth');
const ExhibitorProfile = require('../server/src/models/ExhibitorProfile');
const ExhibitorApplication = require('../server/src/models/ExhibitorApplication');
const Notification = require('../server/src/models/Notification');
const Session = require('../server/src/models/Session');
const Registration = require('../server/src/models/Registration');
const Message = require('../server/src/models/Message');

const seedUsers = [
  {
    name: 'EventSphere Super Admin',
    email: 'admin@eventsphere.com',
    password: 'Password123!',
    role: 'admin',
    phone: '+1 (555) 019-2834',
    consentGiven: true,
    consentTimestamp: new Date(),
  },
  {
    name: 'TechNova Solutions (Exhibitor)',
    email: 'exhibitor1@eventsphere.com',
    password: 'Password123!',
    role: 'exhibitor',
    phone: '+1 (555) 014-9988',
    consentGiven: true,
    consentTimestamp: new Date(),
  },
  {
    name: 'Apex Robotics Inc. (Exhibitor)',
    email: 'exhibitor2@eventsphere.com',
    password: 'Password123!',
    role: 'exhibitor',
    phone: '+1 (555) 012-7744',
    consentGiven: true,
    consentTimestamp: new Date(),
  },
  {
    name: 'Sarah Jenkins',
    email: 'attendee1@eventsphere.com',
    password: 'Password123!',
    role: 'attendee',
    phone: '+1 (555) 017-3321',
    consentGiven: true,
    consentTimestamp: new Date(),
  },
  {
    name: 'Michael Chen',
    email: 'attendee2@eventsphere.com',
    password: 'Password123!',
    role: 'attendee',
    phone: '+1 (555) 018-4455',
    consentGiven: true,
    consentTimestamp: new Date(),
  },
  {
    name: 'Aisha Khan',
    email: 'attendee3@eventsphere.com',
    password: 'Password123!',
    role: 'attendee',
    phone: '+1 (555) 019-5566',
    consentGiven: true,
    consentTimestamp: new Date(),
  },
];

const runDatabaseSeed = async () => {
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/eventsphere';
  try {
    console.log('[EventSphere Seed] Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('[EventSphere Seed] Connected successfully.');

    // Clear existing data
    await User.deleteMany({});
    await Expo.deleteMany({});
    await Booth.deleteMany({});
    await ExhibitorProfile.deleteMany({});
    await ExhibitorApplication.deleteMany({});
    await Notification.deleteMany({});
    await Session.deleteMany({});
    await Registration.deleteMany({});
    await Message.deleteMany({});
    console.log('[EventSphere Seed] Cleared existing database collections.');

    // Create users individually to trigger bcrypt hashing hooks
    const createdUsers = {};
    for (const userData of seedUsers) {
      const user = await User.create(userData);
      createdUsers[user.email] = user;
      console.log(`[EventSphere Seed] Created user: ${user.email} (${user.role})`);
    }

    const adminUser = createdUsers['admin@eventsphere.com'];
    const exhibitor1 = createdUsers['exhibitor1@eventsphere.com'];
    const exhibitor2 = createdUsers['exhibitor2@eventsphere.com'];
    const attendee1 = createdUsers['attendee1@eventsphere.com'];
    const attendee2 = createdUsers['attendee2@eventsphere.com'];
    const attendee3 = createdUsers['attendee3@eventsphere.com'];

    // Seed Main Published Expo
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + 10);
    startDate.setHours(9, 0, 0, 0);

    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 4);
    endDate.setHours(18, 0, 0, 0);

    const mainExpo = await Expo.create({
      title: 'Global Tech & Innovation Expo 2026',
      description:
        'The premier international trade exhibition showcasing cutting-edge artificial intelligence, commercial robotics, cloud infrastructure, and enterprise automation. Featuring keynote stages, over 100 enterprise exhibitors, and investor networking arenas.',
      theme: 'Emerging Technologies, AI & Robotics',
      startDate,
      endDate,
      location: {
        venue: 'Metropolitan Convention & Expo Center',
        city: 'Karachi',
        address: 'Main University Road, Hall 1 & 2',
      },
      bannerImage: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&auto=format&fit=crop&q=80',
      status: 'published',
      createdBy: adminUser._id,
    });
    console.log(`[EventSphere Seed] Created Published Expo: "${mainExpo.title}"`);

    // Seed Second Draft Expo
    const draftStart = new Date();
    draftStart.setDate(draftStart.getDate() + 45);
    const draftEnd = new Date(draftStart);
    draftEnd.setDate(draftEnd.getDate() + 3);

    const draftExpo = await Expo.create({
      title: 'Future Mobility & Smart Cities Trade Fair',
      description:
        'A global exhibition exploring autonomous transport, electric vehicles, renewable smart grids, and urban infrastructure technologies.',
      theme: 'Smart Cities & Clean Mobility',
      startDate: draftStart,
      endDate: draftEnd,
      location: {
        venue: 'International Exhibition Pavilion',
        city: 'Lahore',
        address: 'Sector B, Phase 5',
      },
      bannerImage: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=1200&auto=format&fit=crop&q=80',
      status: 'draft',
      createdBy: adminUser._id,
    });
    console.log(`[EventSphere Seed] Created Draft Expo: "${draftExpo.title}"`);

    // Seed 24 Booths for Main Expo (4 Rows: A, B, C, D × 6 Columns: 01 to 06)
    const rows = ['A', 'B', 'C', 'D'];
    const cols = 6;
    const boothsToSeed = [];

    for (let rIndex = 0; rIndex < rows.length; rIndex++) {
      const rowLetter = rows[rIndex];
      for (let c = 1; c <= cols; c++) {
        const colString = c < 10 ? `0${c}` : `${c}`;
        const boothNumber = `${rowLetter}-${colString}`;

        let category = 'Standard';
        let size = '10x10';
        let price = 500;

        if (c === 1 || c === cols) {
          category = 'Corner';
          price = 750;
        } else if (rIndex === 0) {
          category = 'Premium';
          size = '10x20';
          price = 1000;
        }

        let status = 'available';
        let assignedExhibitorId = null;
        let allocatedAt = null;
        let productsShowcased = [];
        let staff = [];

        // Allocate A-01 to exhibitor1
        if (boothNumber === 'A-01') {
          status = 'allocated';
          assignedExhibitorId = exhibitor1._id;
          allocatedAt = new Date();
          productsShowcased = ['NovaCore AI Engine', 'NeuralVision Vision AI', 'QuantumEdge Cloud Gateway'];
          staff = [
            { name: 'Dr. Sarah Mitchell', role: 'Chief AI Architect', email: 's.mitchell@technova.io', phone: '+1 555-0192' },
            { name: 'Alex Rivera', role: 'Senior Solutions Engineer', email: 'a.rivera@technova.io', phone: '+1 555-0194' },
          ];
        }
        // Allocate B-04 to exhibitor2
        if (boothNumber === 'B-04') {
          status = 'allocated';
          assignedExhibitorId = exhibitor2._id;
          allocatedAt = new Date();
          productsShowcased = ['Cobot-X Collaborative Arm', 'TitanAGV Mobile Warehouse Rover'];
          staff = [
            { name: 'Marcus Vance', role: 'Head of Robotics Deployment', email: 'm.vance@apexrobotics.com', phone: '+1 555-0381' },
            { name: 'Elena Rostova', role: 'Field Automation Specialist', email: 'e.rostova@apexrobotics.com', phone: '+1 555-0385' },
          ];
        }

        boothsToSeed.push({
          expoId: mainExpo._id,
          boothNumber,
          size,
          price,
          category,
          position: { row: rIndex + 1, col: c },
          status,
          exhibitorId: assignedExhibitorId,
          allocatedAt,
          notes: status === 'allocated' ? 'Priority exhibition stall with dual power socket' : '',
          productsShowcased,
          staff,
        });
      }
    }

    await Booth.insertMany(boothsToSeed);
    console.log(`[EventSphere Seed] Successfully seeded ${boothsToSeed.length} booths for "${mainExpo.title}".`);

    // Seed Profiles
    await ExhibitorProfile.create([
      {
        userId: exhibitor1._id,
        companyName: 'TechNova Solutions',
        category: 'AI & Cloud Infrastructure',
        website: 'https://technova.io',
        description:
          'Pioneering distributed neural networks and commercial AI models for real-time edge processing and autonomous supply chains.',
        logo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200',
        contact: {
          email: 'exhibitor1@eventsphere.com',
          phone: '+1 (555) 014-9988',
          address: 'Tech District, Innovation Tower',
        },
        products: [
          {
            name: 'NovaCore Edge AI Accelerator',
            description: 'Ultra-low latency hardware processor for edge intelligence.',
            category: 'Hardware',
          },
          {
            name: 'Synapse Orchestrator Suite',
            description: 'Enterprise fleet coordination for commercial IoT clusters.',
            category: 'Software',
          },
        ],
        staff: [
          { name: 'Dr. Elena Rostova', role: 'Chief AI Scientist', email: 'elena@technova.io' },
          { name: 'Marcus Vance', role: 'Lead Solutions Architect', email: 'marcus@technova.io' },
        ],
      },
      {
        userId: exhibitor2._id,
        companyName: 'Apex Robotics Inc.',
        category: 'Industrial & Service Robotics',
        website: 'https://apexrobotics.com',
        description:
          'Designing collaborative robotic arms, autonomous warehouse rovers, and computer-vision guidance units for next-gen manufacturing.',
        logo: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=200',
        contact: {
          email: 'exhibitor2@eventsphere.com',
          phone: '+1 (555) 012-7744',
          address: 'Silicon Boulevard, Suite 400',
        },
        products: [
          {
            name: 'Titan Arm Pro X',
            description: '6-axis cobot arm capable of sub-millimeter precision welding.',
            category: 'Hardware',
          },
        ],
        staff: [
          { name: 'Kenji Sato', role: 'Head of Robotics Engineering', email: 'kenji@apex.com' },
        ],
      },
    ]);
    console.log('[EventSphere Seed] Seeded Exhibitor Profiles.');

    // Seed Applications
    await ExhibitorApplication.create([
      {
        exhibitorId: exhibitor1._id,
        expoId: mainExpo._id,
        companyDetails: {
          companyName: 'TechNova Solutions',
          website: 'https://technova.io',
          contactEmail: 'exhibitor1@eventsphere.com',
          contactPhone: '+1 (555) 014-9988',
        },
        productsServices: 'Edge computing appliances, real-time AI computer vision models.',
        status: 'approved',
        adminRemarks: 'Approved for Main Exhibition Hall corner placement.',
        reviewedBy: adminUser._id,
        reviewedAt: new Date(),
      },
      {
        exhibitorId: exhibitor2._id,
        expoId: mainExpo._id,
        companyDetails: {
          companyName: 'Apex Robotics Inc.',
          website: 'https://apexrobotics.com',
          contactEmail: 'exhibitor2@eventsphere.com',
          contactPhone: '+1 (555) 012-7744',
        },
        productsServices: 'Heavy-payload autonomous mobile rovers and cobot demonstrations.',
        status: 'approved',
        adminRemarks: 'Approved. Allocated to Booth B-04.',
        reviewedBy: adminUser._id,
        reviewedAt: new Date(),
      },
      {
        exhibitorId: exhibitor1._id,
        expoId: draftExpo._id,
        companyDetails: {
          companyName: 'TechNova Solutions',
          website: 'https://technova.io',
          contactEmail: 'exhibitor1@eventsphere.com',
          contactPhone: '+1 (555) 014-9988',
        },
        productsServices: 'Smart city transport sensors and telemetry hubs.',
        status: 'pending',
      },
    ]);
    console.log('[EventSphere Seed] Seeded Exhibitor Applications.');

    // Helper to generate day offsets
    const d1 = new Date(startDate);
    const d2 = new Date(startDate);
    d2.setDate(d2.getDate() + 1);
    const d3 = new Date(startDate);
    d3.setDate(d3.getDate() + 2);

    const makeTime = (baseDate, hours, minutes) => {
      const d = new Date(baseDate);
      d.setHours(hours, minutes, 0, 0);
      return d;
    };

    // Seed 10 Realistic Keynotes, Panels, & Workshops for Main Expo
    const sessionsData = [
      {
        expoId: mainExpo._id,
        title: 'Opening Keynote: The Sovereign AI Renaissance',
        description: 'Exploring the geopolitical, economic, and computational shifts driving national AI computing clusters and distributed intelligence.',
        speaker: {
          name: 'Dr. Elena Rostova',
          bio: 'Chief AI Scientist at TechNova Solutions and former MIT Neural Systems Fellow.',
          company: 'TechNova Solutions',
          role: 'Chief AI Scientist',
          photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400',
        },
        topic: 'Artificial Intelligence',
        hall: 'Main Auditorium',
        startTime: makeTime(d1, 10, 0),
        endTime: makeTime(d1, 11, 30),
        capacity: 250,
        registeredCount: 2,
        status: 'scheduled',
      },
      {
        expoId: mainExpo._id,
        title: 'Industrial Cobots & Precision Manufacturing in 2026',
        description: 'Hands-on look at collaborative robotics integration in automated factories, sub-millimeter calibration, and safety envelopes.',
        speaker: {
          name: 'Kenji Sato',
          bio: 'Head of Robotics Engineering at Apex Robotics, specialist in multi-axis motion planning.',
          company: 'Apex Robotics Inc.',
          role: 'VP of Robotics',
          photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
        },
        topic: 'Robotics & Automation',
        hall: 'Hall A - Robotics Stage',
        startTime: makeTime(d1, 11, 45),
        endTime: makeTime(d1, 13, 0),
        capacity: 120,
        registeredCount: 1,
        status: 'scheduled',
      },
      {
        expoId: mainExpo._id,
        title: 'Panel: Next-Gen Venture Capital in Deep Tech & Silicon',
        description: 'Top technology investors discuss seed-stage valuations, hardware defensibility, and foundry dynamics in global tech hubs.',
        speaker: {
          name: 'Marcus Vance',
          bio: 'Lead Solutions Architect and tech venture advisor with over 15 years in enterprise cloud.',
          company: 'TechNova Solutions',
          role: 'Lead Solutions Architect',
          photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
        },
        topic: 'Deep Tech & Venture',
        hall: 'Hall B - Executive Suite',
        startTime: makeTime(d1, 14, 0),
        endTime: makeTime(d1, 15, 30),
        capacity: 90,
        registeredCount: 1,
        status: 'scheduled',
      },
      {
        expoId: mainExpo._id,
        title: 'Workshop: Deploying Distributed Edge Models with Zero Latency',
        description: 'Technical deep-dive on quantizing 70B parameter models onto ultra-compact micro-accelerators with live benchmarking.',
        speaker: {
          name: 'Dr. Elena Rostova',
          bio: 'Chief AI Scientist at TechNova Solutions.',
          company: 'TechNova Solutions',
          role: 'Chief AI Scientist',
          photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400',
        },
        topic: 'Artificial Intelligence',
        hall: 'Innovation Lab 1',
        startTime: makeTime(d1, 16, 0),
        endTime: makeTime(d1, 17, 30),
        capacity: 50,
        registeredCount: 1,
        status: 'scheduled',
      },
      // Day 2 Sessions
      {
        expoId: mainExpo._id,
        title: 'Keynote: Clean Energy Grids for Megawatt Data Centers',
        description: 'How nuclear microreactors and geothermal power plants will sustain the exponential energy demand of global AI clusters.',
        speaker: {
          name: 'Clara Oswald',
          bio: 'Energy Systems Engineer and consultant to major renewable hyper-scalers.',
          company: 'GreenWatt Innovations',
          role: 'Director of Clean Infrastructure',
          photo: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400',
        },
        topic: 'Green Energy & Sustainability',
        hall: 'Main Auditorium',
        startTime: makeTime(d2, 10, 0),
        endTime: makeTime(d2, 11, 30),
        capacity: 250,
        registeredCount: 0,
        status: 'scheduled',
      },
      {
        expoId: mainExpo._id,
        title: 'Autonomous Mobile Rovers in Logistics: Live Arena Demo',
        description: 'Witnessing high-speed swarm rovers navigating obstacle mazes with decentralized fleet synchronization and optical SLAM.',
        speaker: {
          name: 'Kenji Sato',
          bio: 'VP of Robotics at Apex Robotics.',
          company: 'Apex Robotics Inc.',
          role: 'VP of Robotics',
          photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
        },
        topic: 'Robotics & Automation',
        hall: 'Hall A - Robotics Stage',
        startTime: makeTime(d2, 11, 45),
        endTime: makeTime(d2, 13, 15),
        capacity: 150,
        registeredCount: 2,
        status: 'scheduled',
      },
      {
        expoId: mainExpo._id,
        title: 'Cybersecurity in Autonomous Systems & OT Environments',
        description: 'Protecting industrial CAN buses, SCADA systems, and drone telemetry from sophisticated adversarial injections.',
        speaker: {
          name: 'Tariq Mehmood',
          bio: 'Senior Security Architect, Certified Red Team Specialist.',
          company: 'CyberShield Systems',
          role: 'Principal Security Fellow',
          photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
        },
        topic: 'Cybersecurity',
        hall: 'Hall B - Executive Suite',
        startTime: makeTime(d2, 14, 0),
        endTime: makeTime(d2, 15, 30),
        capacity: 100,
        registeredCount: 0,
        status: 'scheduled',
      },
      {
        expoId: mainExpo._id,
        title: 'Fireside Chat: Ethics, Regulation, and the Future of Autonomous Agents',
        description: 'A candid conversation exploring legal liabilities, ethical boundaries, and policy frameworks for autonomous agent swarms.',
        speaker: {
          name: 'Sarah Jenkins',
          bio: 'Policy Researcher and Fellow at Global Tech Governance Observatory.',
          company: 'GTGO Policy Group',
          role: 'Policy Fellow',
          photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
        },
        topic: 'Policy & Ethics',
        hall: 'Innovation Lab 1',
        startTime: makeTime(d2, 16, 0),
        endTime: makeTime(d2, 17, 30),
        capacity: 60,
        registeredCount: 1,
        status: 'scheduled',
      },
      // Day 3 Sessions
      {
        expoId: mainExpo._id,
        title: 'Global Hardware Supply Chains: Beyond the Single Sourcing Risk',
        description: 'Strategies for diversifying semiconductor fabrication, wafer packaging, and PCB assembly in an unstable geopolitical climate.',
        speaker: {
          name: 'Marcus Vance',
          bio: 'Lead Solutions Architect at TechNova Solutions.',
          company: 'TechNova Solutions',
          role: 'Lead Solutions Architect',
          photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
        },
        topic: 'Semiconductors & Supply Chain',
        hall: 'Main Auditorium',
        startTime: makeTime(d3, 10, 30),
        endTime: makeTime(d3, 12, 0),
        capacity: 200,
        registeredCount: 0,
        status: 'scheduled',
      },
      {
        expoId: mainExpo._id,
        title: 'Closing Ceremony & EventSphere Innovation Awards',
        description: 'Honoring the most disruptive exhibitors, best booth designs, and top groundbreaking hardware prototypes of 2026.',
        speaker: {
          name: 'EventSphere Super Admin',
          bio: 'Executive Director of Global Trade & Conventions.',
          company: 'EventSphere Global',
          role: 'Executive Chair',
          photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400',
        },
        topic: 'Awards & Honors',
        hall: 'Main Auditorium',
        startTime: makeTime(d3, 15, 0),
        endTime: makeTime(d3, 17, 0),
        capacity: 300,
        registeredCount: 2,
        status: 'scheduled',
      },
    ];

    const seededSessions = await Session.insertMany(sessionsData);
    console.log(`[EventSphere Seed] Successfully seeded ${seededSessions.length} keynote and workshop sessions.`);

    // Seed Registrations & Bookmarks for Attendees
    const registrationsToSeed = [
      // Attendee 1 (Sarah Jenkins) registers for Main Expo and Keynote 1, and bookmarks Session 2
      {
        attendeeId: attendee1._id,
        expoId: mainExpo._id,
        sessionId: null,
        type: 'expo',
        bookmarked: false,
        registeredAt: new Date(),
      },
      {
        attendeeId: attendee1._id,
        expoId: mainExpo._id,
        sessionId: seededSessions[0]._id, // Opening Keynote
        type: 'session',
        bookmarked: true,
        registeredAt: new Date(),
      },
      {
        attendeeId: attendee1._id,
        expoId: mainExpo._id,
        sessionId: seededSessions[1]._id, // Industrial Cobots
        type: 'session',
        bookmarked: true,
        registeredAt: new Date(),
      },
      {
        attendeeId: attendee1._id,
        expoId: mainExpo._id,
        sessionId: seededSessions[5]._id, // Autonomous Mobile Rovers Demo
        type: 'session',
        bookmarked: true,
        registeredAt: new Date(),
      },

      // Attendee 2 (Michael Chen)
      {
        attendeeId: attendee2._id,
        expoId: mainExpo._id,
        sessionId: null,
        type: 'expo',
        bookmarked: false,
        registeredAt: new Date(),
      },
      {
        attendeeId: attendee2._id,
        expoId: mainExpo._id,
        sessionId: seededSessions[0]._id,
        type: 'session',
        bookmarked: true,
        registeredAt: new Date(),
      },
      {
        attendeeId: attendee2._id,
        expoId: mainExpo._id,
        sessionId: seededSessions[2]._id, // VC Panel
        type: 'session',
        bookmarked: true,
        registeredAt: new Date(),
      },
      {
        attendeeId: attendee2._id,
        expoId: mainExpo._id,
        sessionId: seededSessions[9]._id, // Closing Ceremony
        type: 'session',
        bookmarked: false,
        registeredAt: new Date(),
      },

      // Attendee 3 (Aisha Khan)
      {
        attendeeId: attendee3._id,
        expoId: mainExpo._id,
        sessionId: seededSessions[3]._id, // Edge Models Workshop
        type: 'session',
        bookmarked: true,
        registeredAt: new Date(),
      },
      {
        attendeeId: attendee3._id,
        expoId: mainExpo._id,
        sessionId: seededSessions[5]._id, // Rovers demo
        type: 'session',
        bookmarked: true,
        registeredAt: new Date(),
      },
      {
        attendeeId: attendee3._id,
        expoId: mainExpo._id,
        sessionId: seededSessions[7]._id, // Fireside chat
        type: 'session',
        bookmarked: true,
        registeredAt: new Date(),
      },
      {
        attendeeId: attendee3._id,
        expoId: mainExpo._id,
        sessionId: seededSessions[9]._id, // Closing Ceremony
        type: 'session',
        bookmarked: true,
        registeredAt: new Date(),
      },
    ];

    await Registration.insertMany(registrationsToSeed);
    console.log(`[EventSphere Seed] Seeded ${registrationsToSeed.length} registrations & bookmarks for attendees.`);

    // Seed Initial Messages (Exhibitor-Attendee, Exhibitor-Admin, Exhibitor-Exhibitor)
    const t0 = new Date(Date.now() - 3600000 * 5); // 5 hours ago
    const t1 = new Date(Date.now() - 3600000 * 4); // 4 hours ago
    const t2 = new Date(Date.now() - 3600000 * 3); // 3 hours ago
    const t3 = new Date(Date.now() - 3600000 * 2); // 2 hours ago
    const t4 = new Date(Date.now() - 3600000 * 1); // 1 hour ago
    const t5 = new Date(Date.now() - 60000 * 15);  // 15 mins ago

    const seedMessages = [
      // Thread 1: Attendee1 (Sarah Jenkins) ↔ Exhibitor1 (TechNova)
      {
        senderId: attendee1._id,
        receiverId: exhibitor1._id,
        expoId: mainExpo._id,
        content: 'Hi TechNova team! Will your NovaCore Edge AI hardware accelerator demo be running live during all 3 days?',
        readAt: t1,
        createdAt: t0,
      },
      {
        senderId: exhibitor1._id,
        receiverId: attendee1._id,
        expoId: mainExpo._id,
        content: 'Hello Sarah! Yes absolutely, we have interactive live edge inference benchmarks running at Booth A-01 every hour from 10:00 to 17:00. We look forward to welcoming you!',
        readAt: t2,
        createdAt: t1,
      },
      {
        senderId: attendee1._id,
        receiverId: exhibitor1._id,
        expoId: mainExpo._id,
        content: 'Awesome! Can we schedule a 10-minute technical brief after the Opening Keynote on Day 1?',
        readAt: null, // Unread message for Exhibitor1!
        createdAt: t5,
      },

      // Thread 2: Exhibitor1 (TechNova) ↔ Admin (Super Admin)
      {
        senderId: exhibitor1._id,
        receiverId: adminUser._id,
        expoId: mainExpo._id,
        content: 'Greetings Admin team. Our hardware rigs have arrived at Booth A-01. Could you confirm if high-voltage 3-phase power is activated on Row A?',
        readAt: t3,
        createdAt: t2,
      },
      {
        senderId: adminUser._id,
        receiverId: exhibitor1._id,
        expoId: mainExpo._id,
        content: 'Hi TechNova, yes! Hall 1 facility team has energized all circuits on Row A & B. Let us know if you need any additional badge passes.',
        readAt: t4,
        createdAt: t3,
      },

      // Thread 3: Exhibitor1 (TechNova) ↔ Exhibitor2 (Apex Robotics) - Neighbor exhibitors
      {
        senderId: exhibitor2._id,
        receiverId: exhibitor1._id,
        expoId: mainExpo._id,
        content: 'Hey Elena! Congratulations on securing Booth A-01. We are over at B-04 with the Titan cobot arm.',
        readAt: t4,
        createdAt: t3,
      },
      {
        senderId: exhibitor1._id,
        receiverId: exhibitor2._id,
        expoId: mainExpo._id,
        content: 'Thanks Kenji! Your rovers look magnificent. Let us catch up at the VIP reception right after the Day 1 Keynote.',
        readAt: null,
        createdAt: t4,
      },
    ];

    await Message.insertMany(seedMessages);
    console.log(`[EventSphere Seed] Seeded ${seedMessages.length} realistic chat messages.`);

    console.log('\n========================================================');
    console.log('  EventSphere Seeding Complete!                         ');
    console.log('  - Users: Admin, 2 Exhibitors, 3 Attendees             ');
    console.log('  - Expos: 1 Published, 1 Draft                         ');
    console.log('  - Booths: 24 stalls generated with live allocations   ');
    console.log('  - Exhibitor Profiles & Applications Seeded            ');
    console.log('  - Sessions: 10 Keynotes, Workshops across 3 days      ');
    console.log('  - Registrations: Expo passes, bookmarked sessions     ');
    console.log('========================================================\n');

    process.exit(0);
  } catch (error) {
    console.error('[EventSphere Seed Error]:', error.message);
    process.exit(1);
  }
};

runDatabaseSeed();
