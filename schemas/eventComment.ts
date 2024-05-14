

import { z } from 'zod';

export const eventCommentSchema = z.object({
  comment: z.string().min(2, { message: 'Comment must be at least 2 characters long' }),
});