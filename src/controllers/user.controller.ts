import { asyncHandeller } from "../utils/errorHandlig.js";
import { Request, Response, NextFunction } from "express";
import UserModel from "../DB/models/usersModel.js";
import fs from "fs";
import { hashSync, compareSync } from "bcrypt";
import { createToken } from "../utils/token-manager.js";
import authenticateUser from "../utils/authinticateUser.js";


export const login = asyncHandeller(
  async (req: Request, res: Response, next: NextFunction) => {
    const { userName, password } = req.body;
    const { user, groups } = await authenticateUser(userName, password);
    if (!user) return next(new Error("Invalid credentials", { cause: 400 }));
    const foundedDBUser = await UserModel.findOne({ userName });
    if (!foundedDBUser) {
      const hashedPassword = hashSync(password, parseInt(process.env.SALT) || 10);
      const newUser = await UserModel.create({ userName, password: hashedPassword, adKey: user.adKey, groups: groups[0] });
      const token: string = createToken(newUser._id.toString(), newUser.userName);
      newUser.tokens = [...newUser.tokens, token];
      await newUser.save();
      return res.status(200).json({ message: "success", data: { userName: newUser.userName, adKey: newUser.adKey }, token });
    }
    const token: string = createToken(foundedDBUser._id.toString(), foundedDBUser.userName);
    foundedDBUser.tokens = [...foundedDBUser.tokens, token];
    await foundedDBUser.save();
    return res.status(200).json({ message: "success", data: { userName: foundedDBUser.userName, adKey: foundedDBUser.adKey }, token });
  }
);

export const logout = asyncHandeller(
  async (req: Request, res: Response, next: NextFunction) => {
    const { user } = req;
    user.tokens = user.tokens.filter((token: string) => token !== req.token);
    await user.save();
    return res.status(200).json({ message: "user logged out successfully" });
  }
);


