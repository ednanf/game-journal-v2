import express, { RequestHandler } from 'express';
import { xss } from 'express-xss-sanitizer';
import zodValidate from '../middlewares/zodValidate.js';
import { userLoginSchema, userRegisterSchema } from '../zodSchemas/user.js';
import {
    loginUser,
    logoutUser,
    me,
    registerUser,
} from '../controllers/authController.js';
import authenticate from '../middlewares/authenticate.js';

const router = express.Router();

// TODO: implement middlewares

router.post('/register', xss(), zodValidate(userRegisterSchema), registerUser);
router.post('/login', xss(), zodValidate(userLoginSchema), loginUser);
router.post('/logout', logoutUser);
router.get('/me', authenticate, me as RequestHandler);

export default router;
