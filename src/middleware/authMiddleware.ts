import { Response, NextFunction, Request } from "express";
import { asyncHandeller } from "../utils/errorHandlig.js";
import UserModel from "../DB/models/usersModel.js";
import { systemRoles } from "../utils/systemRoles.js";
import { Payload } from "../types/Payload.js";
import { verifyToken } from "../utils/token-manager.js";

export const isAuthenticated = (roles: string[]) => {
  return asyncHandeller(
    async (req: Request, _res: Response, next: NextFunction) => {
      const { authorization } = req.headers;
      if (!authorization)
        return next(new Error("Please login first!", { cause: 401 }));

      const token = authorization;

      const decoded: Payload = verifyToken(token, next);
  
      if (!decoded) {
        return next(new Error("انتهت صلاحية الجلسة", { cause: 401 }));
      }
      const user = await UserModel.findOne({ _id: decoded.id, tokens: { $in: [token] } });
      if (!user) return next(new Error("No user found", { cause: 404 }));
      if(!roles.includes(user.role)) return next(new Error("You are not authorized to access this resource", { cause: 403 }));
      req.token = token;
      req.user = user;
      next();
    }
  );
};