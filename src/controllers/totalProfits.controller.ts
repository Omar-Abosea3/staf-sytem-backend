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
import TotalProfitsModel from "../DB/models/totalProfits.model.js";

export const addTotalProfits = asyncHandeller(async (req: Request, res: Response, next: NextFunction) => {
    const filePath = req.file?.path;
    const {year} = req.body;
    if (!filePath) {
        return next(new Error("No file uploaded", { cause: 400 }));
    }

    console.log(filePath);

    const data = sheetHandeler(filePath!);
    const date = new Date(year);
    let dataAfterConvertPayrole = data.map((doc: ExcelRowData) => {
        return {
            ...doc,
            "رقم العامل": parseNumber(doc["رقم العامل"]),
            "اسم العامل": doc["اسم العامل"],
            "القروض": parseFloat(doc["القروض"]) || 0, 
            loan1: parseFloat(doc["loan1"]) || 0,
            loan2: parseFloat(doc["loan2"]) || 0,
            "قرض الإسكان": parseFloat(doc["قرض الإسكان"]) || 0,
            "المرتب الاساسي": parseFloat(doc["المرتب الاساسي"]) || 0,
            "معاش تكميلي": parseFloat(doc["معاش تكميلي"]) || 0,
            "الاستقطاعات": parseFloat(doc["الاستقطاعات"]) || 0,
            "م نهايه خدمه": parseFloat(doc["م نهايه خدمه"]) || 0,
            "مبلغ المكافأة": parseFloat(doc["مبلغ المكافأة"]) || 0,
            "صافي مكافاة": parseFloat(doc["صافي مكافاة"]) || 0,
            "تامين ادخاري": parseFloat(doc["تامين ادخاري"]) || 0,
            "العام": date.getFullYear()
        };
    });

    const ops = dataAfterConvertPayrole.map(doc => ({
        updateOne: {
            filter: { "رقم العامل": doc["رقم العامل"] , "العام": date.getFullYear() },
            update: { $setOnInsert: doc },
            upsert: true
        }
    }));

    const insertData = await TotalProfitsModel.bulkWrite(ops, { ordered: false });

    fs.unlink(filePath, (err) => {
        if (err) {
            console.error(err);
        }
    });

    if (insertData.upsertedCount === 0) return next(new Error("this data was be added before or it's in invalid format", { cause: 400 }));

    const users = await UserModel.find().select("_id adKey");

    const filterdUser = dataAfterConvertPayrole.filter((item) => {
        return users.some((user) => user.adKey === item["رقم العامل"]);
    });

    // if (filterdUser.length !== 0) {
    //     filterdUser.forEach(async (element) => {
    //         await Notification.create({
    //             title: "New Total Profits",
    //             message: "There is a new total profits record available for you.",
    //             userId: element["رقم العامل"],
    //             module: "Total Profits"
    //         });
    //     });
    // }

    return res.status(200).json({ message: "total profits added successfully", data: insertData });
});

export const getStafManTotalProfits = asyncHandeller(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    console.log(id);
    
    if (req.user.role === systemRoles.STAF && req.user.adKey !== id) {
        return next(new Error("You are not authorized to access this resource", { cause: 403 }));
    }

    const queryData: any = {
        _id: id,
    }


    const statistic = await TotalProfitsModel.findOne(queryData);
    console.log(statistic);

    if (!statistic) {
        return next(new Error("Failed to get statistic", { cause: 500 }));
    }
    console.log(statistic , "statistic");
    
    return res.status(200).json({ message: "success", data: statistic });
});

export const getAllTotalProfitsWithFilters = asyncHandeller(async (req: Request, res: Response, next: NextFunction) => {
    // Build the base query with filters and search for counting
    console.log(req.query);

    const baseQuery = new ApiFeatures(TotalProfitsModel.find(), req.query)
        .search()
        .filters();

    // Get total count based on filters
    const totalCount = await TotalProfitsModel.countDocuments(baseQuery.mongooseQuery.getFilter());

    // Build the full query with sorting and pagination
    const apiFeatures = new ApiFeatures(TotalProfitsModel.find(), req.query)
        .search()
        .filters()
        .sort()
        .pagination();

    // Execute the query
    const profits = await apiFeatures.mongooseQuery;

    // Calculate pagination metadata
    const size = parseInt(req.query.size as string) || 10;
    const page = parseInt(req.query.page as string) || 1;
    const totalPages = Math.ceil(totalCount / size);

    return res.status(200).json({
        message: "success",
        data: profits,
        totalCount,
        size,
        page,
        totalPages
    });
});

export const deleteByYear = asyncHandeller(async (req: Request, res: Response, next: NextFunction) => {
  const { year:userYear } = req.body;
  const date = new Date(userYear);
  const year = date.getFullYear();
  const formattedDate = `${year}`;
  
  const deletedData = await TotalProfitsModel.deleteMany({ "العام": formattedDate });
  if(deletedData.deletedCount === 0) return next(new Error("you don't have any data for this year to delete", { cause: 404 }));
  return res.status(200).json({ message: "success" });
});
