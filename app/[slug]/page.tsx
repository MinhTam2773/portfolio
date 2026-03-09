import type { Metadata } from "next";
import fs from "node:fs/promises";
import path from "node:path";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink, Github, Shield } from "lucide-react";
import { PageTransition } from "@/components/PageTransition";
import ProjectHeroCarousel from "@/components/ProjectHeroCarousel";
import KeepExploringCarousel from "@/components/KeepExploringCarousel";
import { projects } from "@/lib/projectsData";

function getProjectBySlug(slug: string) {
  return projects.find((project) => project.slug === slug);
}

async function getHeroImagesForProject(slug: string, coverImage: string): Promise<string[]> {
  const searchDirs = [
    {
      fsPath: path.join(process.cwd(), "public", slug),
      publicPrefix: `/${slug}`,
    },
    {
      fsPath: path.join(process.cwd(), "public", "projects", slug),
      publicPrefix: `/projects/${slug}`,
    },
  ];

  for (const dir of searchDirs) {
    try {
      const files = await fs.readdir(dir.fsPath);
      const imageFiles = files
        .filter((file) => /\.(png|jpe?g|webp|avif)$/i.test(file))
        .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

      if (imageFiles.length > 0) {
        return imageFiles.map((fileName) => `${dir.publicPrefix}/${fileName}`);
      }
    } catch {
      // Directory may not exist for all projects; continue searching.
    }
  }

  return [coverImage];
}

type Params = {
  slug: string;
};

type RouteProps = {
  params: Promise<Params>;
};

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: RouteProps): Promise<Metadata> {
  const { slug } = await params;
  const project = getProjectBySlug(slug);

  if (!project) {
    return {
      title: "Project Not Found | MinhTamNguyen",
      description: "The requested project could not be found.",
    };
  }

  return {
    title: `${project.title} | Project Case Study`,
    description: project.shortDescription,
    openGraph: {
      title: `${project.title} | Project Case Study`,
      description: project.shortDescription,
      images: [project.coverImage],
    },
  };
}

export default async function ProjectDetailPage({ params }: RouteProps) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  const heroImages = await getHeroImagesForProject(project.slug, project.coverImage);

  return (
    <PageTransition>
      <main className="container-custom py-12">
        <Link
          href="/#projects"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="font-medium">Back to Projects</span>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.85fr)_minmax(280px,1fr)] gap-10 xl:gap-14">
          <section className="space-y-10">
            <ProjectHeroCarousel images={heroImages} title={project.title} />

            <article className="space-y-4">
              <h2 className="text-3xl font-bold">The Challenge</h2>
              {project.problemStatement.map((paragraph, index) => (
                <p key={`challenge-${index}`} className="text-muted-foreground leading-relaxed text-lg">
                  {paragraph}
                </p>
              ))}
            </article>

            <article className="space-y-4">
              <h2 className="text-3xl font-bold">The Solution</h2>
              {project.solution.map((paragraph, index) => (
                <p key={`solution-${index}`} className="text-muted-foreground leading-relaxed text-lg">
                  {paragraph}
                </p>
              ))}
            </article>

            <section className="space-y-4">
              <h2 className="text-3xl font-bold">Interface Gallery</h2>
              <div className="space-y-6">
                {project.galleryImages.map((imagePath, index) => (
                  <div
                    key={`${imagePath}-${index}`}
                    className="relative w-full aspect-16/10 rounded-xl overflow-hidden border border-border/40"
                  >
                    <Image
                      src={imagePath}
                      alt={`${project.title} screenshot ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            </section>
          </section>

          <aside className="lg:sticky lg:top-8 lg:self-start">
            <div className="rounded-xl border border-border/50 bg-background/60 backdrop-blur-sm p-6 space-y-6">
              <header className="space-y-3">
                <h1 className="text-3xl font-bold">{project.title}</h1>
                <p className="text-muted-foreground">{project.shortDescription}</p>
              </header>

              <div className="pt-5 border-t border-border/40 space-y-4">
                <div className="flex items-start gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Role</p>
                    <p className="font-medium">{project.role}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Timeline</p>
                    <p className="font-medium">{project.timeline}</p>
                  </div>
                </div>
              </div>

              <div className="pt-5 border-t border-border/40">
                <h2 className="text-xs uppercase tracking-wide text-muted-foreground mb-3">Tech Stack</h2>
                <ul className="flex flex-wrap gap-2">
                  {project.techStack.map((tech) => (
                    <li
                      key={tech}
                      className="px-3 py-1.5 rounded-full border border-primary/25 bg-primary/10 text-sm text-primary"
                    >
                      {tech}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-5 border-t border-border/40 space-y-3">
                {project.liveDemoUrl && (
                  <a
                    href={project.liveDemoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2 rounded-lg px-4 py-3 bg-primary text-white font-semibold hover:opacity-90 transition-opacity"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Live Demo
                  </a>
                )}

                {project.githubUrl && !project.isProtected && (
                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2 rounded-lg px-4 py-3 border border-primary/40 text-primary hover:bg-primary/10 transition-colors"
                  >
                    <Github className="w-4 h-4" />
                    View on GitHub
                  </a>
                )}

                {project.isProtected && (
                  <p className="text-sm text-muted-foreground inline-flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Source code protected
                  </p>
                )}
              </div>
            </div>
          </aside>
        </div>

        <section className="mt-14 pt-10 border-t border-border/40">
          <h2 className="text-2xl font-bold mb-6">Keep Exploring</h2>
          <KeepExploringCarousel projects={projects} currentSlug={project.slug} />
        </section>
      </main>
    </PageTransition>
  );
}
