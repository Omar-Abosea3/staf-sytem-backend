import { Router } from 'express';
import { multerFunction } from '../middleware/multerMiddleware.js';
import { validateExcelData } from '../middleware/excelValidationMiddleware.js';
import { addEmployeeAllowances, getAllEmployeeAllowances } from '../controllers/employeeAllowances.controller.js';



const employeeAllowncesRouter = Router();

employeeAllowncesRouter
    .post('/add', multerFunction().single('file'), validateExcelData('employeeAllowances'), addEmployeeAllowances)
    .get('/', getAllEmployeeAllowances);

export default employeeAllowncesRouter;