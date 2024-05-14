import {z} from 'zod';

export const ForumType = z.object({
    // id: z.string(),
    uniqueForumName: z.string().min(3,{message: 'Title must be at least 5 characters long'}),
    name: z.string(),
    description: z.string().optional(),
    forumLogo: z.string().optional(),
    imageURL: z.string().optional(),
    bannerImageURL: z.string().optional(),
    rules: z.string().optional(),
    // createdAt: z.string(),
    // updatedAt: z.string(),
    // profilePic: z.string(),
    // postImage: z.string(),
    // likes: z.number(),
    // comments: z.number(),
    // shares: z.number(),
});