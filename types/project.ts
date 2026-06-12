export interface Project {
  slug: string;
  title: string;
  shortDescription: string;
  problemStatement: string[];
  solution: string[];
  caseStudySections?: {
    title: string;
    items: {
      title?: string;
      body: string;
    }[];
  }[];
  coverImage: string;
  galleryImages: string[];
  techStack: string[];
  role: string;
  timeline: string;
  liveDemoUrl?: string;
  githubUrl?: string;
  videoUrl?: string;
  videoLabel?: string;
  isProtected?: boolean; // For projects with protected code
}
