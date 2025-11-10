import { Router } from 'express';
import { multerFunction } from '../middleware/multerMiddleware.js';
import { validateExcelData } from '../middleware/excelValidationMiddleware.js';
import { addHalfMonthBonus, getStafManHalfMonthBonus, getAllHalfMonthBonusWithFilters } from '../controllers/halfMonthBonus.controller.js';

const halfMounthBonusRouter = Router();

halfMounthBonusRouter
    .post('/add', multerFunction().single('file'), validateExcelData('halfMonthBonus'), addHalfMonthBonus)
    .get('/filter', getAllHalfMonthBonusWithFilters)
    .get('/:id', getStafManHalfMonthBonus);

export default halfMounthBonusRouter;
