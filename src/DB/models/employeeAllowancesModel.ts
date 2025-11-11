import {Schema , model } from "mongoose";

const employeeAllowancesSchema = new Schema({
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
  collection: "medicalItems" // اسم المجموعة في MongoDB
});

const EmployeeAllowancesModel = model("MedicalItem", employeeAllowancesSchema);

export default EmployeeAllowancesModel;
