import DepartmentModel from "../DB/models/stafDepartmentsModel.js";
import { asyncHandeller } from "../utils/errorHandlig.js";
import sheetHandeler, { ExcelRowData } from "../utils/sheetHandler.js";
import { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import { ApiFeatures } from "../utils/apiFeatures.js";
import parseNumber from "../utils/convertStrNum.js";

export const addDepartments = asyncHandeller(async (req: Request, res: Response, next: NextFunction) => {
    const filePath = req.file?.path;
    console.log(filePath);
    const data: ExcelRowData[] = sheetHandeler(filePath!);
    const dataAfterEditPayroll = data.map((doc: ExcelRowData) => {
        return {
            ...doc,
            msempl: parseNumber(doc.msempl),
        }
    });
    const ops = dataAfterEditPayroll.map((doc: ExcelRowData) => ({
        updateOne: {
            filter: {
                msempl: doc.msempl,
                department: doc.department
            },
            update: { $setOnInsert: doc },
            upsert: true
        }
    }));
    console.log(ops);
    
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

export const getAllDepartmentsWithFilters = asyncHandeller(async (req: Request, res: Response, next: NextFunction) => {
    // Build the query using ApiFeatures for filtering, sorting, searching, and pagination
    const apiFeatures = new ApiFeatures(DepartmentModel.find(), req.query)
        .search()
        .filters()
        .sort()
        .pagination();

    // Execute the query
    const departments = await apiFeatures.mongooseQuery;

    // Get total count for pagination metadata
    const totalCount = await DepartmentModel.countDocuments();

    return res.status(200).json({
        message: "success",
        data: departments,
        totalCount,
        page: req.query.page || 1,
        size: req.query.size || departments.length
    });
});
