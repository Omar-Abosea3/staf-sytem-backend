import EmployeeAllowancesModel from "../DB/models/employeeAllowancesModel.js";
import { asyncHandeller } from "../utils/errorHandlig.js";
import sheetHandeler from "../utils/sheetHandler.js";
import { Request, Response, NextFunction } from 'express';
import fs from 'fs';
export const addEmployeeAllowances = asyncHandeller(async (req: Request, res: Response, next: NextFunction) => {
    const filePath = req.file?.path;
    console.log(filePath);
    const data = sheetHandeler(filePath!);
    const ops = data.map(doc => ({
        updateOne: {
            filter: {
                $or: [
                    { "البند": doc["البند"] },
                    { "كود رقم": doc["كود رقم"] }
                ]
            },
            update: { $setOnInsert: doc },
            upsert: true
        }
    }));

    const insertData = await EmployeeAllowancesModel.bulkWrite(ops, { ordered: false });
    fs.unlink(filePath, (err) => {
        if (err) {
            console.error(err);
        }
    });
    if (insertData.upsertedCount === 0) return next(new Error("this data was be added before or it's in invalid format", { cause: 400 }));
    return res.status(200).json({ message: "Employee allowances added successfully", data: insertData });
});

export const getAllEmployeeAllowances = asyncHandeller(async (req: Request, res: Response, next: NextFunction) => {
    const employeeAllowances = await EmployeeAllowancesModel.find().sort({ createdAt: -1 });
    if (!employeeAllowances) {
        return next(new Error("Failed to get employeeAllowances", { cause: 400 }));
    }
    return res.status(200).json({ message: "success", data: employeeAllowances });
});
