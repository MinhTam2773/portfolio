"use client"

import { PageTransition } from "@/components/PageTransition";
import { 
  SiTypescript, SiJavascript, SiPython, 
  SiReact, SiNextdotjs, SiTailwindcss, SiNodedotjs, SiExpress,
  SiDotnet, SiPostgresql, SiMongodb, SiMysql, SiGit,
  SiFigma, SiPrisma, SiSanity, SiSupabase,
  SiVercel
} from "react-icons/si";
import { IoLogoFirebase } from "react-icons/io5";
import { TbBrandCSharp } from "react-icons/tb";
import { FaJava } from "react-icons/fa";
import { Database, Server, Key, Cpu } from "lucide-react";

export default function TechArsenal() {
  const techIcons = [
    // Row 1: Languages & Core
    { Icon: FaJava, name: "Java", color: "#007396", shortName: "Java" },
    { Icon: SiTypescript, name: "TypeScript", color: "#3178C6", shortName: "TS" },
    { Icon: SiJavascript, name: "JavaScript", color: "#F7DF1E", shortName: "JS" },
    { Icon: TbBrandCSharp, name: "C#", color: "#239120", shortName: "C#" },
    { Icon: SiPython, name: "Python", color: "#3776AB", shortName: "Python" },
    { Icon: Database, name: "PL/pgSQL", color: "#336791", shortName: "PL/SQL" },
    
    // Row 2: Frontend & Backend
    { Icon: SiReact, name: "React", color: "#61DAFB", shortName: "React" },
    { Icon: SiNextdotjs, name: "Next.js", color: "white", shortName: "Next.js" },
    { Icon: SiTailwindcss, name: "Tailwind CSS", color: "#06B6D4", shortName: "Tailwind" },
    { Icon: SiNodedotjs, name: "Node.js", color: "#339933", shortName: "Node.js" },
    { Icon: SiExpress, name: "Express", color: "white", shortName: "Express" },
    { Icon: SiDotnet, name: ".NET", color: "#512BD4", shortName: ".NET" },
    
    // Row 3: Databases & Tools
    { Icon: SiPostgresql, name: "PostgreSQL", color: "#336791", shortName: "PostgreSQL" },
    { Icon: SiMongodb, name: "MongoDB", color: "#47A248", shortName: "MongoDB" },
    { Icon: SiMysql, name: "MySQL", color: "#4479A1", shortName: "MySQL" },
    { Icon: SiPrisma, name: "Prisma", color: "white", shortName: "Prisma" },
    { Icon: SiSanity, name: "Sanity", color: "#F03E2F", shortName: "Sanity" },
    { Icon: SiSupabase, name: "Supabase", color: "#3ECF8E", shortName: "Supabase" },
    { Icon: IoLogoFirebase, name: "Firebase", color: "#FFCA28", shortName: "Firebase" },
    { Icon: Key, name: "JWT", color: "white", shortName: "JWT" },
    { Icon: Server, name: "Auth.js", color: "white", shortName: "Auth.js" },
    { Icon: SiGit, name: "Git", color: "#F05032", shortName: "Git" },
    { Icon: SiFigma, name: "Figma", color: "#F24E1E", shortName: "Figma" },
    { Icon: SiVercel, name: "Vercel", color: "white", shortName: "Vercel" },

  ];

  return (
    <PageTransition>
      <div id="tech">
        <header className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Cpu className="text-primary w-8 h-8" />
            <h1 className="bg-linear-to-r from-white to-primary text-transparent bg-clip-text text-3xl md:text-4xl font-bold">
              Tech Arsenal
            </h1>
          </div>
          <div className="relative h-px w-full mx-auto overflow-hidden rounded-full">
            {/* Static gradient bar */}
            <div className="absolute inset-0 bg-linear-to-r from-transparent via-primary to-transparent"></div>
            {/* Glow effect */}
            <div className="absolute inset-0 bg-primary/20 blur-sm"></div>
          </div>
        </header>

          {/* Tech Icons Grid */}
          <div className="relative">
            {/* Grid Container - Adjusted for text space */}
            <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2 md:gap-3">
              {techIcons.map(({ Icon, name, color, shortName }) => (
                <div 
                  key={name} 
                  className="relative group flex flex-col items-center"
                >
                  {/* Icon Container */}
                  <div 
                    className="
                      w-14 h-14 md:w-16 md:h-16 rounded-xl
                      flex items-center justify-center
                      bg-secondary/40 backdrop-blur-sm
                      border border-border/50
                      transition-all duration-300
                      group-hover:scale-110
                      group-hover:border-primary/30
                      group-hover:shadow-lg
                      group-hover:shadow-primary/10
                      group-hover:z-10
                      mb-2
                    "
                  >
                    <Icon 
                      className="w-7 h-7 md:w-8 md:h-8" 
                      style={{ color }}
                    />
                  </div>
                  
                  {/* Technology Name */}
                  <div className="
                    text-xs font-medium text-center text-muted-foreground
                    transition-colors duration-200
                    group-hover:text-foreground
                    line-clamp-2 h-8 flex items-center justify-center
                    px-1
                  ">
                    {shortName}
                  </div>
                </div>
              ))}
            </div>
          </div>
      </div>
    </PageTransition>
  );
}