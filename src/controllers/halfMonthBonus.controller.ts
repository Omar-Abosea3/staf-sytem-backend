
import HalfMonthBonusModel from "../DB/models/halfMounthBonus.model.js";
import UserModel from "../DB/models/usersModel.js";
import { asyncHandeller } from "../utils/errorHandlig.js";
import sheetHandeler, { dataDateFormatter } from "../utils/sheetHandler.js";
import { Request, Response, NextFunction } from 'express';
import fs from 'fs';
export const addHalfMonthBonus = asyncHandeller(async (req: Request, res: Response, next: NextFunction) => {
  const filePath = req.file?.path;
  console.log(filePath);
  const data = sheetHandeler(filePath!);
  let dataAfterAddingDate: any[] = data.map((doc: any) => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const formattedDate = `${year}-${month}`;
    return { ...doc, month: formattedDate };
  });
  console.log(dataAfterAddingDate);
  
  const ops = dataAfterAddingDate.map(doc => ({
    updateOne: {
      filter: { "الرقم الوظيفي": doc["الرقم الوظيفي"], "month": doc.month },
      update: { $setOnInsert: doc },
      upsert: true
    }
  }));

  const insertData = await HalfMonthBonusModel.bulkWrite(ops, { ordered: false });
  fs.unlink(filePath, (err) => {
    if (err) {
      console.error(err);
    }
  });
  if (insertData.upsertedCount === 0) return next(new Error("this data was be added before or it's in invalid format", { cause: 400 }));
  return res.status(200).json({ message: "half month bonus added successfully", data: insertData });
});

export const getStafManHalfMonthBonus = asyncHandeller(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;

  const statistic = await HalfMonthBonusModel.find({ "الرقم الوظيفي": id }).sort({ month: -1 });
  console.log(statistic);

  if (!statistic) {
    return next(new Error("Failed to get statistic", { cause: 500 }));
  }
  return res.status(200).json({ message: "success", data: statistic });
});
