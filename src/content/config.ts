import { defineCollection, z } from 'astro:content';

const articles = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    draft: z.boolean().default(false),
    tags: z.array(z.string()).default([]),
    hero: z.string().optional(),
    tldr: z.string().optional(),
    readingTime: z.string().default('5 min read')
  })
});

const projects = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    stack: z.array(z.string()).default([]),
    status: z.enum(['planned', 'active', 'archived']).default('planned')
  })
});

export const collections = { articles, projects };
