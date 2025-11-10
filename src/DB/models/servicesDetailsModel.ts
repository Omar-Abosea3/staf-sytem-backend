import { model, Schema } from "mongoose";

const servicesDetailsSchema = new Schema({
    code:{
        type:Number,
        required:true
    },
    pyempl:{
        type:String,
        required:true
    },
    net:{
        type:String,
        required:true
    },
    month:{
        type:String,
        required:true
    }
},{
    timestamps:true
});

const ServicesDetailsModel = model('servicesDetails', servicesDetailsSchema);
export default ServicesDetailsModel;
