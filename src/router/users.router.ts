import {Router} from 'express';
import { multerFunction } from '../middleware/multerMiddleware.js';
import {  getEmployees, login, logout, resetPassword, signup } from '../controllers/user.controller.js';
import { isAuthenticated } from '../middleware/authMiddleware.js';
import { systemRoles } from '../utils/systemRoles.js';
const usersRouter = Router();

usersRouter
// .post('/add-stafs' , multerFunction().single('file') ,addStafs)
.post('/signup' , signup)
.post('/login' , login)
.patch('/reset-password/:id' , isAuthenticated([systemRoles.ADMIN]) , resetPassword)
.patch('/logout' , isAuthenticated([systemRoles.ADMIN , systemRoles.STAF]) , logout)
.get('/get-employees' , isAuthenticated([systemRoles.ADMIN]) , getEmployees);


export default usersRouter; 