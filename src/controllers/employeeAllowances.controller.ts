import { AllowancesCodesModel, EmployeeAllowancesModel } from "../DB/models/employeeAllowancesModel.js";
import { asyncHandeller } from "../utils/errorHandlig.js";
import sheetHandeler from "../utils/sheetHandler.js";
import { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import { ApiFeatures } from "../utils/apiFeatures.js";
import parseNumber from "../utils/convertStrNum.js";

export const addEmployeeAllowances = asyncHandeller(async (req: Request, res: Response, next: NextFunction) => {
    const filePath = req.file?.path;
    console.log(filePath);
    const { month: userMonth } = req.body;
    const data = sheetHandeler(filePath!);
    console.log(data);

    // Validate that all deduction codes exist
    const allowncesCodes = [...new Set(data.map((doc: any) => String(doc.code)))];
    const existingCodes = await AllowancesCodesModel.find({
        _id: { $in: allowncesCodes }
    });

    const existingCodeIds = new Set(existingCodes.map(code => code._id.toString()));
    const missingCodes = allowncesCodes.filter(id => !existingCodeIds.has(id));

    if (missingCodes.length > 0) {
        fs.unlink(filePath, (err) => {
            if (err) {
                console.error(err);
            }
        });
        return next(new Error(`The following allowances codes do not exist: ${missingCodes.join(', ')}`, { cause: 404 }));
    }
    const dataAfterConvertingPyroles = data.map((doc: any) => {
        const date = userMonth ? new Date(userMonth) : new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const formattedDate = `${year}-${month}`;
        return {
            ...doc,
            month: formattedDate,
            pyrole: parseNumber(doc.pyrole),
        };
    });
    const ops = dataAfterConvertingPyroles.map(doc => ({
        updateOne: {
            filter: {
                code: doc.code,
                net: doc.net,
                pyrole: doc.pyrole,
                month: doc.month
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

export const getAllEmployeeAllowancesWithFilters = asyncHandeller(async (req: Request, res: Response, next: NextFunction) => {
    // Build the base query with filters and search for counting
    console.log(req.query);

    const baseQuery = new ApiFeatures(EmployeeAllowancesModel.find(), req.query)
        .search()
        .filters();

    // Get total count based on filters
    const totalCount = await EmployeeAllowancesModel.countDocuments(baseQuery.mongooseQuery.getFilter());

    // Build the full query with sorting and pagination
    const apiFeatures = new ApiFeatures(EmployeeAllowancesModel.find(), req.query)
        .search()
        .filters()
        .sort()
        .pagination();

    // Execute the query
    const allowances = await apiFeatures.mongooseQuery;

    // Calculate pagination metadata
    const size = parseInt(req.query.size as string) || 10;
    const page = parseInt(req.query.page as string) || 1;
    const totalPages = Math.ceil(totalCount / size);

    return res.status(200).json({
        message: "success",
        data: allowances,
        totalCount,
        size,
        page,
        totalPages
    });
});

export const deleteDataByMonth = asyncHandeller(async (req: Request, res: Response, next: NextFunction) => {
    const { month } = req.body;
    const date = new Date(month);
    const year = date.getFullYear();
    const convertedMonth = String(date.getMonth() + 1).padStart(2, '0');
    const formattedDate = `${year}-${convertedMonth}`;
    const deletedData = await EmployeeAllowancesModel.deleteMany({ month: formattedDate });

    if (deletedData.deletedCount === 0) return next(new Error("you don't have any data for this year and month to delete", { cause: 404 }));
    return res.status(200).json({ message: "success" });
});


////////////// allownces codes //////////////
export const addAllowancesCodes = asyncHandeller(async (req: Request, res: Response, next: NextFunction) => {
    const filePath = req.file?.path;
    const data = sheetHandeler(filePath!);
    const dataAfterEditingKeys = data.map((doc: any) => {
        return {
            ...doc,
            _id: doc["كود رقم"],
        };
    });
    const ops = dataAfterEditingKeys.map(doc => ({
        updateOne: {
            filter: { _id: doc._id },
            update: { $setOnInsert: doc },
            upsert: true
        }
    }));

    fs.unlink(filePath, (err) => {
        if (err) {
            console.error(err);
        }
    });
    const insertData = await AllowancesCodesModel.bulkWrite(ops, { ordered: false });
    return res.status(200).json({ message: "Allowances codes added successfully", data: insertData });
});

export const getAllAllowancesCodes = asyncHandeller(async (req: Request, res: Response, next: NextFunction) => {
    const allowanceCodes = await AllowancesCodesModel.find();

    res.status(200).json({
        message: "Deduction codes retrieved successfully",
        data: allowanceCodes
    });
});
