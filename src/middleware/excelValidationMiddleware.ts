import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import sheetHandeler, { ExcelRowData } from '../utils/sheetHandler.js';
import fs from 'fs';

// Define Joi validation schemas for different models
const validationSchemas = {
    monthlyPayroll: Joi.object({
        pyempl: Joi.string().required().trim().messages({
            'string.base': 'pyempl must be a string',
            'string.empty': 'pyempl cannot be empty',
            'any.required': 'pyempl is required'
        }),
        'مرتب شهر': Joi.alternatives().try(
            Joi.string(),
            Joi.number()
        ).required().messages({
            'any.required': 'مرتب شهر is required'
        })
    }).unknown(true), // Allow other fields from Excel

    department: Joi.object({
        pyempl: Joi.string().required().trim().messages({
            'string.base': 'pyempl must be a string',
            'string.empty': 'pyempl cannot be empty',
            'any.required': 'pyempl is required'
        }),
        'الادارة': Joi.string().required().trim().messages({
            'string.base': 'الادارة must be a string',
            'string.empty': 'الادارة cannot be empty',
            'any.required': 'الادارة is required'
        })
    }).unknown(true),

    employeeAllowances: Joi.object({
        'كود رقم': Joi.number().required().messages({
            'number.base': 'كود رقم must be a number',
            'any.required': 'كود رقم is required'
        }),
        'البند': Joi.string().required().trim().messages({
            'string.base': 'البند must be a string',
            'string.empty': 'البند cannot be empty',
            'any.required': 'البند is required'
        })
    }).unknown(true),

    halfMonthBonus: Joi.object({
        'الرقم الوظيفي': Joi.string().required().trim().messages({
            'string.base': 'الرقم الوظيفي must be a string',
            'string.empty': 'الرقم الوظيفي cannot be empty',
            'any.required': 'الرقم الوظيفي is required'
        }),
        'الاسم': Joi.string().required().trim().messages({
            'string.base': 'الاسم must be a string',
            'string.empty': 'الاسم cannot be empty',
            'any.required': 'الاسم is required'
        }),
        bntbsal: Joi.number().optional().default(0),
        'الاجر الاساسي': Joi.number().optional().default(0),
        'مكافأة الوزير': Joi.number().optional().default(0),
        'الاستقطاعات': Joi.number().optional().default(0),
        'قرض الاسكان': Joi.number().optional().default(0),
        'صافي مكافأة نصف الشهر': Joi.number().optional().default(0),
        bodays: Joi.number().optional().default(0),
        month: Joi.string().optional()
    }).unknown(true),

    servicesDetails: Joi.object({
        code: Joi.number().required().messages({
            'number.base': 'code must be a number',
            'any.required': 'code is required'
        }),
        pyempl: Joi.string().required().trim().messages({
            'string.base': 'pyempl must be a string',
            'string.empty': 'pyempl cannot be empty',
            'any.required': 'pyempl is required'
        }),
        net: Joi.string().required().messages({
            'string.base': 'net must be a string',
            'any.required': 'net is required'
        }),
        month: Joi.string().optional()
    }).unknown(true)
};

/**
 * Middleware factory to validate Excel data against a specific Joi schema
 * @param modelType - The type of model to validate against (e.g., 'monthlyPayroll', 'department')
 */
export const validateExcelData = (modelType: keyof typeof validationSchemas) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            // Check if file exists
            if (!req.file?.path) {
                return next(new Error("No file uploaded", { cause: 400 }));
            }

            const filePath = req.file.path;
            const schema = validationSchemas[modelType];

            if (!schema) {
                // Clean up uploaded file
                fs.unlinkSync(filePath);
                return next(new Error(`Invalid model type: ${modelType}`, { cause: 500 }));
            }

            // Read Excel file
            let data: ExcelRowData[];
            try {
                data = sheetHandeler(filePath);
            } catch (error) {
                fs.unlinkSync(filePath);
                return next(new Error("Failed to read Excel file. Please ensure it's a valid .xlsx file", { cause: 400 }));
            }

            // Check if data is empty
            if (!data || data.length === 0) {
                fs.unlinkSync(filePath);
                return next(new Error("Excel file is empty", { cause: 400 }));
            }

            // Validate each row using Joi
            const errors: string[] = [];
            const validatedData: ExcelRowData[] = [];

            data.forEach((row, index) => {
                const rowNumber = index + 2; // +2 because Excel rows start at 1 and we skip header

                // Validate row with Joi schema
                const { error, value } = schema.validate(row, {
                    abortEarly: false, // Collect all errors
                    stripUnknown: false // Keep unknown fields
                });

                if (error) {
                    // Format Joi validation errors
                    error.details.forEach(detail => {
                        errors.push(`Row ${rowNumber}: ${detail.message}`);
                    });
                } else {
                    validatedData.push(value);
                }
            });

            // If there are validation errors, delete file and return errors
            if (errors.length > 0) {
                fs.unlinkSync(filePath);
                return res.status(400).json({
                    message: "Excel validation failed",
                    errors: errors.slice(0, 20), // Limit to first 20 errors for readability
                    totalErrors: errors.length
                });
            }

            // Validation passed, attach validated data to request for use in controller
            (req as any).excelData = validatedData;

            next();
        } catch (error: any) {
            // Clean up file on error
            if (req.file?.path && fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }
            return next(new Error(error.message || "Excel validation failed", { cause: error.cause || 500 }));
        }
    };
};
