import { Router } from 'express';
import { multerFunction } from '../middleware/multerMiddleware.js';
import { validateExcelData } from '../middleware/excelValidationMiddleware.js';
import { addTotalProfits, getStafManTotalProfits, getAllTotalProfitsWithFilters, deleteByYear } from '../controllers/totalProfits.controller.js';
import { isAuthenticated } from '../middleware/authMiddleware.js';
import { systemRoles } from '../utils/systemRoles.js';

const totalProfitsRouter = Router();

totalProfitsRouter
    .post('/add', isAuthenticated([systemRoles.ADMIN]), multerFunction().single('file'), validateExcelData('totalProfits'), addTotalProfits)
    .get('/admin/all',
        isAuthenticated([systemRoles.ADMIN]), getAllTotalProfitsWithFilters)
    .get('/:id', isAuthenticated([systemRoles.ADMIN, systemRoles.STAF]), getStafManTotalProfits).delete('/',isAuthenticated([systemRoles.ADMIN]), deleteByYear);

export default totalProfitsRouter;