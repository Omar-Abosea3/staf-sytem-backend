
import HalfMonthBonusModel from "../DB/models/halfMounthBonus.model.js";
import UserModel from "../DB/models/usersModel.js";
import { asyncHandeller } from "../utils/errorHandlig.js";
import sheetHandeler, { dataDateFormatter, ExcelRowData } from "../utils/sheetHandler.js";
import { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import { ApiFeatures } from "../utils/apiFeatures.js";
import Notification from "../DB/models/notificationsModel.js";
import parseNumber from "../utils/convertStrNum.js";
import { systemRoles } from "../utils/systemRoles.js";

export const addHalfMonthBonus = asyncHandeller(async (req: Request, res: Response, next: NextFunction) => {
  const filePath = req.file?.path;
  const {month:userMonth} = req.body;
  console.log(filePath);
  const data = sheetHandeler(filePath!);
  let dataAfterAddingDate: any[] = data.map((doc: any) => {
    const date = userMonth ? new Date(userMonth) : new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const formattedDate = `${year}-${month}`;
    return { ...doc, month: formattedDate };
  });
  let dataAfterConvertPayrole = dataAfterAddingDate.map((doc: ExcelRowData) => {
    return { ...doc, "الرقم الوظيفي": parseNumber(doc["الرقم الوظيفي"]) };
  });

  const ops = dataAfterConvertPayrole.map(doc => ({
    updateOne: {
      filter: { "الرقم الوظيفي": doc["الرقم الوظيفي"], "month": doc["month"] },
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
  if (insertData.upsertedCount === 0) return next(new Error("this data was be added before or it's in invalid format", { cause: 400 }));
  const users = await UserModel.find().select("_id adKey");
  const filterdUser = dataAfterAddingDate.filter((item) => {
    return users.some((user) => user.adKey === item["الرقم الوظيفي"]);
  });
  if (filterdUser.length !== 0) {
    filterdUser.forEach(async (element) => {
      await Notification.create({ title: "New Half Month Bonus", message: "There is a new half month bonus available for you.", userId: element["الرقم الوظيفي"], module: "Half Month Bonus" });
    });
  }
  return res.status(200).json({ message: "half month bonus added successfully", data: insertData });
});

export const getStafManHalfMonthBonus = asyncHandeller(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const { month } = req.query;
  if(req.user.role === systemRoles.STAF && req.user.adKey !== id){
    return next(new Error("You are not authorized to access this resource", { cause: 403 }));
  }
  const queryData: any = {
    "الرقم الوظيفي": id,
  }
  if (month) {
    queryData.month = month;
  }

  const statistic = await HalfMonthBonusModel.find(queryData).sort({ month: -1 });
  console.log(statistic);

  if (!statistic) {
    return next(new Error("Failed to get statistic", { cause: 500 }));
  }
  return res.status(200).json({ message: "success", data: statistic });
});

export const getAllHalfMonthBonusWithFilters = asyncHandeller(async (req: Request, res: Response, next: NextFunction) => {
  // Build the base query with filters and search for counting
  console.log(req.query);

  const baseQuery = new ApiFeatures(HalfMonthBonusModel.find(), req.query)
    .search()
    .filters();

  // Get total count based on filters
  const totalCount = await HalfMonthBonusModel.countDocuments(baseQuery.mongooseQuery.getFilter());

  // Build the full query with sorting and pagination
  const apiFeatures = new ApiFeatures(HalfMonthBonusModel.find(), req.query)
    .search()
    .filters()
    .sort()
    .pagination();

  // Execute the query
  const bonuses = await apiFeatures.mongooseQuery;

  // Calculate pagination metadata
  const size = parseInt(req.query.size as string) || 10;
  const page = parseInt(req.query.page as string) || 1;
  const totalPages = Math.ceil(totalCount / size);

  return res.status(200).json({
    message: "success",
    data: bonuses,
    totalCount,
    size,
    page,
    totalPages
  });
});

export const deleteDataByMonth = asyncHandeller(async (req: Request, res: Response, next: NextFunction) => {
  const { month } = req.body;
  const date = new Date(month);
  const year = date.getFullYear();
  const convertedMonth = String(date.getMonth() + 1).padStart(2, '0');
  const formattedDate = `${year}-${convertedMonth}`;
  console.log(formattedDate);
  const data = await HalfMonthBonusModel.find({ month: formattedDate });
  
  const deletedData = await HalfMonthBonusModel.deleteMany({ month: formattedDate });

  if(deletedData.deletedCount === 0) return next(new Error("you don't have any data for this year and month to delete", { cause: 404 }));
  return res.status(200).json({ message: "success" });
});
