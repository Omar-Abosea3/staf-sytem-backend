
import ServicesDetailsModel from "../DB/models/servicesDetailsModel.js";
import { asyncHandeller } from "../utils/errorHandlig.js";
import sheetHandeler from "../utils/sheetHandler.js";
import { Request, Response, NextFunction } from 'express';
import fs from 'fs';
export const addServiceDetails = asyncHandeller(async (req: Request, res: Response, next: NextFunction) => {
    const filePath = req.file?.path;
    console.log(filePath);
    const data:any = sheetHandeler(filePath!);
    const dataAfterEditingDate: any[] = data.map((doc:any) => {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const formattedDate = `${year}-${month}`;
        return { ...doc, month: formattedDate };
    });
    const ops = data.map(doc => ({
        updateOne: {
            filter: { pyempl: doc.pyempl , month: doc.month , code: doc.code },
            update: { $setOnInsert: doc },
            upsert: true
        }
    }));

    const insertData = await ServicesDetailsModel.bulkWrite(ops, { ordered: false });
    fs.unlink(filePath, (err) => {
        if (err) {
            console.error(err);
        }
    });
    if (insertData.upsertedCount === 0) return next(new Error("this data was be added before or it's in invalid format", { cause: 400 }));
    return res.status(200).json({ message: "Services details added successfully", data: insertData });
});

export const getAllServicesDetails = asyncHandeller(async (req: Request, res: Response, next: NextFunction) => {
    const employeeAllowances = await ServicesDetailsModel.find().sort({ createdAt: -1 });
    if (!employeeAllowances) {
        return next(new Error("Failed to get employeeAllowances", { cause: 400 }));
    }
    return res.status(200).json({ message: "success", data: employeeAllowances });
});
