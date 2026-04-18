import { z } from 'zod';

export const videoSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  thumbnail: z.string().url('Invalid thumbnail URL'),
  duration: z.string().min(1, 'Duration is required').max(20),
  description: z.string().max(2000).optional(),
  videoUrl: z.string().url('Invalid video URL'),
});

export type VideoFormData = z.infer<typeof videoSchema>;

export interface Video extends VideoFormData {
  id: string;
  ownerId: string;
  createdAt: any;
  updatedAt: any;
}
