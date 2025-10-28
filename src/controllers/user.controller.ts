import { asyncHandeller } from "../utils/errorHandlig.js";
import { Request, Response, NextFunction } from "express";
import sheetHandeler, { dataDateFormatter } from "../utils/sheetHandler.js";
import { systemRoles } from "../utils/systemRoles.js";
import UserModel, { Staf } from "../DB/models/usersModel.js";
import fs from "fs";
import NationalIDModel from "../DB/models/NationalIDModel.js";
import { hashSync, compareSync } from "bcrypt";
import { createToken } from "../utils/token-manager.js";
export const signup = asyncHandeller(
  async (req: Request, res: Response, next: NextFunction) => {
    const { user_Name, password, role, nationalID } = req.body;
    const users = await UserModel.find();
    const nationalIds = await NationalIDModel.find();
    if (
      users.length === 0 &&
      nationalIds.length === 0 &&
      role === systemRoles.ADMIN
    ) {
      const hashedPassword = hashSync(
        password,
        parseInt(process.env.SALT) || 10
      );
      const userData = {
        user_Name,
        role,
        nationalID,
        password: hashedPassword,
      };
      // const nationalIdData = {
      //   nationalID,
      //   role,
      // };
      // await NationalIDModel.create(nationalIdData);
      const user = await UserModel.create(userData);
      const token = createToken(user._id.toString(), user.user_Name, user.role);
      console.log(token);

      user.tokens = [...user.tokens, token];
      await user.save();
      if (!user) {
        return next(new Error("Failed to add user", { cause: 400 }));
      }
      return res
        .status(200)
        .json({ message: "user added successfully", data: user, token });
    }
    console.log(nationalID);
    const foundedNationalID = await NationalIDModel.findOne({ nationalID });
    if (!foundedNationalID) {
      return next(
        new Error("National ID not found enter a valid one", { cause: 400 })
      );
    }
    if (foundedNationalID.role !== role) {
      return next(
        new Error("this national ID is not for this role", { cause: 400 })
      );
    }
    const foundedUserName = await UserModel.findOne({ user_Name });
    if (foundedUserName) {
      return next(
        new Error("user name already exists choose another one", { cause: 400 })
      );
    }
    const userData: any = {
      user_Name,
      role,
      nationalID,
    };
    if (role === systemRoles.STAF)
      userData.stafManNumber = foundedNationalID.employeeNum;
    const hashedPassword = hashSync(password, parseInt(process.env.SALT) || 10);
    userData.password = hashedPassword;
    const user = await UserModel.create(userData);
    const token = createToken(user._id.toString(), user.user_Name, user.role);
    console.log(token);

    user.tokens = [...user.tokens, token];
    await user.save();
    if (!user) {
      return next(new Error("Failed to add user", { cause: 400 }));
    }
    return res
      .status(200)
      .json({ message: "user added successfully", data: user, token });
  }
);

export const login = asyncHandeller(
  async (req: Request, res: Response, next: NextFunction) => {
    const { user_Name, password } = req.body;
    const user = await UserModel.findOne({ user_Name });
    if (!user) {
      return next(new Error("user not found", { cause: 400 }));
    }
    const comparedPassword = compareSync(password, user.password);
    if (!comparedPassword) {
      return next(new Error("incorrect password", { cause: 400 }));
    }
    const token = createToken(user._id.toString(), user.user_Name, user.role);
    user.tokens = [...user.tokens, token];
    await user.save();
    return res
      .status(200)
      .json({ message: "user logged in successfully", data: user, token });
  }
);

export const resetPassword = asyncHandeller(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { password } = req.body;
    const { user } = req;
    if (user.role === systemRoles.ADMIN && user._id.toString() !== id) {
      return next(new Error("unauthorized", { cause: 401 }));
    }
    const foundedUser = await UserModel.findById(id);
    if (!foundedUser) {
      return next(new Error("user not found", { cause: 400 }));
    }
    const hashedPassword = hashSync(password, parseInt(process.env.SALT) || 10);
    foundedUser.password = hashedPassword;
    await foundedUser.save();
    return res
      .status(200)
      .json({ message: "user password reset successfully", data: foundedUser });
  }
);

// export const addStafs = asyncHandeller(async (req: Request, res: Response, next: NextFunction) => {
//     const filePath = req.file?.path;
//     if(!filePath){
//         return next(new Error("please upload file" , {cause : 400}));
//     }
//     console.log(filePath);
//     const data = sheetHandeler(filePath!);
//     const role = systemRoles.STAF;
//     const dataAfterAddingRole = data.map((item:any) => {
//         item.role = role;
//         return item;
//     });
//     console.log(dataAfterAddingRole);

//     // if(dataAfterAddingRole[1].name || dataAfterAddingRole[1].nationalID || dataAfterAddingRole[1].stafManNumber){
//     //     return next(new Error("Failed to add stafs" , {cause : 500}));
//     // }
//     await Staf.insertMany(dataAfterAddingRole ,{ ordered: false }).catch(() => {});

//     // delete file after finishing the api
//     fs.unlink(filePath, (err) => {
//         if (err) {
//             console.error(err);
//         }
//     });
//     return res.status(200).json({message:"Stafs added successfully"});
// });

export const logout = asyncHandeller(
  async (req: Request, res: Response, next: NextFunction) => {
    const { user } = req;
    user.tokens = user.tokens.filter((token: string) => token !== req.token);
    await user.save();
    return res.status(200).json({ message: "user logged out successfully" });
  }
);

export const getEmployees = asyncHandeller(
  async (req: Request, res: Response, next: NextFunction) => {
    const employees = await UserModel.find({ role: systemRoles.STAF });
    return res.status(200).json({ message: "success", data: employees });
  }
);
