import {Router} from 'express';
import { multerFunction } from '../middleware/multerMiddleware.js';
import { addStatistics, getStafManStatistics } from '../controllers/statistics.controller.js';

const statisticsRouter = Router();

statisticsRouter.post('/add' , multerFunction().single('file') ,addStatistics);
statisticsRouter.get('/:id' , getStafManStatistics);

export default statisticsRouter;