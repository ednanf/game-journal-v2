import { Request, Response, NextFunction } from 'express';

const registerUser = (req: Request, res: Response, next: NextFunction) => {
    res.status(200).json({ message: 'register route hit' });
};

const loginUser = (req: Request, res: Response, next: NextFunction) => {
    res.status(200).json({ message: 'login route hit' });
};

const logoutUser = (req: Request, res: Response, next: NextFunction) => {
    res.status(200).json({ message: 'logout route hit' });
};

const me = (req: Request, res: Response, next: NextFunction) => {
    res.status(200).json({ message: 'me route hit' });
};

export { registerUser, loginUser, logoutUser, me };
