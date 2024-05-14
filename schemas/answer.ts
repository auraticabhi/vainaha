
import { z } from 'zod';

export const AnswerDescriptionType = z.object({
    // id: z.string(),
    // questionId: z.string(),
    description: z.string().min(10, { message: 'Answer must be at least 10 characters long' }),
    answerImageURL: z.string().optional(),
    anonymity: z.boolean().optional(),
    // createdAt: z.string(),
    // updatedAt: z.string(),
    // profilePic: z.string(),
    // postImage: z.string(),
    // likes: z.number(),
    // comments: z.number(),
    // shares: z.number(),
});