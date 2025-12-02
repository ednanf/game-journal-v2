import express, { RequestHandler } from 'express';
import { xss } from 'express-xss-sanitizer';
import zodValidate from '../middlewares/zodValidate.js';
import { userPatchSchema } from '../zodSchemas/user.js';
import {
    deleteUser,
    patchUser,
    whoAmI,
} from '../controllers/userController.js';

const router = express.Router();

router.get('/', whoAmI as RequestHandler);

router.patch(
    '/',
    xss(),
    zodValidate(userPatchSchema),
    patchUser as RequestHandler,
);

router.delete('/', deleteUser as RequestHandler);

export default router;
