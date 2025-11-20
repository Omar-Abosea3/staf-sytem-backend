import { Schema ,model } from 'mongoose';

const departmentSchema = new Schema({
  department: {
    type: String,
    required: true,
    trim: true
  },
  msempl: {
    type: String,
    required: true,
    trim: true
  },
  msname: {
    type: String,
    required: true,
    trim: true
  },
  msnama: {
    type: String,
    required: true,
    trim: true,
  }
}, { timestamps: true });

const DepartmentModel = model('Department', departmentSchema);
export default DepartmentModel;
