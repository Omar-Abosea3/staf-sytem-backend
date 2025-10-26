import { model, Schema, Types } from "mongoose";
import { systemRoles } from "../../utils/systemRoles.js";


const statisticsSchema = new Schema(
  {
    "رقم العامل": { type: String, required: true },
    "إســــــم العــــــامل": { type: String, required: true },
    "الشهر": { type: Date, required: true },
    staf: { type: Types.ObjectId, ref: systemRoles.STAF, required: true },
    "المرتب الأساسى": { type: Number, default: 0 },
    "حافز خبرة": { type: Number, default: 0 },
    "حافز الإنتاج": { type: Number, default: 0 },
    "بدل تمثيل": { type: Number, default: 0 },
    "بدل وجبات": { type: Number, default: 0 },
    "بدل إنتقالات": { type: Number, default: 0 },
    "حافز شهرى ثابت": { type: Number, default: 0 },
    "بدل جراج": { type: Number, default: 0 },
    "بدل تخصص": { type: Number, default: 0 },
    "العلاوات الخاصة": { type: Number, default: 0 },
    "علاوة غلاء معيشة": { type: Number, default: 0 },
    "منحة عيد العمال": { type: Number, default: 0 },
    "أجر إضافى": { type: Number, default: 0 },
    "بدل صحراء": { type: Number, default: 0 },
    "بدل وردية": { type: Number, default: 0 },
    "بدل تفرغ": { type: Number, default: 0 },
    "بدل حفر": { type: Number, default: 0 },
    "بدل إغتراب": { type: Number, default: 0 },
    "بدل صرافة": { type: Number, default: 0 },
    "إيرادات أخرى خاضعة": { type: Number, default: 0 },
    "بدل مخاطر": { type: Number, default: 0 },
    "بدل موبايل": { type: Number, default: 0 },
    "بدل طبيعة عمل": { type: Number, default: 0 },
    "بدلات خاضعة": { type: Number, default: 0 },
    "إجمالى الدخل": { type: Number, default: 0 },
    "ضريبة المرتبات": { type: Number, default: 0 },
    "تأمينات مدة سابقة": { type: Number, default: 0 },
    "مكافأة نهاية الخدمة": { type: Number, default: 0 },
    "نقابة وصندوق زمالة": { type: Number, default: 0 },
    "دعم ص. الإسكان": { type: Number, default: 0 },
    "إشتراك علاج عائلى": { type: Number, default: 0 },
    "إجمالى الأقساط": { type: Number, default: 0 },
    "المعاش التكميلى": { type: Number, default: 0 },
    "إشتراك العامل فى التأمينات الإجتماعية": { type: Number, default: 0 },
    "موبايل": { type: Number, default: 0 },
    "إستقطاعات قانون 4 لسنة 2021": { type: Number, default: 0 },
    "مرضى وبدون أجر": { type: Number, default: 0 },
    "إستقطاعات خاضعه": { type: Number, default: 0 },
    "إستقطاعات أخرى خاضعه": { type: Number, default: 0 },
    "إجمالى الإستقطاعات": { type: Number, default: 0 },
    "صافى الدخل": { type: Number, default: 0 },
  },
  { timestamps: true }
);
// statisticsSchema.index({ "رقم العامل": 1, "الشهر": 1 }, { unique: true });

const statisticsModel = model("Statistics", statisticsSchema);
export default statisticsModel;
 