import {Router} from 'express';
import usersRouter from './users.router.js';
import statisticsRouter from './statistics.router.js';
import nationalIDRouter from './notionalID.router.js';
const router = Router();

router.use('/users' , usersRouter);
router.use('/statistics' , statisticsRouter);
router.use('/national-ids' , nationalIDRouter);
export default router; 