import { asyncHandeller } from "../utils/errorHandlig.js";
import { Request, Response, NextFunction } from "express";
import Notification from "../DB/models/notificationsModel.js";
import mongoose from "mongoose";

/**
 * Get all unread notifications for the authenticated user
 */
export const getUnreadNotifications = asyncHandeller(
    async (req: Request, res: Response, next: NextFunction) => {
        const { user } = req;

        if (!user || !user._id) {
            return next(new Error("User not authenticated", { cause: 401 }));
        }

        const unreadNotifications = await Notification.find({
            userId: user._id,
            read: false
        }).sort({ createdAt: -1 });

        return res.status(200).json({
            message: "success",
            count: unreadNotifications.length,
            data: unreadNotifications
        });
    }
);

/**
 * Mark notification(s) as read
 * Can mark a single notification or multiple notifications
 */
export const markAsRead = asyncHandeller(
    async (req: Request, res: Response, next: NextFunction) => {
        const { user } = req;
        const { notificationId, notificationIds } = req.body;

        if (!user || !user._id) {
            return next(new Error("User not authenticated", { cause: 401 }));
        }

        // Handle single notification
        if (notificationId) {
            if (!mongoose.Types.ObjectId.isValid(notificationId)) {
                return next(new Error("Invalid notification ID", { cause: 400 }));
            }

            const notification = await Notification.findOneAndUpdate(
                { _id: notificationId, userId: user._id },
                { read: true },
                { new: true }
            );

            if (!notification) {
                return next(new Error("Notification not found", { cause: 404 }));
            }

            return res.status(200).json({
                message: "Notification marked as read",
                data: notification
            });
        }

        // Handle multiple notifications
        if (notificationIds && Array.isArray(notificationIds)) {
            // Validate all IDs
            const invalidIds = notificationIds.filter(
                (id) => !mongoose.Types.ObjectId.isValid(id)
            );

            if (invalidIds.length > 0) {
                return next(new Error("Invalid notification IDs provided", { cause: 400 }));
            }

            const result = await Notification.updateMany(
                {
                    _id: { $in: notificationIds },
                    userId: user._id
                },
                { read: true }
            );

            return res.status(200).json({
                message: "Notifications marked as read",
                modifiedCount: result.modifiedCount
            });
        }

        return next(new Error("notificationId or notificationIds required", { cause: 400 }));
    }
);

/**
 * Delete a notification
 */
export const deleteNotification = asyncHandeller(
    async (req: Request, res: Response, next: NextFunction) => {
        const { user } = req;
        const { id } = req.params;

        if (!user || !user._id) {
            return next(new Error("User not authenticated", { cause: 401 }));
        }

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return next(new Error("Invalid notification ID", { cause: 400 }));
        }

        const notification = await Notification.findOneAndDelete({
            _id: id,
            userId: user._id
        });

        if (!notification) {
            return next(new Error("Notification not found", { cause: 404 }));
        }

        return res.status(200).json({
            message: "Notification deleted successfully",
            data: notification
        });
    }
);