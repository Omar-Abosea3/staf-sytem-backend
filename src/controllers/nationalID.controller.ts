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

    // Validate file upload
    if (!filePath) {
      return next(new Error("please upload file", { cause: 400 }));
    }

    // Validate role exists
    if (!role) {
      // Clean up uploaded file
      fs.unlink(filePath, (err) => {
        if (err) console.error("Error deleting file:", err);
      });
      return next(new Error("role is required", { cause: 400 }));
    }

    // Validate role value
    const normalizedRole = role.toString();
    if (
      normalizedRole !== systemRoles.ADMIN &&
      normalizedRole !== systemRoles.STAF
    ) {
      // Clean up uploaded file
      fs.unlink(filePath, (err) => {
        if (err) console.error("Error deleting file:", err);
      });
      return next(new Error("invalid role", { cause: 400 }));
    }

    let data: any[];
    try {
      data = sheetHandeler(filePath);
    } catch (error) {
      // Clean up uploaded file on parsing error
      fs.unlink(filePath, (err) => {
        if (err) console.error("Error deleting file:", err);
      });
      return next(new Error("failed to parse file", { cause: 400 }));
    }

    // Validate data is not empty
    if (!data || data.length === 0) {
      // Clean up uploaded file
      fs.unlink(filePath, (err) => {
        if (err) console.error("Error deleting file:", err);
      });
      return next(new Error("file contains no data", { cause: 400 }));
    }

    // Validate role-specific data format
    if (normalizedRole === systemRoles.ADMIN && data[0]?.employeeNum) {
      // Clean up uploaded file
      fs.unlink(filePath, (err) => {
        if (err) console.error("Error deleting file:", err);
      });
      return next(new Error("this data not for this role", { cause: 400 }));
    }
    if (normalizedRole === systemRoles.STAF && !data[0]?.employeeNum) {
      // Clean up uploaded file
      fs.unlink(filePath, (err) => {
        if (err) console.error("Error deleting file:", err);
      });
      return next(new Error("this data not for this role", { cause: 400 }));
    }

    // Validate nationalID exists in data
    const invalidData = data.find((item: any) => !item.nationalID);
    if (invalidData) {
      // Clean up uploaded file
      fs.unlink(filePath, (err) => {
        if (err) console.error("Error deleting file:", err);
      });
      return next(new Error("nationalID is required for all entries", { cause: 400 }));
    }

    // Process data
    const dataAfterAddingRole = data.map((item: any) => {
      item.role = normalizedRole;
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
  
    try {
      await NationalIDModel.bulkWrite(operations, { ordered: false });
    } catch (error) {
      // Clean up uploaded file on database error
      fs.unlink(filePath, (err) => {
        if (err) console.error("Error deleting file:", err);
      });
      return next(new Error("failed to save data to database", { cause: 500 }));
    }

    // Delete file after finishing the api
    fs.unlink(filePath, (err) => {
      if (err) {
        console.error("Error deleting file:", err);
      }
    });

    return res.status(200).json({
      message: "National IDs added successfully",
      data: dataAfterAddingRole,
    });
  }
); 
