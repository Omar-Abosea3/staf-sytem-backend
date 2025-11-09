import { Router } from 'express';
import { multerFunction } from '../middleware/multerMiddleware.js';
import { validateExcelData } from '../middleware/excelValidationMiddleware.js';
import { addMonthlyPayroll, getStafManMonthlyPayroll, getAllMonthlyPayrollsForAdmin } from '../controllers/monthelyPayRoll.controller.js';

const monthlyPayrollRouter = Router();

monthlyPayrollRouter
    .post('/add', multerFunction().single('file'), validateExcelData('monthlyPayroll'), addMonthlyPayroll)
    .get('/admin/all', getAllMonthlyPayrollsForAdmin)
    .get('/:id', getStafManMonthlyPayroll);

export default monthlyPayrollRouter;
