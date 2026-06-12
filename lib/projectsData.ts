import { Project } from "@/types/project";

export const projects: Project[] = [
  {
    slug: "allbarber",
    title: "AllBarber",
    shortDescription:
      "A full-stack operating system for modern barbershops, bringing scheduling, walk-in queues, point-of-sale, staff operations, and client relationships into one real-time multi-tenant platform.",
    problemStatement: [
      "Barbershops often rely on disconnected tools for booking, payments, customer updates, staff coordination, and reporting. AllBarber needed to unify those workflows without slowing down the front desk during a busy service day.",
    ],
    solution: [
      "I helped build a multi-tenant SaaS platform with real-time queues, Stripe Terminal POS, role-aware dashboards, staff scheduling, CRM, inventory, and automated operational workflows.",
    ],
    caseStudySections: [
      {
        title: "System Architecture & Key Features",
        items: [
          {
            title: "1. Relational Data Isolation: The 34-Table Schema",
            body: "I designed a 34-table relational PostgreSQL schema for a multi-tenant environment spanning shops, staff roles, services, customers, queues, tickets, payments, tips, and reporting. Supabase Row Level Security policies enforce tenant-scoped access so each barbershop only reaches its own operational data.",
          },
          {
            title: "2. Asynchronous Event-Driven Engine",
            body: "Appointment workflows depend on background work that cannot silently fail. I implemented an event-driven engine with Inngest to handle scheduling jobs, notification fanouts through Twilio and email, and retryable workers for booking confirmations and customer updates.",
          },
          {
            title: "3. Performance & Scaling",
            body: "To keep dashboards responsive under heavier usage, I used tenant-scoped caching strategies and optimized query paths around the highest-traffic views. The platform was deployed on Microsoft Azure and validated through intensive load testing around 1,000-user scenarios.",
          },
        ],
      },
      {
        title: "The Biggest Bottleneck: Stripe POS Integration",
        items: [
          {
            title: "The Problem",
            body: "The most complex part of the build was automating the financial workflow. Stripe Terminal had to support physical point-of-sale transactions while the platform calculated tips, refunds, and multi-barber payout logic inside a single shop tenant. Webhooks, asynchronous payment states, and multi-party accounting made this the riskiest integration in the product.",
          },
          {
            title: "The Solution",
            body: "I took ownership of the payment routing logic, mapped the asynchronous Stripe state transitions, and rebuilt the payment handler around webhook validation, isolated testing, and auditable Tip Ledger updates. The final flow automated payout calculations that would otherwise create hours of manual administrative work for shop owners each week.",
          },
        ],
      },
      {
        title: "Testing, Quality, & Team Delivery",
        items: [
          {
            title: "Automated QA",
            body: "For a team of six, I helped establish a multi-layer testing approach with Playwright for end-to-end flows and Vitest for lower-level logic. This caught edge cases earlier in development, especially around booking, role permissions, and payment workflows.",
          },
          {
            title: "Delivery Velocity",
            body: "I also pushed for stronger peer review habits, clearer Git workflows, and standardized backend response contracts so frontend and backend work could move in parallel with fewer handoff issues.",
          },
        ],
      },
    ],
    coverImage: "/projects/allbarber.png",
    galleryImages: ["/projects/allbarber.png", "/projects/allbarber/allbarber-1.png", "/projects/allbarber/allbarber-2.png", "/projects/allbarber/allbarber-3.png", "/projects/allbarber/allbarber-4.png", "/projects/allbarber/allbarber-5.png", "/projects/allbarber/allbarber-6.png"],
    techStack: [
      "Next.js",
      "TypeScript",
      "Supabase",
      "PostgreSQL",
      "RLS",
      "Redis",
      "Auth.js",
      "Stripe",
      "Tailwind CSS",
      "Postmark",
      "Twilio",
      "Inngest",
      "Azure",
      "Playwright",
      "Vitest",
    ],
    role: "Fullstack Developer",
    timeline: "Aug 2025 - Present",
    liveDemoUrl: "http://allbarber.website/",
    githubUrl: "https://github.com/MinhTam2773/AllBarber",
    videoUrl: "https://youtu.be/pAQvZMyPveE",
    videoLabel: "Watch the journey",
    isProtected: true,
  },
  {
    slug: "rezume",
    title: "Rezume",
    shortDescription:
      "An AI-powered resume builder and job application tracker that lets users generate tailored career documents using their personal API keys rather than paying for a platform subscription.",
    problemStatement: [
      "Job seekers need an efficient way to adapt their resumes and cover letters to match specific job descriptions.",
      "Keeping track of the entire job search process is often disorganized and disconnected from document creation.",
      "Many automated application tools force users into paid subscriptions."
    ],
    solution: [
      "Allows users to build a master profile of experiences that serves as an AI source of truth for customization.",
      "Tailors materials to job descriptions (imported manually or via web scraper) to generate an ATS-friendly resume along with interview prep.",
      "Features a Kanban-style pipeline to monitor progress from saving a job to accepting an offer.",
      "Utilizes a BYOK (Bring Your Own Key) setup, letting users connect free or personal tiers of popular AI APIs."
    ],
    coverImage: "/projects/rezume/cover.png",
    galleryImages: [
      "/projects/rezume/cover.png",
      "/projects/rezume/image-1.png",
      "/projects/rezume/image-2.png",
      "/projects/rezume/image-3.png",
      "/projects/rezume/image-4.png",
      "/projects/rezume/image-5.png",
      "/projects/rezume/image-6.png"
    ],
    techStack: [
      "Next.js",
      "TypeScript",
      "React",
      "Tailwind CSS v4",
      "Clerk",
      "Convex",
      "Python",
      "Playwright"
    ],
    role: "Full Stack Developer",
    timeline: "May 2026",
    liveDemoUrl: "https://www.rezume.website",
    githubUrl: "https://github.com/MinhTam2773/cursor-hackahon",
  },
  {
    slug: "pathr",
    title: "Pathr",
    shortDescription:
      "An AI-powered education and career pathway platform that helps students navigate complex post-secondary options by integrating real-time program data, transfer agreements, and labor market information across Alberta institutions.",
    problemStatement: [
      "Post-secondary data is constantly evolving - programs open and close admission cycles each semester, some institutions operate on traditional semesters while community colleges have 3-4 week terms with frequent class additions. Students struggle to track these rapid changes.",
      "Transfer pathways are complex and underutilized - students don't know they can ladder from diplomas to baccalaureate degrees or pathway from colleges into universities. These articulation agreements exist but are buried in institutional silos.",
      "Students need personalized guidance that considers their unique situation - whether they're fresh graduates looking to continue their education, or professionals seeking to upskill through micro-credentials and certificate programs.",
      "Institutions lack a unified way to communicate their evolving offerings - program statuses (open, closed, waitlisted), new partnerships between post-secondaries, and changing admission requirements are scattered across different websites and PDFs.",
    ],
    solution: [
      "Built a data ingestion pipeline that processes program information from multiple Alberta post-secondary institutions, capturing semester-by-semester updates, admission cycles, and program status changes (open/closed/waitlisted) as they evolve throughout the academic year.",
      "Integrated transfer agreement data to map out credential laddering opportunities - showing students clear pathways from certificates to diplomas to degrees, including partnerships between institutions that enable seamless transitions.",
      "Developed an AI-powered recommendation engine that considers each student's academic background, career interests, and constraints to suggest personalized education pathways, highlighting transfer opportunities they might otherwise miss.",
      "Created real-time program availability tracking that alerts students when programs open for admission or when new sections are added, particularly important for institutions with frequent 3-4 week enrollment cycles.",
      "Implemented automated data refresh mechanisms that keep program information current without manual intervention, solving the challenge of constantly evolving course offerings across different institutional calendars.",
      'Designed an intuitive interface where students can explore "what-if" scenarios - seeing how completing a diploma at one college could lead to a bachelor\'s degree at a university, with clear timelines and costs at each step.',
    ],
    coverImage: "/projects/pathr/landing.png",
    galleryImages: ["/projects/pathr/landing.png", "/projects/pathr/image.png"],
    techStack: [
      "Next.js",
      "TypeScript",
      "Convex",
      "OpenAI",
      "RAG",
      "PostgreSQL",
      "Tailwind CSS",
      "shadcn/ui",
      "Clerk",
    ],
    role: "Full Stack Developer (AI & Data Integration)",
    timeline: "Feb 2026 - Present",
    liveDemoUrl: "",
    githubUrl: "https://github.com/edwinolaez/apas-pathway-tool",
  },
  {
    slug: "vibemap",
    title: "VibeMap",
    shortDescription:
      "An empathetic mapping experiment that captures how spaces feel—using emoji-based reporting and aggregated heatmaps to reveal community energy patterns.",
    problemStatement: [
      "Traditional maps show where things are, but never how spaces feel. People rely on word-of-mouth or personal experience to find places that match their energy, whether it's a quiet study spot or a vibrant social corner.",
      "Existing reporting tools focus on incidents or problems, which can unfairly label neighborhoods or businesses. This negative framing discourages participation and can stigmatize areas based on isolated events.",
      "Communities and urban planners lack tools to understand the emotional dynamics of public spaces in a way that is ethical, aggregated, and privacy-preserving.",
    ],
    solution: [
      'VibeMap reimagines community mapping through a human-centered lens. Users simply tap a location on the map, select an emoji that represents its "vibe," and optionally add a short note—capturing subjective feelings in an intuitive, low-friction way.',
      "Submissions are aggregated in real time using Firebase Firestore, then rendered as soft, pastel-colored heatmaps and emoji markers. A thresholding algorithm prevents single reports from dominating, ensuring patterns reflect collective sentiment rather than outliers.",
      'The design deliberately avoids harsh colors or judgmental labels—instead using a gentle spectrum from "off-vibe" to "bright"—to frame data as emotional impressions rather than definitive statements. No individual submissions are exposed, preserving user privacy.',
      "Built during a hackathon, the lightweight interface combines Next.js with Leaflet and OpenStreetMap for seamless map interaction, demonstrating how technology can help communities understand shared experiences without amplifying harm.",
    ],
    coverImage: "/projects/vibemap.png",
    galleryImages: [
      "/projects/vibemap.png",
      "/projects/vibemap/image.png",
    ],
    techStack: [
      "Next.js",
      "TypeScript",
      "Firebase Firestore",
      "Leaflet.js",
      "OpenStreetMap",
      "Tailwind CSS",
      "React",
    ],
    role: "Backend Developer",
    timeline: "24 hour hackathon",
    liveDemoUrl: "https://vibemap-app.vercel.app",
    githubUrl: "https://github.com/HanxxFeli/VibeMap",
  },
  {
    slug: "b2b-ecommerce",
    title: "B2B Ecommerce Mobile App",
    shortDescription:
      "A React Native (Expo) mobile application enabling wholesale buyers to browse products, place bulk orders, and track order history with a clean, intuitive interface.",
    problemStatement: [
      "Wholesale distributors needed a mobile-friendly ordering solution for their B2B clients, but existing platforms were either desktop-only or too complex for quick, on-the-go purchases.",
      "Buyers wanted a simple way to reorder frequently purchased items, view product catalogs with real-time pricing, and check order status without logging into a full desktop system.",
      "The goal was to build a lightweight, responsive mobile app that connects to an existing ecommerce backend via APIs, providing a seamless ordering experience for business customers.",
    ],
    solution: [
      "Developed a cross-platform mobile application using React Native and Expo, allowing wholesale clients to place orders directly from their smartphones.",
      "Integrated with the client's existing REST API to fetch product catalogs, pricing, and inventory data, ensuring real-time accuracy without building a new backend.",
      "Implemented features such as bulk order entry, quick reorder from history, secure authentication, and order tracking—all within a streamlined mobile UI.",
      "Designed reusable components and managed state with React hooks and Context API, ensuring smooth navigation and performance.",
      "Delivered a responsive layout that adapts to both phones and tablets, making it easy for buyers to manage their accounts anytime, anywhere.",
    ],
    coverImage: "/projects/ecommerce.png",
    galleryImages: ["/projects/ecommerce.png"],
    techStack: [
      "React Native",
      "Expo",
      "TypeScript",
      "React Navigation",
      "Context API",
      "REST API Integration",
      "Axios",
      "AsyncStorage",
    ],
    role: "Frontend Mobile Developer",
    timeline: "Dec 2025",
    liveDemoUrl: "",
    githubUrl: "https://github.com/MinhTam2773/Ecommerce",
  },
  {
    slug: "sharie",
    title: "Sharie",
    shortDescription:
      "A social audio sharing platform where users can upload, discover, and discuss audio content in real-time, combining elements of SoundCloud and modern messaging apps.",
    problemStatement: [
      "Audio content creators lacked a dedicated space to share their work and engage with listeners beyond static comments. Existing platforms separated content discovery from community interaction.",
      "Listeners wanted to discuss tracks, ask questions, and connect with others in real-time while listening, but traditional music platforms offered only delayed, thread-based comments.",
      "The challenge was to build a cohesive experience where audio playback and social interaction happen simultaneously, with real-time chat and notifications.",
    ],
    solution: [
      "Developed a full-stack MERN application (MongoDB, Express, React, Node.js) with a custom authentication system using JWT and Axios for secure API communication.",
      "Implemented real-time chat functionality using WebSockets, allowing users to send direct messages, participate in group conversations, and react to messages while listening to audio.",
      "Built audio upload and streaming capabilities with support for MP3/WAV files, including waveform visualization using Wavesurfer.js and a custom audio player with play/pause, seek, and volume controls.",
      "Created social features such as liking, commenting, reposting, saving audio to personal libraries, and following other users – all with real-time updates via WebSocket events.",
      "Designed an intuitive UI with React and Tailwind CSS, featuring infinite scroll feeds, category-based browsing, and user profiles with stats (uploads, followers, following).",
      "Engineered the backend with Express and MongoDB, including robust data models for users, audio posts, playlists, messages, and notifications. Used middleware for authentication and error handling.",
    ],
    coverImage: "/projects/sharie.png",
    galleryImages: ["/projects/sharie.png"],
    techStack: [
      "MongoDB",
      "Express.js",
      "React",
      "Node.js",
      "WebSockets",
      "JWT",
      "Axios",
      "Tailwind CSS",
      "Wavesurfer.js",
      "React Router",
      "Context API",
    ],
    role: "Full Stack Developer",
    timeline: "June 2025",
    liveDemoUrl: "",
    githubUrl: "https://github.com/MinhTam2773/Sharie",
  },
];
