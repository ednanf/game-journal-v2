import { z } from 'zod';

const userBaseSchema = z.object({
    email: z.email(),
    password: z
        .string()
        .min(6, { error: 'Password must contain at least 6 characters' })
        .trim(),
});

const userRegisterSchema = userBaseSchema.pick({
    email: true,
    password: true,
});

const userLoginSchema = userRegisterSchema;

export { userRegisterSchema, userLoginSchema };
