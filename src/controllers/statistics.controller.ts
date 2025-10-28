import statisticsModel from "../DB/models/statisticsModel.js";
import { Staf } from "../DB/models/usersModel.js";
import { asyncHandeller } from "../utils/errorHandlig.js";
import sheetHandeler, { dataDateFormatter } from "../utils/sheetHandler.js";
import { systemRoles } from "../utils/systemRoles.js";
import { Request, Response, NextFunction } from 'express';
import fs from 'fs';
export const addStatistics = asyncHandeller(async (req: Request, res: Response, next: NextFunction) => {
  const filePath = req.file?.path;
  console.log(filePath);
  const data = sheetHandeler(filePath!);
  const role = systemRoles.STAF;
  let dataAfterEditingDate: any[] = dataDateFormatter(data) as unknown as any[];
  dataAfterEditingDate = dataAfterEditingDate.slice(1);
  console.log(dataAfterEditingDate);

  const addStafStatistics = await Promise.all(dataAfterEditingDate.map(async (item: any) => {
    const num = item['رقم العامل'];
    console.log(num);

    const stafMan = await Staf.findOne({ stafManNumber: num });
    if (stafMan) {
      item.staf = stafMan?._id;
    }
    return item;
  }));

  const ops = addStafStatistics.map(doc => ({
    updateOne: {
      filter: { "رقم العامل": doc['رقم العامل'], "الشهر": doc['الشهر'] },
      update: { $setOnInsert: doc },
      upsert: true
    }
  }));

  const insertData = await statisticsModel.bulkWrite(ops, { ordered: false });
  fs.unlink(filePath, (err) => {
    if (err) {
      console.error(err);
    }
  });
  return res.status(200).json({ message: "statistics added successfully", data: insertData });
});

export const getStafManStatistics = asyncHandeller(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const statistic = await statisticsModel.find({ "رقم العامل": id }).populate('staf');
  console.log(statistic);

  if (!statistic) {
    return next(new Error("Failed to get statistic", { cause: 500 }));
  }
  return res.status(200).json({ message: "statistic added successfully", data: statistic });
});
