// src/types/JobSchema.ts

export interface JobSchema {
  // Basic metadata
  title: string;
  slug: string;
  location: string;
  experience?: string; // e.g., "2+ Years Experience"
  employment_type: string; // e.g., "Permanent, Full-time"
  department?: string;
  seniority_level?: string; // e.g., "Entry-level", "Mid-level"
  pubdate?: string; // ISO date string

  // SEO & page rendering
  seoTitle?: string;
  seoDescription?: string;
  featuredImage?: string;
  author?: string;

  // Core job content
  context?: string; // Intro/overview of role
  description?: string; // Detailed description
  responsibilities?: string[];
  requirements?: string[];
  preferredQualifications?: string[];
  personSpec?: string;
  benefits?: string[];
  perks?: string;
  process?: string; // Application stages, newline separated
  skills?: string[];

  // Application
  applyLink?: string;
  contact_email?: string;

  // Guidance flags
  disabilitySupport?: boolean;
  aiGuidance?: boolean;
  nationalityRequirements?: boolean;
  internEligibility?: boolean;

  // Optional draft or internal notes
  internalNotes?: string;
}

// Example usage with import:
// import { JobSchema } from '../types/JobSchema';
// const job: JobSchema = jobs.find(j => j.slug === 'freelance-consultant');