"use client";

import { PageTransition } from "@/components/PageTransition";
import {
  ExternalLink,
  Github,
  Code,
  Database,
  Server,
  Globe,
  Cpu,
  Smartphone,
  Wifi,
  CodeIcon,
  Shield,
  Bell,
  CreditCard,
  Users,
} from "lucide-react";
import {
  SiPostgresql,
  SiNextdotjs,
  SiTypescript,
  SiPrisma,
  SiExpress,
  SiMongodb,
  SiReact,
  SiNodedotjs,
  SiExpo,
  SiTailwindcss,
  SiFramer,
  SiVercel,
  SiSocketdotio,
  SiRedux,
  SiSupabase,
} from "react-icons/si";
import Image from "next/image";

// Tech Stack Icons Mapping - UPDATED
const techIcons: Record<string, React.ReactNode> = {
  // Databases & Backend Services
  PostgreSQL: <SiPostgresql className="w-5 h-5" />,
  Supabase: <SiSupabase className="w-5 h-5" />,
  MongoDB: <SiMongodb className="w-5 h-5" />,
  Prisma: <SiPrisma className="w-5 h-5" />,
  Database: <Database className="w-5 h-5" />,

  // Backend
  "Node.js": <SiNodedotjs className="w-5 h-5" />,
  "Express.js": <SiExpress className="w-5 h-5" />,
  "Auth.js": <Server className="w-5 h-5" />,
  JWT: <Shield className="w-5 h-5" />,
  Stripe: <CreditCard className="w-5 h-5" />,
  bcrypt: <Cpu className="w-5 h-5" />,

  // Frontend
  React: <SiReact className="w-5 h-5" />,
  "Next.js": <SiNextdotjs className="w-5 h-5" />,
  TypeScript: <SiTypescript className="w-5 h-5" />,
  "Tailwind CSS": <SiTailwindcss className="w-5 h-5" />,
  Redux: <SiRedux className="w-5 h-5" />,
  "Context API": <Server className="w-5 h-5" />,

  // Mobile
  "React Native": <SiReact className="w-5 h-5" />,
  Expo: <SiExpo className="w-5 h-5" />,
  Smartphone: <Smartphone className="w-5 h-5" />,

  // Real-time (keeping for reference but not using for these projects)
  WebSockets: <Wifi className="w-5 h-5" />,
  "Socket.io": <SiSocketdotio className="w-5 h-5" />,

  // Features
  RLS: <Shield className="w-5 h-5" />,
  "REST API": <Globe className="w-5 h-5" />,
  "Framer Motion": <SiFramer className="w-5 h-5" />,
  Vercel: <SiVercel className="w-5 h-5" />,
  "SMS Notifications": <Bell className="w-5 h-5" />,
  Authentication: <Users className="w-5 h-5" />,
};

// Tech Stack Tooltip Component
const TechIcon = ({ tech }: { tech: string }) => {
  const icon = techIcons[tech] || <Code className="w-5 h-5" />;

  return (
    <div className="relative group/tech">
      <div className="p-2 rounded-lg bg-secondary/50 border border-border hover:bg-secondary hover:border-primary/30 transition-all duration-200 cursor-help">
        {icon}
      </div>
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-foreground text-background text-xs font-medium rounded opacity-0 group-hover/tech:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
        {tech}
        <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-foreground"></div>
      </div>
    </div>
  );
};

// Project Card Component
const ProjectCard = ({
  title,
  description,
  tags,
  links,
  imageUrl,
}: {
  title: string;
  description: string;
  tags: string[];
  links: { github?: string; demo?: string };
  imageUrl: string;
}) => {
  return (
    <div className="group overflow-hidden rounded-xl border border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/10 bg-background/50 backdrop-blur-sm">
      {/* Project Image */}
      <div className="relative h-48 overflow-hidden bg-linear-to-br from-secondary to-background">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-linear-to-br from-primary/10 to-accent/10">
            <Code className="w-16 h-16 text-primary/30" />
          </div>
        )}
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-linear-to-t from-background/80 via-background/20 to-transparent" />
      </div>

      <div className="p-6">
        {/* Title */}
        <h3 className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors mb-4">
          {title}
        </h3>

        {/* Tech Stack Icons */}
        <div className="flex flex-wrap gap-2 mb-4">
          {tags.map((tag) => (
            <TechIcon key={tag} tech={tag} />
          ))}
        </div>

        {/* Description */}
        <p className="text-muted-foreground mb-6 line-clamp-3">{description}</p>

        {/* Links */}
        <div className="flex items-center justify-between pt-4 border-t border-border/30">
          <div className="flex items-center gap-4">
            {title === "AllBarber" ? (
              <span className="text-sm">Protected Code</span>
            ) : (
              <a
                href={links.github}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors group/link"
              >
                <Github className="w-4 h-4" />
                <span className="font-medium">Code</span>
              </a>
            )}
            {links.demo && (
              <a
                href={links.demo}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors group/link"
              >
                <ExternalLink className="w-4 h-4" />
                <span className="font-medium">Live Demo</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Projects Component
export default function Projects() {
  const projects = [
    {
      title: "AllBarber",
      description:
        "A multi-tenant SaaS platform for barbershop management featuring Supabase for real-time data sync and PostgreSQL Row-Level Security (RLS) for data isolation. Implements role-based access control (RBAC) with Auth.js authentication, Stripe payments, and SMS notifications. Reduced customer wait times by 25% through optimized queue management.",
      tags: [
        "Supabase",
        "PostgreSQL",
        "RLS",
        "Auth.js",
        "Stripe",
        "Next.js",
        "TypeScript",
        "SMS Notifications",
      ],
      links: {
        github: "https://github.com/MinhTam2773/AllBarber",
        demo: "https://allbarber.vercel.app/",
      },
      imageUrl: "/projects/allbarber.png",
    },
    {
      title: "Sharie",
      description:
        "Audio-sharing social platform with secure JWT authentication, token rotation, and bcrypt password hashing. Built with a modern REST API architecture using Express.js middleware for protected endpoints. Features user profiles, audio uploads, and social interactions with a clean, responsive interface.",
      tags: [
        "Express.js",
        "JWT",
        "bcrypt",
        "React",
        "Node.js",
        "Authentication",
        "REST API",
      ],
      links: {
        github: "https://github.com/MinhTam2773/Sharie",
        demo: "https://sharie-audio.vercel.app",
      },
      imageUrl: "/projects/sharie.png",
    },
    {
      title: "Ecommerce Mobile App",
      description:
        "React Native mobile e-commerce application with gesture-based navigation and REST API integration for real-time inventory and pricing. Manages complex global state across 15+ screens using Context API. Features product browsing, cart management, secure checkout flow, and smooth animations.",
      tags: [
        "React Native",
        "Context API",
        "REST API",
        "Expo",
        "TypeScript",
        "Smartphone",
      ],
      links: {
        github: "https://github.com/MinhTam2773/Ecommerce",
        demo: "https://ecommerce-solution-fall-2025--ecommerce.expo.app/",
      },
      imageUrl: "/projects/ecommerce.png",
    },
    {
      title: "Sound Wave",
      description:
        "Music streaming platform built with Supabase for real-time data synchronization and PostgreSQL for scalable data storage. Features user authentication, playlist management, audio streaming, and a responsive UI with smooth animations. Leverages Supabase's real-time capabilities for collaborative playlist updates.",
      tags: [
        "Supabase",
        "PostgreSQL",
        "Next.js",
        "TypeScript",
        "Tailwind CSS",
        "Framer Motion",
        "Authentication",
      ],
      links: {
        github: "https://github.com/MinhTam2773/Sound-Wave",
        demo: "https://sound-wave-opal.vercel.app",
      },
      imageUrl: "/projects/sound-wave.png",
    },
  ];

  return (
    <PageTransition>
      <div id="projects">
        <header className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <CodeIcon className="text-primary w-8 h-8" />
            <h1 className="bg-linear-to-r from-white to-primary text-transparent bg-clip-text text-3xl md:text-4xl font-bold">
              Featured Projects
            </h1>
          </div>
          <div className="relative h-px w-full mx-auto overflow-hidden rounded-full">
            {/* Static gradient bar */}
            <div className="absolute inset-0 bg-linear-to-r from-transparent via-primary to-transparent"></div>
            {/* Glow effect */}
            <div className="absolute inset-0 bg-primary/20 blur-sm"></div>
          </div>
        </header>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.map((project) => (
            <ProjectCard key={project.title} {...project} />
          ))}
        </div>

        {/* View More Button */}
        <div className="text-center mt-12">
          <a
            href="https://github.com/MinhTam2773"
            target="_blank"
            rel="noopener noreferrer"
            className="
              inline-flex items-center gap-2 px-6 py-3 rounded-lg
              border border-primary text-primary font-medium
              hover:bg-primary/10 transition-all duration-200
              group
            "
          >
            <Github className="w-5 h-5" />
            View All Projects on GitHub
            <ExternalLink className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
          </a>
        </div>
      </div>
    </PageTransition>
  );
}