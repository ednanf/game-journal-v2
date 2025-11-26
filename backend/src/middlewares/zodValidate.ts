import { NextFunction, Request, Response } from 'express';
import { z, ZodError } from 'zod';
import { BadRequestError } from '../errors/index.js';

const zodValidate =
    <T>(schema: z.Schema<T>) =>
    (req: Request, _res: Response, next: NextFunction) => {
        try {
            req.body = schema.parse(req.body);
            next();
        } catch (e) {
            if (e instanceof ZodError) {
                const message = e.issues.map((i) => i.message).join('. ');
                return next(new BadRequestError(message));
            }
            next(e);
        }
    };

export default zodValidate;
