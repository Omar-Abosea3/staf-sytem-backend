import { Router } from 'express';
import { multerFunction } from '../middleware/multerMiddleware.js';
import { validateExcelData } from '../middleware/excelValidationMiddleware.js';
import { addServiceDetails, getAllServicesDetails, getAllServicesDetailsWithFilters } from '../controllers/servicesDetailes.controller.js';

const servicesDetailsRouter = Router();

servicesDetailsRouter
    .post('/add', multerFunction().single('file'), validateExcelData('servicesDetails'), addServiceDetails)
    .get('/filter', getAllServicesDetailsWithFilters)
    .get('/', getAllServicesDetails);

export default servicesDetailsRouter;
