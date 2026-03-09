export interface Project {
  slug: string;
  title: string;
  shortDescription: string;
  problemStatement: string[];
  solution: string[];
  coverImage: string;
  galleryImages: string[];
  techStack: string[];
  role: string;
  timeline: string;
  liveDemoUrl?: string;
  githubUrl?: string;
  isProtected?: boolean; // For projects with protected code
}
