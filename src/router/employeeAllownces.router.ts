import { Router } from 'express';
import { multerFunction } from '../middleware/multerMiddleware.js';
import { validateExcelData } from '../middleware/excelValidationMiddleware.js';
import { addAllowancesCodes, addEmployeeAllowances, deleteDataByMonth, getAllAllowancesCodes, getAllEmployeeAllowances, getAllEmployeeAllowancesWithFilters } from '../controllers/employeeAllowances.controller.js';

const employeeAllowncesRouter = Router();

employeeAllowncesRouter
    .post('/add', multerFunction().single('file'), validateExcelData('servicesDetails'), addEmployeeAllowances).post('/add-codes', multerFunction().single('file'), validateExcelData('employeeAllowances'), addAllowancesCodes)
    .get('/filter', getAllEmployeeAllowancesWithFilters)
    .get('/', getAllEmployeeAllowances).get('/all-codes', getAllAllowancesCodes).delete('/delete' , deleteDataByMonth);

export default employeeAllowncesRouter;
