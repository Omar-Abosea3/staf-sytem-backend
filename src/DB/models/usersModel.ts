import { model, Schema } from "mongoose";
import { systemRoles } from "../../utils/systemRoles.js";

const userSchema = new Schema(
  {
    nationalID: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true },
    user_Name: { type: String, required: true, trim: true },
    role: { type: String, required: true, enum: [systemRoles.ADMIN , systemRoles.STAF] },
    tokens:[String]
  },
  {
    timestamps: true,
    discriminatorKey: "role",
    collection: "users",
  }
);

const UserModel = model("User", userSchema);
export default UserModel;
const stafSchema = new Schema({
    stafManNumber: { type: String, required: true, unique: true, trim: true },
    employeeName: { type: String, trim: true },
},{
  timestamps:true,
  toJSON:{virtuals:true},
  toObject:{virtuals:true}
});
const addminSchema = new Schema({

},{
  timestamps:true,
  toJSON:{virtuals:true},
  toObject:{virtuals:true}
});
export const Admin = UserModel.discriminator(systemRoles.ADMIN, addminSchema);
export const Staf = UserModel.discriminator(systemRoles.STAF, stafSchema);