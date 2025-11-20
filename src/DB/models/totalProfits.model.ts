import mongoose from "mongoose";

const totalProfitsSchema = new mongoose.Schema({
  "رقم العامل": { type: String, required: true },
  "اسم العامل": { type: String, required: true },
  "القروض": { type: Number, default: 0 },
  loan1: { type: Number, default: 0 },
  loan2: { type: Number, default: 0 },
  "قرض الإسكان": { type: Number, default: 0 },
  "المرتب الاساسي": { type: Number, default: 0 },
  "معاش تكميلي": { type: Number, default: 0 },
  "الاستقطاعات": { type: Number, default: 0 },
  "م نهايه خدمه": { type: Number, default: 0 },
  "مبلغ المكافأة":{ type: Number, default: 0 },
  "صافي مكافاة": { type: Number, default: 0 },
  "تامين ادخاري": { type: Number, default: 0 },
  "العام": { type: String},
}, { timestamps: true });

const HalfMonthBonusModel = mongoose.model("TotalProfits", totalProfitsSchema);

export default HalfMonthBonusModel;
