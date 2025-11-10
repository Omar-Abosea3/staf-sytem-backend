import { Schema ,model } from 'mongoose';

const departmentSchema = new Schema({
  "الادارة": {
    type: String,
    required: true,
    trim: true
  },
  pyempl: {
    type: String,
    required: true,
    unique: true,
    trim: true
  }
}, { timestamps: true });

const DepartmentModel = model('Department', departmentSchema);
export default DepartmentModel;
