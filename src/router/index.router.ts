import { Router } from 'express';
import usersRouter from './users.router.js';
import monthlyPayrollRouter from './monthelyPayroll.router.js';
import { multerFunction } from '../middleware/multerMiddleware.js';
import sheetHandeler from '../utils/sheetHandler.js';
import halfMounthBonusRouter from './halfMounthBonus.router.js';
import employeeAllowncesRouter from './employeeAllownces.router.js';
import departmentRouter from './department.router.js';
import notificationsRouter from './notifications.router.js';
import servicesDetailsRouter from './servicesDetails.router.js';
import deductionRouter from './deducations.router.js';
import totalProfitsRouter from './totalProfits.router.js';
 
const router = Router();

router.use('/users', usersRouter);
router.use('/monthly-payroll', monthlyPayrollRouter);
router.use('/half-month-bonus', halfMounthBonusRouter);
router.use('/employee-allownces', employeeAllowncesRouter);
router.use('/departments', departmentRouter);
router.use('/notifications', notificationsRouter);
router.use('/services-details', servicesDetailsRouter);
router.use('/deductions', deductionRouter);
router.use('/total-profits', totalProfitsRouter);
router.post('/test-exel-upload', multerFunction().single('file'), async (req, res) => {
    const filePath = req.file?.path;
    console.log(filePath);
    const data = sheetHandeler(filePath!);
    return res.json({ message: "success", data });
})

export default router;