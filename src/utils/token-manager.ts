import jwt from 'jsonwebtoken';
import { Response } from 'express';

import {NextFunction} from 'express';
import { Payload } from '../types/Payload.js';


export const createToken = (id:string , userName:string , expiresIn:string = "1m") => {
    const payload : Payload = {id , userName};
    const token = jwt.sign(payload , process.env.JWT_SECRET , {expiresIn : expiresIn});
    return token;
}

export const verifyToken = (token: string , next?:NextFunction) => {
    try {
        token
        return jwt.verify(token, process.env.JWT_SECRET) as Payload;
    } catch (error) {
        return next(new Error("this token is expired", { cause: 401 }));
    }
};
