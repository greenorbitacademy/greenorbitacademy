import { z, defineCollection } from 'astro:content';
import slugify from 'slugify';

/** Default fallback image for content entries */
const DEFAULT_FEATURED_IMAGE = '/images/default-featured.jpg';

/** Base schema for general content types */
const baseSchema = z.object({
  title: z.string().min(4),
  description: z.string().max(500).optional().default(''),
  summary: z.string().max(300).optional().default(''),
  pubdate: z
    .string()
    .optional()
    .refine(val => !val || !isNaN(Date.parse(val)), {
      message: 'pubdate must be a valid ISO 8601 date string',
    }),
  slug: z.string().optional(),
  author: z.string().optional().default(''),
  tags: z.array(z.string()).optional().default([]),
  category: z.enum(['for space', 'from space', 'in space', 'e-commerce', 'SaaS', 'Healthcare']).optional(),
  url: z.string().url().optional().nullable(),
  notion_page_id: z.string().optional().default(''),
  exported_at: z.string().optional().default(''),
  featuredImage: z
    .string()
    .regex(/^(https?:\/\/|\/)/, { message: 'featuredImage must be a full URL or start with /' })
    .optional()
    .default(DEFAULT_FEATURED_IMAGE),
  seoTitle: z.string().max(70).optional().default(''),
  seoDescription: z.string().max(160).optional().default(''),
  featured: z.boolean().optional(),
  pledges: z.array(z.string()).optional().default([]),
  organisations: z.array(z.string()).optional().default([]),
  SDGs: z.array(z.number()).optional().default([]),
});

/** Learning content schema — for Masterclasses, Courses, Workshops, Training */
const learningSchema = baseSchema.extend({
  instructor: z.object({
    name: z.string().min(3),
    role: z.string().optional().default('Instructor'),
    avatar: z.string().optional().default(DEFAULT_FEATURED_IMAGE),
  }).optional(),
  image: z.string().optional().default(DEFAULT_FEATURED_IMAGE),
  students: z.number().optional().default(0),
  hours: z.number().optional().default(0),
  duration: z.string().optional().default(''),
  level: z.enum(['Beginner', 'Intermediate', 'Advanced']).optional().default('Intermediate'),
  language: z.string().optional().default('English'),
  prerequisites: z.string().optional().default(''),
  price: z.number().optional().default(0),
  originalPrice: z.number().optional(),
  learn: z.array(z.string()).optional().default([]),
  learnColumns: z.array(z.array(z.string())).optional().default([]),
  curriculum: z
    .array(
      z.object({
        title: z.string(),
        duration: z.string().optional(),
        lessons: z.array(
          z.object({
            title: z.string(),
            duration: z.string().optional(),
          })
        ).optional().default([]),
      })
    )
    .optional()
    .default([]),
  tabs: z
    .array(
      z.object({
        title: z.string(),
        heading: z.string().optional(),
        italic: z.string().optional(),
        content: z.string().optional(),
        image: z.string().optional(),
      })
    )
    .optional()
    .default([]),
  features: z
    .array(
      z.object({
        icon: z.string().optional().default('bi bi-check-circle'),
        text: z.string(),
      })
    )
    .optional()
    .default([]),
  info: z
    .array(
      z.object({
        label: z.string(),
        value: z.string(),
      })
    )
    .optional()
    .default([]),
  cta: z
    .object({
      heading: z.string(),
      text: z.string(),
      url: z.string().optional(),
      buttonText: z.string().optional(),
    })
    .optional(),
  enrollUrl: z.string().url().optional(),
  previewUrl: z.string().url().optional(),
});


/** Define all collections */
export const collections = {
  blog: defineCollection({ schema: baseSchema }),
  resources: defineCollection({ schema: baseSchema }),
  insights: defineCollection({ schema: baseSchema }),
  team: defineCollection({ schema: baseSchema }),
  organisations: defineCollection({ schema: baseSchema }),

  /** Learning Collections */
  masterclasses: defineCollection({
    schema: learningSchema,
    slug: entry => entry.data.slug ?? slugify(entry.data.title, { lower: true, strict: true }),
  }),
  courses: defineCollection({
    schema: learningSchema,
    slug: entry => entry.data.slug ?? slugify(entry.data.title, { lower: true, strict: true }),
  }),
  workshops: defineCollection({
    schema: learningSchema,
    slug: entry => entry.data.slug ?? slugify(entry.data.title, { lower: true, strict: true }),
  }),
  training: defineCollection({
    schema: learningSchema,
    slug: entry => entry.data.slug ?? slugify(entry.data.title, { lower: true, strict: true }),
  }),
};