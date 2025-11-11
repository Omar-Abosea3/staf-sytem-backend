import { Router } from 'express';
import { multerFunction } from '../middleware/multerMiddleware.js';
import { validateExcelData } from '../middleware/excelValidationMiddleware.js';
import { addMonthlyPayroll, getStafManMonthlyPayroll, getAllMonthlyPayrollsForAdmin } from '../controllers/monthelyPayRoll.controller.js';
import { isAuthenticated } from '../middleware/authMiddleware.js';
import { systemRoles } from '../utils/systemRoles.js';

const monthlyPayrollRouter = Router();

monthlyPayrollRouter
    .post('/add', isAuthenticated([systemRoles.ADMIN]) ,multerFunction().single('file'), validateExcelData('monthlyPayroll'), addMonthlyPayroll)
    .get('/admin/all',
        isAuthenticated([systemRoles.ADMIN]), getAllMonthlyPayrollsForAdmin)
    .get('/:id', isAuthenticated([systemRoles.ADMIN, systemRoles.STAF]), getStafManMonthlyPayroll);

export default monthlyPayrollRouter;
