import { Router } from 'express';
import { multerFunction } from '../middleware/multerMiddleware.js';
import { validateExcelData } from '../middleware/excelValidationMiddleware.js';
import { addEmployeeAllowances, getAllEmployeeAllowances, getAllEmployeeAllowancesWithFilters } from '../controllers/employeeAllowances.controller.js';

const employeeAllowncesRouter = Router();

employeeAllowncesRouter
    .post('/add', multerFunction().single('file'), validateExcelData('employeeAllowances'), addEmployeeAllowances)
    .get('/filter', getAllEmployeeAllowancesWithFilters)
    .get('/', getAllEmployeeAllowances);

export default employeeAllowncesRouter;
