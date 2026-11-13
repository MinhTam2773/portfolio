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
    slug: "paranoidz",
    title: "Paranoidz",
    shortDescription:
      "A headless e-commerce platform for a Vietnamese streetwear brand: a customer storefront at paranoidz.vn and an admin app for orders, stock, promo codes and nationwide shipping, built on Next.js and Supabase and running in production.",
    problemStatement: [
      "The brand sold through marketplaces like Shopee and had no store of its own. It needed its own store where customers can browse, order without an account and pay cash on delivery or by bank transfer, plus one place for the owner to run every order end to end.",
    ],
    solution: [
      "Built with a teammate as a pnpm monorepo: two Next.js apps (storefront and admin) sharing one Supabase database. Catalog pages are server-rendered and cached for speed and SEO, search handles Vietnamese with or without accents, and anything that touches money, stock or vouchers runs only on the server.",
    ],
    caseStudySections: [
      {
        title: "What I Built",
        items: [
          {
            title: "1. Server-Only Orders",
            body: "Orders go through one atomic Postgres function that only the server can call. It re-reads prices from the database, applies vouchers, combos and flash sales, takes stock and writes the order in a single transaction, so the client's own totals are never trusted and two buyers can't take the last item.",
          },
          {
            title: "2. Shipping Integration",
            body: "I integrated the SPX Express shipping API into the admin: live shipping fees at checkout, bulk shipment creation with printable labels from the orders page, and status changes that check SPX first so stock and loyalty counters stay correct.",
          },
          {
            title: "3. Admin and Data Access",
            body: "The admin covers orders, customers, products, collections, bundles, promo codes, review moderation and an Excel export. Row Level Security keeps customer data scoped to its owner, and admin rights are checked on the server on every request.",
          },
        ],
      },
      {
        title: "Testing & Delivery",
        items: [
          {
            title: "End-to-End Coverage",
            body: "A Playwright suite runs both apps against a local Supabase stack, including sign-up and password-reset emails, and a database smoke test checks the order math. Database changes ship as migrations, reviewed and tested locally before they reach production.",
          },
        ],
      },
    ],
    coverImage: "/projects/paranoidz/paranoidz-1.webp",
    galleryImages: [
      "/projects/paranoidz/paranoidz-1.webp",
      "/projects/paranoidz/paranoidz-2.webp",
      "/projects/paranoidz/paranoidz-3.webp",
    ],
    techStack: [
      "Next.js 16",
      "React 19",
      "TypeScript",
      "Supabase",
      "PostgreSQL",
      "Tailwind CSS v4",
      "Resend",
      "Playwright",
      "Vercel",
    ],
    role: "Lead Full Stack Developer",
    timeline: "Jul 2026 - Present",
    liveDemoUrl: "https://paranoidz.vn",
    githubUrl: "https://github.com/MinhTam2773/Paranoidz",
    isProtected: true,
  },
  {
    slug: "firewatch",
    title: "FIRE//WATCH",
    shortDescription:
      "A real-time wildfire risk intelligence map for all of Canada, rendering fire danger, live weather, and projected fire spread on a 3D hex grid, with Firefly, a voice and text AI agent that answers questions and flies the map for you.",
    problemStatement: [
      "Wildfire data in Canada is spread across satellite hotspots, agency fire reports, weather stations, and forecasts. Duty officers and residents have to piece it together themselves to answer simple questions like \"how risky is my town this week?\" or \"where should the next crew go?\"",
    ],
    solution: [
      "Built during the IEEE YP Industry Hackathon 2026 by a team of four, FIRE//WATCH turns open data into one interactive 3D map. Fire danger follows the Canadian Fire Weather Index System, spread uses the Fire Behaviour Prediction System, and a 7-day forecast bar lets users step through each day. Firefly, our AI mascot, answers typed or spoken questions straight from the same data the map shows.",
    ],
    caseStudySections: [
      {
        title: "What I Built",
        items: [
          {
            title: "1. Firefly: A Voice & Text AI Agent",
            body: "I built Firefly end to end: an ElevenLabs voice agent and a Databricks-hosted LLM for typed questions, both wired to client-side tools that read and drive the live map. Firefly can brief the situation, check a community's risk over the next 7 days, explain why an area is rated the way it is, fly the camera to a place, and raise proactive alerts when a town enters a projected fire path. Answers are grounded in app state, so the model never guesses at numbers.",
          },
          {
            title: "2. Projected Fire Spread",
            body: "I implemented the projected spread layer: an ellipse-based scenario model that grows each active fire with wind and fuel, highlights the reachable hexes for the selected forecast day, and lists the communities in its path.",
          },
          {
            title: "3. Wind Streamlines & Risk Ranking",
            body: "I replaced static wind arrows with animated, Windfinder-style streamlines that follow the forecast day and glide smoothly over terraced terrain. I also ranked at-risk communities by the map's risk score and scored each day by its peak so the forecast slider compares like with like.",
          },
        ],
      },
      {
        title: "The Hardest Part: Making the Agent Feel Natural",
        items: [
          {
            title: "The Problem",
            body: "A talking mascot on a live map has many moving parts: voice, speech bubbles, camera flights, loading screens, and side panels all compete for the screen. Early versions greeted users over their first question, flew to a spot without actually answering, and lost the mascot behind other panels.",
          },
          {
            title: "The Solution",
            body: "I reworked the conversation flow so every question gets a spoken answer, the speech bubble follows the voice, flights loop once and return home after explaining, and follow-up questions in a conversation route to the agent instead of the rule-based fallback. When neither AI is reachable, the same tools answer directly from app data, so a question never goes unanswered.",
          },
        ],
      },
    ],
    coverImage: "/projects/firewatch/firewatch-1.webp",
    galleryImages: ["/projects/firewatch/firewatch-1.webp", "/projects/firewatch/firewatch-2.webp"],
    techStack: [
      "React",
      "TypeScript",
      "Three.js",
      "Vite",
      "Tailwind CSS",
      "GSAP",
      "ElevenLabs Agents",
      "Databricks",
      "Node.js",
      "Python",
      "Terraform",
    ],
    role: "Full Stack Developer (AI Agent & Geospatial)",
    timeline: "Oct 2026 · IEEE YP Industry Hackathon",
    liveDemoUrl: "https://fire-watch.ca/",
    githubUrl: "https://github.com/SaladStik/Firewatch",
    videoUrl: "/projects/firewatch/firewatch-showcase.mp4",
    videoLabel: "Video showcase",
  },
  {
    slug: "pengloo",
    title: "Pengloo Party",
    shortDescription:
      "A cozy multiplayer 3D island where friends hang out as penguins: walk the town, dress up, chat with proximity voice, and play snowball fights, sled races, fishing and movie night together, right in the browser.",
    problemStatement: [
      "A lot of us grew up hanging out with friends in online worlds like Club Penguin. Those places are gone, and group chats and Discord servers are good for messaging but give you nowhere to actually be together.",
    ],
    solution: [
      "Built at MRUHacks 2026 for the prompt \"Revitalize\" by a team of four, Pengloo Party brings that hangout back as an original game with its own art and characters. Players share one island, see each other's outfits, talk with proximity voice chat, and drop into activities together. It runs in the browser from a Godot web export.",
    ],
    caseStudySections: [
      {
        title: "What I Built",
        items: [
          {
            title: "1. Multiplayer Outfits",
            body: "I synced each player's wardrobe over the network: the look travels in the join message and the room roster, so every remote penguin is dressed the way its player chose, including on the Sled Hill run.",
          },
          {
            title: "2. Filming Tools and Trailer",
            body: "I added a Hide UI setting, follower bots and a filming host so we could record real gameplay, then cut the trailer and feature clips for the pitch from that footage instead of mockups.",
          },
          {
            title: "3. The Pitch",
            body: "I wrote the pitch script and built the closing-ceremony deck, with a QR code that took judges straight to the live game at pengloo.party.",
          },
        ],
      },
    ],
    coverImage: "/projects/pengloo/pengloo-1.webp",
    galleryImages: [
      "/projects/pengloo/pengloo-1.webp",
      "/projects/pengloo/pengloo-2.webp",
      "/projects/pengloo/pengloo-3.webp",
      "/projects/pengloo/pengloo-4.webp",
    ],
    techStack: [
      "Godot 4",
      "GDScript",
      "Blender",
      "WebSockets",
      "WebRTC",
      "Go",
      "Docker",
      "nginx",
    ],
    role: "Game Developer (Multiplayer & Pitch)",
    timeline: "Oct 2026 · MRUHacks 2026",
    liveDemoUrl: "https://pengloo.party",
    githubUrl: "https://github.com/amadeusk1/mruhacks",
    videoUrl: "/projects/pengloo/pengloo-showcase.mp4",
    videoLabel: "Trailer",
  },
  {
    slug: "rezume",
    title: "Rezume",
    shortDescription:
      "An AI-powered career document builder and application tracker that lets users generate tailored materials using their personal API keys rather than paying for a platform subscription.",
    problemStatement: [
      "Users need an efficient way to adapt their resumes and cover letters to match specific opportunities.",
      "Keeping track of the entire application process is often disorganized and disconnected from document creation.",
      "Many automated application tools force users into paid subscriptions."
    ],
    solution: [
      "Allows users to build a master profile of experiences that serves as an AI source of truth for customization.",
      "Tailors materials to opportunity descriptions (imported manually or via web scraper) to generate an ATS-friendly resume along with interview prep.",
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
];
