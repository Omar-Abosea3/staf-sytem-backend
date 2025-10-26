import { asyncHandeller } from "../utils/errorHandlig.js";
import { Request, Response, NextFunction } from "express";
import sheetHandeler from "../utils/sheetHandler.js";
import { systemRoles } from "../utils/systemRoles.js";
import NationalIDModel from "../DB/models/NationalIDModel.js";
import fs from "fs";
export const addNationalIDs = asyncHandeller(
  async (req: Request, res: Response, next: NextFunction) => {
    const filePath = req.file?.path;
    const { role } = req.body;
    console.log(typeof role, typeof systemRoles.STAF);

    if (!filePath) {
      return next(new Error("please upload file", { cause: 400 }));
    }
    if (
      systemRoles.ADMIN !== role.toString() &&
      systemRoles.STAF !== role.toString()
    ) {
      return next(new Error("invalid role", { cause: 400 }));
    }
    const data: any[] = sheetHandeler(filePath!);
    if (role === systemRoles.ADMIN && data[0]?.employeeNum)
      return next(new Error("this data not for this role"));
    if (role === systemRoles.STAF && !data[0]?.employeeNum)
      return next(new Error("this data not for this role"));
    const dataAfterAddingRole = data.map((item: any) => {
      item.role = role;
      item.nationalID = item.nationalID.toString();
      if (item.employeeNum) item.employeeNum = item.employeeNum.toString();
      return item;
    });
    
    const operations = dataAfterAddingRole.map((doc) => ({
      updateOne: {
        filter: { nationalID: doc.nationalID },
        update: { $setOnInsert: doc },
        upsert: true,
      },
    }));

    await NationalIDModel.bulkWrite(operations, { ordered: false });

    // delete file after finishing the api
    fs.unlink(filePath, (err) => {
      if (err) {
        console.error(err);
      }
    });
    return res
      .status(200)
      .json({
        message: "National IDs added successfully",
        data: dataAfterAddingRole,
      });
  }
);
