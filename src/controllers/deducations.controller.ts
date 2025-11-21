import { Request, Response, NextFunction } from "express";
import DeducationModel from "../DB/models/deducationsModel.js";
import DeducationCodeModel from "../DB/models/deducationCode.model.js";
import UserModel from "../DB/models/usersModel.js";
import { Types } from "mongoose";
import { deducationTypes } from "../utils/deducationType.js";
import { asyncHandeller } from "../utils/errorHandlig.js";
import { ApiFeatures } from "../utils/apiFeatures.js";
import { systemRoles } from "../utils/systemRoles.js";
import sheetHandeler, { ExcelRowData } from "../utils/sheetHandler.js";
import fs from "fs";
import Notification from "../DB/models/notificationsModel.js";
import parseNumber from "../utils/convertStrNum.js";

// Add deductions from Excel file
export const addDeductionsFromFile = asyncHandeller(async (req: Request, res: Response, next: NextFunction) => {
    const filePath = req.file?.path;
    const { month, deducationModel } = req.body;
    if (!filePath) {
        return next(new Error("No file uploaded", { cause: 400 }));
    }

    console.log(filePath);

    const data = sheetHandeler(filePath);

    // Validate that all deduction codes exist
    const deductionCodeIds = [...new Set(data.map((doc: any) => doc.inlncd))];
    const existingCodes = await DeducationCodeModel.find({
        _id: { $in: deductionCodeIds }
    });

    const existingCodeIds = new Set(existingCodes.map(code => code._id.toString()));
    const missingCodes = deductionCodeIds.filter(id => !existingCodeIds.has(id));

    if (missingCodes.length > 0) {
        fs.unlink(filePath, (err) => {
            if (err) {
                console.error(err);
            }
        });
        // return next(new Error(`The following deduction codes do not exist: ${missingCodes.join(', ')}`, { cause: 404 }));
    }

    // Convert data after validating deduction codes
    let dataAfterConvertPayrole = data.map((doc: ExcelRowData) => {
        return {
            ...doc,
            inempl: parseNumber(doc.inempl),
            insval: String(doc.insval) || 0,
            month,
            deducationModel: deducationModel,
            inlncd: doc.inlncd // Convert string to ObjectId
        };
    });
    console.log(dataAfterConvertPayrole);
    
    const ops = dataAfterConvertPayrole.map((doc: any) => ({
        updateOne: {
            filter: { inempl: doc.inempl, month: doc.month, inlncd: doc.inlncd , deducationModel:doc.deducationModel },
            update: { $setOnInsert: doc },
            upsert: true
        }
    }));
    console.log(ops);
    
    const insertData = await DeducationModel.bulkWrite(ops, { ordered: false });
    console.log(insertData);
    
    fs.unlink(filePath, (err) => {
        if (err) {
            console.error(err); 
        }
    });

    if (insertData.upsertedCount === 0) return next(new Error("this data was be added before or it's in invalid format", { cause: 400 }));

    const users = await UserModel.find().select("_id adKey");

    const filterdUser = dataAfterConvertPayrole.filter((item) => {
        return users.some((user) => user.adKey === item.inempl);
    });

    // if (filterdUser.length !== 0) {
    //     filterdUser.forEach(async (element) => {
    //         await Notification.create({
    //             title: "New Deduction",
    //             message: "There is a new deduction added for you.",
    //             userId: element.inempl,
    //             module: "Deduction"
    //         });
    //     });
    // }

    return res.status(200).json({ message: "deductions added successfully", data: insertData });
});

// Add deduction codes from Excel file
export const addDeductionCodesFromFile = asyncHandeller(async (req: Request, res: Response, next: NextFunction) => {
    const filePath = req.file?.path;

    if (!filePath) {
        return next(new Error("No file uploaded", { cause: 400 }));
    }

    console.log(filePath);

    const data = sheetHandeler(filePath);

    let dataAfterConvertPayrole = data.map((doc: ExcelRowData) => {
        return {
            _id: doc.lncod, // Keep the provided _id
            lnnam: doc.lnnam
        };
    });

    const ops = dataAfterConvertPayrole.map((doc: any) => ({
        updateOne: {
            filter: { _id: doc._id },
            update: { $setOnInsert: doc },
            upsert: true
        }
    }));

    const insertData = await DeducationCodeModel.bulkWrite(ops, { ordered: false });

    fs.unlink(filePath, (err) => {
        if (err) {
            console.error(err);
        }
    });

    if (insertData.upsertedCount === 0) return next(new Error("this data was be added before or it's in invalid format", { cause: 400 }));

    return res.status(200).json({ message: "deduction codes added successfully", data: insertData });
});

// Get all deductions with populated deduction codes
export const getAllDeductions = asyncHandeller(async (req: Request, res: Response, next: NextFunction) => {
    // Build the base query with filters and search for counting
    console.log(req.query);

    const baseQuery = new ApiFeatures(DeducationModel.find(), req.query)
        .search()
        .filters();

    // Get total count based on filters
    const totalCount = await DeducationModel.countDocuments(baseQuery.mongooseQuery.getFilter());

    // Build the full query with sorting and pagination
    const apiFeatures = new ApiFeatures(DeducationModel.find(), req.query)
        .search()
        .filters()
        .sort()
        .pagination();

    // Execute the query
    const deductions = await apiFeatures.mongooseQuery.populate('inlncd');

    // Calculate pagination metadata
    const size = parseInt(req.query.size as string) || 10;
    const page = parseInt(req.query.page as string) || 1;
    const totalPages = Math.ceil(totalCount / size);

    res.status(200).json({
        message: "Deductions retrieved successfully",
        data: deductions,
        totalCount,
        size,
        page,
        totalPages
    });
});

// Get a specific deduction by ID with populated deduction code
export const getDeductionById = asyncHandeller(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    if (!Types.ObjectId.isValid(id)) {
        return next(new Error("Invalid deduction ID", { cause: 400 }));
    }

    const deduction = await DeducationModel.findById(id).populate('inlncd');

    if (!deduction) {
        return next(new Error("Deduction not found", { cause: 404 }));
    }

    res.status(200).json({
        message: "Deduction retrieved successfully",
        data: deduction
    });
});

// Get deductions for a specific employee
export const getEmployeeDeductions = asyncHandeller(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    if (req.user.role === systemRoles.STAF && req.user.adKey !== id) {
        return next(new Error("You are not authorized to access this resource", { cause: 403 }));
    }

    const queryData: any = {
        inempl: id,
    }

    // Build the base query with filters and search for counting
    const baseQuery = new ApiFeatures(DeducationModel.find(queryData), req.query)
        .search()
        .filters();

    // Get total count based on filters
    const totalCount = await DeducationModel.countDocuments(baseQuery.mongooseQuery.getFilter());

    // Build the full query with sorting and pagination
    const apiFeatures = new ApiFeatures(DeducationModel.find(queryData), req.query)
        .search()
        .filters()
        .sort()
        .pagination();

    // Execute the query
    const deductions = await apiFeatures.mongooseQuery.populate('inlncd');

    // Calculate pagination metadata
    const size = parseInt(req.query.size as string) || 10;
    const page = parseInt(req.query.page as string) || 1;
    const totalPages = Math.ceil(totalCount / size);

    res.status(200).json({
        message: "Employee deductions retrieved successfully",
        data: deductions,
        totalCount,
        size,
        page,
        totalPages
    });
});

// Get all deductions with filters (admin view)
export const getAllDeductionsWithFilters = asyncHandeller(async (req: Request, res: Response, next: NextFunction) => {
    // Build the base query with filters and search for counting
    console.log(req.query);

    const baseQuery = new ApiFeatures(DeducationModel.find(), req.query)
        .search()
        .filters();

    // Get total count based on filters
    const totalCount = await DeducationModel.countDocuments(baseQuery.mongooseQuery.getFilter());

    // Build the full query with sorting and pagination
    const apiFeatures = new ApiFeatures(DeducationModel.find(), req.query)
        .search()
        .filters()
        .sort()
        .pagination();

    // Execute the query
    const deductions = await apiFeatures.mongooseQuery.populate('inlncd');

    // Calculate pagination metadata
    const size = parseInt(req.query.size as string) || 10;
    const page = parseInt(req.query.page as string) || 1;
    const totalPages = Math.ceil(totalCount / size);

    res.status(200).json({
        message: "success",
        data: deductions,
        totalCount,
        size,
        page,
        totalPages
    });
});

// Delete a deduction by ID
export const deleteDeduction = asyncHandeller(async (req: Request, res: Response, next: NextFunction) => {
    const { month, type } = req.body;


    const deduction = await DeducationModel.deleteMany({ month: month, deducationModel: type });

    if (!deduction.deletedCount) {
        return next(new Error("Deductions not found", { cause: 404 }));
    }

    res.status(200).json({
        message: "Deductions deleted successfully",
        data: deduction
    });
});

// Get all deduction codes
export const getAllDeductionCodes = asyncHandeller(async (req: Request, res: Response, next: NextFunction) => {
    const deductionCodes = await DeducationCodeModel.find();

    res.status(200).json({
        message: "Deduction codes retrieved successfully",
        data: deductionCodes
    });
});
