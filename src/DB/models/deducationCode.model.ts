import { model } from "mongoose";
import { Schema } from "mongoose";

const deducationCodeSchema = new Schema({
    _id:{
        type: String,
         default: () => `1`,
    },
    lnnam:{
        type: String,
        required: true,
        trim: true,
        unique: true
    }
},{
    timestamps: true
});

const DeducationCodeModel = model('DeducationCode', deducationCodeSchema);
export default DeducationCodeModel;
