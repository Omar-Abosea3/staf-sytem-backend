import jwt from 'jsonwebtoken';
import { Response } from 'express';

import {NextFunction} from 'express';
import { Payload } from '../types/Payload.js';


export const createToken = (id:string , userName:string|null = null , role:string , expiresIn:string = "7d") => {
    const payload : Payload = {id , role};
    if(userName) payload.userName = userName;
    const token = jwt.sign(payload , process.env.JWT_SECRET , {expiresIn : expiresIn});
    return token;
}

export const verifyToken = (token: string , next?:NextFunction) => {
    try {
        return jwt.verify(token, process.env.JWT_SECRET) as Payload;
    } catch (error) {
        return next(new Error("this token is expired", { cause: 401 }));
    }
};
