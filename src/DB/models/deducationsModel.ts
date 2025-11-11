import { model, Schema } from "mongoose";

const deductionsSchema = new Schema({
    pyempl:{type:String , required:true},
    deducationCode:{type:String , required:true},
    deducationName:{type:String , required:true},
    net:{type:Number , default:0},
    deducationModel:{type:String , required:true , enum:["راتب شهري" , "نصف شهري" , "أرباح"]},
    month:{type:String , required:true}
},{
    timestamps:true
});

const DeducationModel = model('Deducation' , deductionsSchema);
export default DeducationModel;