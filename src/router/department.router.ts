import { Router } from 'express';
import { multerFunction } from '../middleware/multerMiddleware.js';
import { validateExcelData } from '../middleware/excelValidationMiddleware.js';
import { addDepartments, getAllDepartments } from '../controllers/department.controller.js';



const departmentRouter = Router();

departmentRouter
    .post('/add', multerFunction().single('file'), validateExcelData('department'), addDepartments)
    .get('/', getAllDepartments);

export default departmentRouter;