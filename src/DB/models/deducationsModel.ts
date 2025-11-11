import { model, Schema, Types } from "mongoose";
import { deducationTypes } from "../../utils/deducationType.js";

const deductionsSchema = new Schema({
    inempl:{type:String , required:true},
    inlncd:{type:Types.ObjectId , ref:"DeducationCode" , required:true},
    name:{type:String , required:true},
    insval:{type:Number , default:0},
    deducationModel:{type:String , required:true , enum:[...deducationTypes.month , ...deducationTypes.halfMonth , deducationTypes.year]},
    month:{type:String , required:true}
},{
    timestamps:true,
    toJSON:{virtuals:true},
    toObject:{virtuals:true}
});

const DeducationModel = model('Deducation' , deductionsSchema);
export default DeducationModel;