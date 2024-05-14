

import { z } from 'zod';

export const CommentType = z.object({
   
    comment: z.string().min(3, { message: 'Comment must be at least 3 characters long' }),
    // createdAt: z.string(),
    // updatedAt: z.string(),
    // profilePic: z.string(),
});