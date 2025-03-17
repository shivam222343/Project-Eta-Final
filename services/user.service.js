import UserModel from '../models/user.model.js';

export const createUser = async (userData) => {
    const { email, password } = userData;

    // Hash the password
    const hashedPassword = await UserModel.hashPassword(password);

    // Create the user
    const user = await UserModel.create({
        email,
        password: hashedPassword,
    });

    return user;
};

export const getAllUsers = async ({ userId }) => {
    const users = await UserModel.find({
        _id: { $ne: userId },
    });
    return users;
};