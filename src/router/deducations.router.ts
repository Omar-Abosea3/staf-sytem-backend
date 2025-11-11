import { Router } from "express";
import {
    createDeduction,
    getAllDeductions,
    getDeductionById,
    updateDeduction,
    deleteDeduction,
    createDeductionCode,
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
deductionRouter.post("/", isAuthenticated([systemRoles.ADMIN]), createDeduction);
deductionRouter.post("/upload", isAuthenticated([systemRoles.ADMIN]), multerFunction().single('file'), validateExcelData('deduction'), addDeductionsFromFile);
deductionRouter.post("/upload/ded-code", isAuthenticated([systemRoles.ADMIN]), multerFunction().single('file'), validateExcelData('deductionCode'), addDeductionCodesFromFile);
deductionRouter.get("/", isAuthenticated([systemRoles.ADMIN]), getAllDeductions);
deductionRouter.get("/with-filters", isAuthenticated([systemRoles.ADMIN]), getAllDeductionsWithFilters);
deductionRouter.get("/:id", isAuthenticated([systemRoles.ADMIN, systemRoles.STAF]), getDeductionById);
deductionRouter.get("/employee/:id", isAuthenticated([systemRoles.ADMIN, systemRoles.STAF]), getEmployeeDeductions);
deductionRouter.put("/:id", isAuthenticated([systemRoles.ADMIN]), updateDeduction);
deductionRouter.delete("/:id", isAuthenticated([systemRoles.ADMIN]), deleteDeduction);

// Deduction code routes
deductionRouter.post("/codes", isAuthenticated([systemRoles.ADMIN]), createDeductionCode);
deductionRouter.get("/codes", isAuthenticated([systemRoles.ADMIN]), getAllDeductionCodes);

export default deductionRouter;