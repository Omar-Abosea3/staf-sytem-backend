
import { model, Schema } from "mongoose";
import { systemRoles } from "../../utils/systemRoles.js";

const userSchema = new Schema(
  {
    userName: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true },
    groups: [{ type: String, required: true, trim: true }],
    adKey: { type: String, required: true, unique: true, trim: true , default:"0000" },
    tokens: [String]
  },
  {
    timestamps: true,
  }
);

const UserModel = model("User", userSchema);
export default UserModel;