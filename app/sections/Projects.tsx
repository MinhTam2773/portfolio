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
  Mail,
  Workflow,
  BrainCircuit,
  Blocks,
  ShieldCheck,
  Navigation,
  HardDrive,
  AudioWaveform,
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
  SiTwilio,
  SiOpenai,
  SiAxios,
  SiReactrouter,
} from "react-icons/si";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { projects } from "@/lib/projectsData";

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
  Postmark: <Mail className="w-5 h-5" />,
  Twilio: <SiTwilio className="w-5 h-5" />,
  Inngest: <Workflow className="w-5 h-5" />,

  // Frontend
  React: <SiReact className="w-5 h-5" />,
  "Next.js": <SiNextdotjs className="w-5 h-5" />,
  TypeScript: <SiTypescript className="w-5 h-5" />,
  "Tailwind CSS": <SiTailwindcss className="w-5 h-5" />,
  Redux: <SiRedux className="w-5 h-5" />,
  "Context API": <Server className="w-5 h-5" />,
  Convex: <Database className="w-5 h-5" />,
  OpenAI: <SiOpenai className="w-5 h-5" />,
  RAG: <BrainCircuit className="w-5 h-5" />,
  "shadcn/ui": <Blocks className="w-5 h-5" />,
  Clerk: <ShieldCheck className="w-5 h-5" />,

  // Mobile
  "React Native": <SiReact className="w-5 h-5" />,
  Expo: <SiExpo className="w-5 h-5" />,
  Smartphone: <Smartphone className="w-5 h-5" />,
  "React Navigation": <Navigation className="w-5 h-5" />,
  Axios: <SiAxios className="w-5 h-5" />,
  AsyncStorage: <HardDrive className="w-5 h-5" />,
  "React Router": <SiReactrouter className="w-5 h-5" />,
  "Wavesurfer.js": <AudioWaveform className="w-5 h-5" />,

  // Real-time (keeping for reference but not using for these projects)
  WebSockets: <Wifi className="w-5 h-5" />,
  "Socket.io": <SiSocketdotio className="w-5 h-5" />,

  // Features
  RLS: <Shield className="w-5 h-5" />,
  "REST API": <Globe className="w-5 h-5" />,
  "REST API Integration": <Globe className="w-5 h-5" />,
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
  slug,
  title,
  description,
  tags,
  imageUrl,
  liveDemoUrl,
  githubUrl,
  isProtected,
}: {
  slug: string;
  title: string;
  description: string;
  tags: string[];
  imageUrl: string;
  liveDemoUrl?: string;
  githubUrl?: string;
  isProtected?: boolean;
}) => {
  const router = useRouter();

  const handleCardClick = () => {
    router.push(`/${slug}`);
  };

  return (
    <article
      onClick={handleCardClick}
      className="group h-full flex flex-col overflow-hidden rounded-xl border border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/10 hover:scale-[1.02] bg-background/50 backdrop-blur-sm cursor-pointer"
    >
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
        <div className="absolute inset-0 bg-linear-to-t from-background/80 via-background/20 to-transparent" />
      </div>

      <div className="p-6 flex-1 flex flex-col">
        <h3 className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors mb-4">
          {title}
        </h3>

        <div className="flex flex-wrap gap-2 mb-4">
          {tags.map((tag) => (
            <TechIcon key={tag} tech={tag} />
          ))}
        </div>

        <p className="text-muted-foreground mb-6 line-clamp-3">{description}</p>

        <div className="mt-auto flex items-center justify-between pt-4 border-t border-border/30 text-sm text-muted-foreground">
          <span className="flex items-center gap-3">
            {liveDemoUrl && (
              <a
                href={liveDemoUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1 text-white hover:text-primary transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                Live Demo
              </a>
            )}
            {!isProtected && githubUrl && (
              <a
                href={githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1 text-white hover:text-primary transition-colors"
              >
                <Github className="w-4 h-4" />
                GitHub
              </a>
            )}
            {isProtected && <span>Protected Code</span>}
          </span>
        </div>
      </div>
    </article>
  );
};

// Main Projects Component
export default function Projects() {
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
            <ProjectCard
              key={project.slug}
              slug={project.slug}
              title={project.title}
              description={project.shortDescription}
              tags={project.techStack}
              imageUrl={project.coverImage}
              liveDemoUrl={project.liveDemoUrl}
              githubUrl={project.githubUrl}
              isProtected={project.isProtected}
            />
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