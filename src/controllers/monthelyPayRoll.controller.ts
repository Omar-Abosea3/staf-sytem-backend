import HalfMonthBonusModel from "../DB/models/halfMounthBonus.model.js";
import MonthelyPayrollModel from "../DB/models/monthlyPayrollModel.js";
import UserModel from "../DB/models/usersModel.js";
import { asyncHandeller } from "../utils/errorHandlig.js";
import sheetHandeler, { dataDateFormatter, ExcelRowData } from "../utils/sheetHandler.js";
import { systemRoles } from "../utils/systemRoles.js";
import { Request, Response, NextFunction } from 'express';
import fs from 'fs';
export const addMonthlyPayroll = asyncHandeller(async (req: Request, res: Response, next: NextFunction) => {
  const filePath = req.file?.path;
  console.log(filePath);
  const data = sheetHandeler(filePath!);
  const role = systemRoles.STAF;
  let dataAfterEditingDate: ExcelRowData[] = dataDateFormatter(data);


  const ops = dataAfterEditingDate.map((doc: ExcelRowData) => ({
    updateOne: {
      filter: { pyempl: doc.pyempl, "مرتب شهر": doc['مرتب شهر'] },
      update: { $setOnInsert: doc },
      upsert: true
    }
  }));

  const insertData = await MonthelyPayrollModel.bulkWrite(ops, { ordered: false });
  fs.unlink(filePath, (err) => {
    if (err) {
      console.error(err);
    }
  });
  const users = await UserModel.find().select("_id");

  if (insertData.upsertedCount === 0) return next(new Error("this data was be added before or it's in invalid format", { cause: 400 }));
  return res.status(200).json({ message: "monthlyPayRoll added successfully", data: insertData });
});

export const getStafManMonthlyPayroll = asyncHandeller(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const statistic = await MonthelyPayrollModel.find({ pyempl: id }).sort({ "مرتب شهر": -1 });
  console.log(statistic);
  const foundedUserName = await HalfMonthBonusModel.findOne({ "الرقم الوظيفي": id });
  if (!statistic) {
    return next(new Error("Failed to get statistic", { cause: 500 }));
  }
  const returnedData = statistic.map((doc: any) => ({
    ...doc._doc,
    userName: foundedUserName ? foundedUserName["الاسم"] : undefined
  }));
  return res.status(200).json({ message: "success", data: returnedData });
});
