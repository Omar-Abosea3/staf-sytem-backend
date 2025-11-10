import { model, Schema, Types } from "mongoose";



const monthelyPayrollSchema = new Schema(
  {
    pyempl: { type: String, required: true }, 
    "مرتب شهر": { type: String },
    "الاساسي الاصلي ": { type: Number, default: 0 },
    "العلاوات المضمومة": { type: Number, default: 0 },
    "المرتب الاساسي": { type: Number, default: 0 },
    "حافز الخبرة": { type: Number, default: 0 },
    "حافز الانتاج": { type: Number, default: 0 },
    "بدل تمثيل": { type: Number, default: 0 },
    "بدل وجبات ": { type: Number, default: 0 },
    "بدل انتقال": { type: Number, default: 0 },
    "حافز شهري ثابت": { type: Number, default: 0 },
    "بدل جراج": { type: Number, default: 0 },
    "بدل تخصص": { type: Number, default: 0 },
    "العلاوات الخاصة": { type: Number, default: 0 },
    "علاوة غلاء معيشة ": { type: Number, default: 0 },
    "منحة عيد العمال": { type: Number, default: 0 },
    "اجر اضافي": { type: Number, default: 0 },
    "بدل صحراء": { type: Number, default: 0 },
    "بدل وردية": { type: Number, default: 0 },
    "بدل تفرغ": { type: Number, default: 0 },
    "بدل حفر": { type: Number, default: 0 },
    "بدل اغتراب": { type: Number, default: 0 },
    "بدل حزنة": { type: Number, default: 0 },
    "ايردات اخري خاضعة": { type: Number, default: 0 },
    "بدل مخاطر": { type: Number, default: 0 },
    "بدل موبيل ": { type: Number, default: 0 },
    "بدل طبيعة": { type: Number, default: 0 },
    "بدلات اخري خاضعة": { type: Number, default: 0 },
    "اجمالي الدخل": { type: Number, default: 0 },
    "ضريبة مرتبات": { type: Number, default: 0 },
    "قسط تامينات مدد سابقة": { type: Number, default: 0 },
    "مكافاة نهاية الخدمة": { type: Number, default: 0 },
    "نقابة وصندوق زمالة": { type: Number, default: 0 },
    "دعم صندوق الاسكان": { type: Number, default: 0 },
    "اشتراك علاج اسري": { type: Number, default: 0 },
    "اجمالي الاقسط": { type: Number, default: 0 },
    "حصة العامل في المعاش التكميلي": { type: Number, default: 0 },
    "اشتراك العامل في التامينات الاجتماعية": { type: Number, default: 0 },
    "خصم موبييل ": { type: Number, default: 0 },
    "استقطاعات قانون 4 لسنة 2021": { type: Number, default: 0 },
    "مرضي وبدون اجر": { type: Number, default: 0 },
    "استقطاعات اخري  خاضعة": { type: Number, default: 0 },
    "استقطاعات اخري غير خاضعة": { type: Number, default: 0 },
    "اجمالي الاستقطاعات": { type: Number, default: 0 },
    "الصافي": { type: Number, default: 0 },
    pydep: { type: String },
    "الادارة": { type: String },
  },
  { timestamps: true }
);
// monthelyPayrollSchema.index({ "رقم العامل": 1, "الشهر": 1 }, { unique: true });

const MonthelyPayrollModel = model("MonthelyPayroll", monthelyPayrollSchema);
export default MonthelyPayrollModel;
