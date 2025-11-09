import mongoose from "mongoose";

const halfMonthBonusSchema = new mongoose.Schema({
  "الرقم الوظيفي": { type: String, required: true },
  "الاسم": { type: String, required: true },
  bntbsal: { type: Number, default: 0 },
  "الاجر الاساسي": { type: Number, default: 0 },
  "مكافاة الوزير": { type: Number, default: 0 },
  "الاستقطاعات": { type: Number, default: 0 },
  "قرض الاسكان": { type: Number, default: 0 },
  "صافي مكافاة نصف الشهر": { type: Number, default: 0 },
  bodays: { type: Number, default: 0 },
  month: { type: String },
}, { timestamps: true });

const HalfMonthBonusModel = mongoose.model("HalfMonthBonus", halfMonthBonusSchema);

export default HalfMonthBonusModel;
