import { Types } from "mongoose";

export type Payload = {
    id : string;
    userName? : string;
    role : string;
    exp?:Date;
}



export type TokenType = {
    token : string;
}

export type IdType = {
    id : Types.ObjectId;
}