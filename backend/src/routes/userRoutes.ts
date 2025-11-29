import express, { RequestHandler } from 'express';
import { xss } from 'express-xss-sanitizer';
import authenticate from '../middlewares/authenticate.js';
import zodValidate from '../middlewares/zodValidate.js';
import { userPatchSchema } from '../zodSchemas/user.js';
import {
    deleteUser,
    patchUser,
    whoAmI,
} from '../controllers/userController.js';

const router = express.Router();

router.get('/', authenticate, whoAmI as RequestHandler);
router.patch(
    '/',
    xss(),
    authenticate,
    zodValidate(userPatchSchema),
    patchUser as RequestHandler,
);
router.delete('/', authenticate, deleteUser as RequestHandler);

export default router;
