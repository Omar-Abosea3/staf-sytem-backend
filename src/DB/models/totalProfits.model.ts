import mongoose from "mongoose";

const totalProfitsSchema = new mongoose.Schema({
  "رقم العامل": { type: String, required: true },
  "اسم العامل": { type: String, required: true },
  "القروض": { type: Number, default: 0 },
  "المرتب الاساسي": { type: Number, default: 0 },
  "معاش تكميلي": { type: Number, default: 0 },
  "الاستقطاعات": { type: Number, default: 0 },
  "م نهايه خدمه": { type: Number, default: 0 },
  "المكافأه":{ type: Number, default: 0 },
  "صافي مكافاة": { type: Number, default: 0 },
  "تامين ادخاري": { type: Number, default: 0 },
  "شهر المرتبات": { type: String },
}, { timestamps: true });

const HalfMonthBonusModel = mongoose.model("TotalProfits", totalProfitsSchema);

export default HalfMonthBonusModel;
