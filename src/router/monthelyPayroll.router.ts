import { Router } from 'express';
import { multerFunction } from '../middleware/multerMiddleware.js';
import { validateExcelData } from '../middleware/excelValidationMiddleware.js';
import { addMonthlyPayroll, getStafManMonthlyPayroll } from '../controllers/monthelyPayRoll.controller.js';


const monthlyPayrollRouter = Router();

monthlyPayrollRouter
    .post('/add', multerFunction().single('file'), validateExcelData('monthlyPayroll'), addMonthlyPayroll)
    .get('/:id', getStafManMonthlyPayroll);

export default monthlyPayrollRouter;
