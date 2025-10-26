import { model, Schema } from "mongoose";
import { systemRoles } from "../../utils/systemRoles.js";


const nationalIDSchema = new Schema({
    nationalID: { type: String, required: true, unique: true, trim: true },
    role: { type: String, required: true, enum: [systemRoles.ADMIN , systemRoles.STAF]},
    employeeNum: { type: String, unique: true, trim: true },
},{
    timestamps:true
});

const NationalIDModel = model("NationalID", nationalIDSchema);
export default NationalIDModel;