import {Request , Response , NextFunction} from 'express';



export const asyncHandeller =(fn:any) => {
    return (req:Request , res:Response , next:NextFunction) => {
        return fn(req , res , next)
        .catch(async(err:any) => {
            console.log(err);
            return next(new Error('request Error' , {cause : 500}));
        })
    }
}


export const glopalErrorHandelling = (err:Error , req:Request , res:Response , next:NextFunction) => {
    if(err){
        if(req.validationErrors){
            return res.status(err.cause || 500).json({message:"validation Errors" , Errors:req.validationErrors})
        }
        console.log(err);
        return res.status(err.cause || 500).json({message:err.message})
    }
}