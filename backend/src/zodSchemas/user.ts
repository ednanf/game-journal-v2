import { z } from 'zod';

const userBaseSchema = z
    .object({
        email: z.email(),
        password: z
            .string()
            .min(6, { error: 'Password must contain at least 6 characters' })
            .trim(),
    })
    .strict();

const userRegisterSchema = userBaseSchema.pick({
    email: true,
    password: true,
});

const userLoginSchema = userRegisterSchema;

const userPatchSchema = userBaseSchema.partial();

export { userRegisterSchema, userLoginSchema, userPatchSchema };
