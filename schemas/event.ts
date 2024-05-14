

import {late, z} from 'zod';

export const EventType = z.object({
    // id: z.string(),
    title: z.string().min(5,{message: 'Title must be at least 5 characters long'}),
    description: z.string().optional(),
    eventImageURL: z.string().optional(),
    dateOfEvent: z.date({
        required_error: 'Date of event is required',
    }),
    locationOfEvent: z.string().max(500,{message: 'Location should not be this long'}),
    landmarkLocationOfEvent: z.string().optional(),
    durationOfEvent: z.number().min(1).max(24),
    registrationLink: z.string(),
    sponsors:z.array(z.string()).optional(),
    preConferenceDate: z.date().optional(),
    registrationStartDate: z.date().optional(),
    registrationEndDate: z.date().optional(),
    earlyBirdRegistrationFee: z.number().optional(),
    lateRegistrationFee: z.number().optional(),
    creditPoints: z.number().min(1).optional(),
    contactNumber: z.number().min(10,{message: 'Number should be of exact 10 digits.'}).max(10,{message: 'Number should be of exact 10 digits.'}).optional(),
    isVisible: z.boolean().optional(),
    // createdAt: z.string(),
    // updatedAt: z.string(),
    // profilePic: z.string(),
    // postImage: z.string(),
    // likes: z.number(),
    // comments: z.number(),
    // shares: z.number(),
});