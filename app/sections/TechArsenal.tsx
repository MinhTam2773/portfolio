"use client"

import SectionHeader from "@/components/fx/SectionHeader";
import { 
  SiTypescript, SiJavascript, SiPython, 
  SiReact, SiNextdotjs, SiTailwindcss, SiNodedotjs, SiExpress,
  SiDotnet, SiPostgresql, SiMongodb, SiMysql, SiGit,
  SiFigma, SiPrisma, SiSanity, SiSupabase,
  SiVercel, SiTwilio, SiOpenai, SiAxios, SiStripe
} from "react-icons/si";
import { IoLogoFirebase } from "react-icons/io5";
import { TbBrandCSharp } from "react-icons/tb";
import { FaJava } from "react-icons/fa";
import { Database, Server, Key, Mail, Workflow, BrainCircuit, ShieldCheck} from "lucide-react";

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
    { Icon: SiOpenai, name: "OpenAI", color: "#10A37F", shortName: "OpenAI" },
    { Icon: BrainCircuit, name: "RAG", color: "#22C55E", shortName: "RAG" },
    { Icon: Database, name: "Convex", color: "#F59E0B", shortName: "Convex" },
    { Icon: ShieldCheck, name: "Clerk", color: "#6C47FF", shortName: "Clerk" },
    
    // Row 3: Databases & Tools
    { Icon: SiPostgresql, name: "PostgreSQL", color: "#336791", shortName: "PostgreSQL" },
    { Icon: SiMongodb, name: "MongoDB", color: "#47A248", shortName: "MongoDB" },
    { Icon: SiMysql, name: "MySQL", color: "#4479A1", shortName: "MySQL" },
    { Icon: SiPrisma, name: "Prisma", color: "white", shortName: "Prisma" },
    { Icon: SiSanity, name: "Sanity", color: "#F03E2F", shortName: "Sanity" },
    { Icon: SiSupabase, name: "Supabase", color: "#3ECF8E", shortName: "Supabase" },
    { Icon: IoLogoFirebase, name: "Firebase", color: "#FFCA28", shortName: "Firebase" },
    { Icon: SiStripe, name: "Stripe", color: "#635BFF", shortName: "Stripe" },
    { Icon: SiTwilio, name: "Twilio", color: "#F22F46", shortName: "Twilio" },
    { Icon: Mail, name: "Postmark", color: "#2C6ECB", shortName: "Postmark" },
    { Icon: Workflow, name: "Inngest", color: "#6366F1", shortName: "Inngest" },
    { Icon: SiAxios, name: "Axios", color: "#5A29E4", shortName: "Axios" },
    { Icon: Key, name: "JWT", color: "white", shortName: "JWT" },
    { Icon: Server, name: "Auth.js", color: "white", shortName: "Auth.js" },
    { Icon: SiGit, name: "Git", color: "#F05032", shortName: "Git" },
    { Icon: SiFigma, name: "Figma", color: "#F24E1E", shortName: "Figma" },
    { Icon: SiVercel, name: "Vercel", color: "white", shortName: "Vercel" },

  ];

  const rows = [techIcons.slice(0, 16), techIcons.slice(16)];

  return (
    <section id="tech" className="scroll-mt-24">
      <SectionHeader index={4} total={4} title="Tech" emphasis="Arsenal" kicker="Instruments in the field kit" />

      <div className="-mx-4 space-y-2 sm:-mx-6 lg:-mx-8">
        {rows.map((row, rowIndex) => (
          <div
            key={rowIndex}
            className="marquee overflow-hidden border-y border-border [mask-image:linear-gradient(90deg,transparent,black_8%,black_92%,transparent)]"
          >
            <div
              className={`marquee-track flex w-max ${rowIndex === 1 ? "reverse" : ""}`}
              style={{ ["--marquee-duration" as string]: `${row.length * 3.2}s` }}
            >
              {[0, 1].map((copy) => (
                <ul key={copy} aria-hidden={copy === 1} className="flex shrink-0">
                  {row.map(({ Icon, name, color }) => (
                    <li
                      key={name}
                      data-cursor={name.toUpperCase()}
                      className="group flex items-center gap-4 border-r border-border px-8 py-6"
                      style={{ ["--brand" as string]: color }}
                    >
                      <Icon className="h-7 w-7 text-muted-foreground transition-colors duration-300 group-hover:text-[var(--brand)]" />
                      <span className="whitespace-nowrap font-serif text-4xl tracking-[-0.01em] transition-colors duration-300 group-hover:italic group-hover:text-primary md:text-5xl">
                        {name}
                      </span>
                    </li>
                  ))}
                </ul>
              ))}
            </div>
          </div>
        ))}
      </div>

      <p className="annot mt-6 text-right">Hover to hold a row · {techIcons.length} instruments</p>
    </section>
  );
}
