import mongoose, { Types, HydratedDocument, Schema, model } from 'mongoose';
import validator from 'validator';
import hashPassword from '../utils/hashPassword.js';
import createJWT from '../utils/createJWT.js';
import comparePasswords from '../utils/comparePasswords.js';

export interface IUser {
    _id: Types.ObjectId;
    email: string;
    password: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface IUserDocument extends IUser, HydratedDocument<IUser> {
    createJWT(payload?: Record<string, unknown>): Promise<string>;
    comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema<IUserDocument>(
    {
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            minlength: [5, 'Email must be at least 5 characters long.'],
            validate: {
                validator(email: string) {
                    return validator.isEmail(email);
                },
                message: 'Please provida a valid email address.',
            },
        },
        password: {
            type: String,
            required: true,
            trim: true,
            minlength: [6, 'Password must be at least 6 characters long'],
            select: false,
        },
    },
    { timestamps: true },
);

// Hash password only if it was modified
UserSchema.pre('save', async function hashPasswordBeforeSave() {
    if (this.isModified('password')) {
        this.password = await hashPassword(this.password);
    }
});

UserSchema.methods.createJWT = async function createUserJWT(
    payload: Record<string, unknown>,
): Promise<string> {
    // Embeds the userId into the JWT for authentication
    return createJWT({ userId: this._id, ...payload });
};

UserSchema.methods.comparePassword = async function compareUserPassword(
    candidatePassword: string,
): Promise<boolean> {
    // Compares the user input password with the current password stored in the DB
    return comparePasswords(candidatePassword, this.password);
};

const User = mongoose.models.User || model<IUserDocument>('User', UserSchema);

export default User;
