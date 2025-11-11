import { Router } from "express";
import {
    getAllDeductions,
    getDeductionById,
    deleteDeduction,
    getAllDeductionCodes,
    getEmployeeDeductions,
    addDeductionsFromFile,
    getAllDeductionsWithFilters,
    addDeductionCodesFromFile
} from "../controllers/deducations.controller.js";
import { isAuthenticated } from "../middleware/authMiddleware.js";
import { multerFunction } from "../middleware/multerMiddleware.js";
import { validateExcelData } from "../middleware/excelValidationMiddleware.js";
import { systemRoles } from "../utils/systemRoles.js";

const deductionRouter = Router();

// Deduction routes
deductionRouter.post("/upload", isAuthenticated([systemRoles.ADMIN]), multerFunction().single('file'), validateExcelData('deduction'), addDeductionsFromFile);
deductionRouter.post("/upload/ded-code", isAuthenticated([systemRoles.ADMIN]), multerFunction().single('file'), validateExcelData('deductionCode'), addDeductionCodesFromFile);
deductionRouter.get("/codes", isAuthenticated([systemRoles.ADMIN]), getAllDeductionCodes);
deductionRouter.get("/", isAuthenticated([systemRoles.ADMIN]), getAllDeductions);
deductionRouter.get("/with-filters", isAuthenticated([systemRoles.ADMIN]), getAllDeductionsWithFilters);
deductionRouter.get("/:id", isAuthenticated([systemRoles.ADMIN, systemRoles.STAF]), getDeductionById);
deductionRouter.get("/employee/:id", isAuthenticated([systemRoles.ADMIN, systemRoles.STAF]), getEmployeeDeductions);
deductionRouter.delete("/delete-by-month", isAuthenticated([systemRoles.ADMIN]), deleteDeduction);

export default deductionRouter;