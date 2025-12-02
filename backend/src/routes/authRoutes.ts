import express from 'express';
import { xss } from 'express-xss-sanitizer';
import zodValidate from '../middlewares/zodValidate.js';
import { userLoginSchema, userRegisterSchema } from '../zodSchemas/user.js';
import {
    loginUser,
    logoutUser,
    registerUser,
} from '../controllers/authController.js';

const router = express.Router();

router.post('/register',
    xss(),
    zodValidate(userRegisterSchema),
    registerUser);

router.post('/login',
    xss(),
    zodValidate(userLoginSchema),
    loginUser);

router.post('/logout', logoutUser);

export default router;
