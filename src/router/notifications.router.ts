import { Router } from 'express';
import { getUnreadNotifications, markAsRead, deleteNotification } from '../controllers/notification.controller.js';
import { isAuthenticated } from '../middleware/authMiddleware.js';
import { systemRoles } from '../utils/systemRoles.js';

const notificationsRouter = Router();

notificationsRouter
    .get('/unread', isAuthenticated([systemRoles.ADMIN, systemRoles.STAF]), getUnreadNotifications)
    .patch('/mark-read', isAuthenticated([systemRoles.ADMIN, systemRoles.STAF]), markAsRead)
    .delete('/:id', isAuthenticated([systemRoles.ADMIN, systemRoles.STAF]), deleteNotification);

export default notificationsRouter;
