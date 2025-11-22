import {Schema , model } from "mongoose";
import { ref } from "process";

const employeeAllowancesSchema = new Schema({
  code: {
    type: String,
    ref: "allowancesCode",
    required: true,
    trim: true,
  },
  pyrole: {
    type: String,
    required: true,
    trim: true,
  },
  net:{
    type: Number,
    required: true,
  },
  month:{
    type: String,
    required: true,
    trim: true,
  }
}, { 
  timestamps: true, // يضيف createdAt و updatedAt تلقائيًا
  collection: "medicalItems" // اسم المجموعة في MongoDB
});

const allowancesCodesSchema = new Schema({
  _id: {
    type: String,
  },
  "البند": {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
}, { 
  timestamps: true, // يضيف createdAt و updatedAt تلقائيًا
  collection: "allowancesCodes" // اسم المجموعة في MongoDB
});

const AllowancesCodesModel = model("allowancesCode", allowancesCodesSchema);
const EmployeeAllowancesModel = model("MedicalItem", employeeAllowancesSchema);

export  {EmployeeAllowancesModel , AllowancesCodesModel};
