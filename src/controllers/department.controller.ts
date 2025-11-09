import DepartmentModel from "../DB/models/stafDepartmentsModel.js";
import { asyncHandeller } from "../utils/errorHandlig.js";
import sheetHandeler, { ExcelRowData } from "../utils/sheetHandler.js";
import { Request, Response, NextFunction } from 'express';
import fs from 'fs';
export const addDepartments = asyncHandeller(async (req: Request, res: Response, next: NextFunction) => {
    const filePath = req.file?.path;
    console.log(filePath);
    const data: ExcelRowData[] = sheetHandeler(filePath!);
    const ops = data.map((doc: ExcelRowData) => ({
        updateOne: {
            filter: {
                pyempl: doc.pyempl
            },
            update: { $setOnInsert: doc },
            upsert: true
        }
    }));

    const insertData = await DepartmentModel.bulkWrite(ops, { ordered: false });
    fs.unlink(filePath, (err) => {
        if (err) {
            console.error(err);
        }
    });
    if (insertData.upsertedCount === 0) return next(new Error("this data was be added before or it's in invalid format", { cause: 400 }));
    return res.status(200).json({ message: "Employee allowances added successfully", data: insertData });
});

export const getAllDepartments = asyncHandeller(async (req: Request, res: Response, next: NextFunction) => {
    const employeeAllowances = await DepartmentModel.find().sort({ createdAt: -1 });
    if (!employeeAllowances) {
        return next(new Error("Failed to get Departments", { cause: 400 }));
    }
    return res.status(200).json({ message: "success", data: employeeAllowances });
});
