import {Router} from 'express';
import { addNationalIDs } from '../controllers/nationalID.controller.js';
import { multerFunction } from '../middleware/multerMiddleware.js';
import { isAuthenticated } from '../middleware/authMiddleware.js';
import { systemRoles } from '../utils/systemRoles.js';

const nationalIDRouter = Router();

nationalIDRouter.post('/add' ,  multerFunction().single('file') , addNationalIDs);

export default nationalIDRouter;