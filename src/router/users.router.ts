import {Router} from 'express';
import { multerFunction } from '../middleware/multerMiddleware.js';
import { getDashboardStates, login, logout } from '../controllers/user.controller.js';
import { isAuthenticated } from '../middleware/authMiddleware.js';
import { systemRoles } from '../utils/systemRoles.js';
const usersRouter = Router();

usersRouter
.post('/login' , login)
.patch('/logout' , isAuthenticated([systemRoles.ADMIN , systemRoles.STAF]) , logout)
.get('/dashboard-stats' , getDashboardStates);
export default usersRouter; 