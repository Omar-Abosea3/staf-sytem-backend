import { Router } from 'express';
import { multerFunction } from '../middleware/multerMiddleware.js';
import { validateExcelData } from '../middleware/excelValidationMiddleware.js';
import { addHalfMonthBonus, getStafManHalfMonthBonus, getAllHalfMonthBonusWithFilters } from '../controllers/halfMonthBonus.controller.js';
import { isAuthenticated } from '../middleware/authMiddleware.js';
import { systemRoles } from '../utils/systemRoles.js';

const halfMounthBonusRouter = Router();

halfMounthBonusRouter
    .post('/add', isAuthenticated([systemRoles.ADMIN]) , multerFunction().single('file'), validateExcelData('halfMonthBonus'), addHalfMonthBonus)
    .get('/filter' ,isAuthenticated([systemRoles.ADMIN]) ,getAllHalfMonthBonusWithFilters)
    .get('/:id', isAuthenticated([systemRoles.ADMIN, systemRoles.STAF]) ,getStafManHalfMonthBonus);

export default halfMounthBonusRouter;
