import HalfMonthBonusModel from "../DB/models/halfMounthBonus.model.js";
import MonthelyPayrollModel from "../DB/models/monthlyPayrollModel.js";
import UserModel from "../DB/models/usersModel.js";
import { asyncHandeller } from "../utils/errorHandlig.js";
import sheetHandeler, { dataDateFormatter, ExcelRowData } from "../utils/sheetHandler.js";
import { systemRoles } from "../utils/systemRoles.js";
import { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import { ApiFeatures } from "../utils/apiFeatures.js";
import Notification from "../DB/models/notificationsModel.js";
import parseNumber from "../utils/convertStrNum.js";
import DepartmentModel from "../DB/models/stafDepartmentsModel.js";
import DeducationModel from "../DB/models/deducationsModel.js";
import { deducationTypes } from "../utils/deducationType.js";
import { EmployeeAllowancesModel } from "../DB/models/employeeAllowancesModel.js";

export const addMonthlyPayroll = asyncHandeller(async (req: Request, res: Response, next: NextFunction) => {
  const filePath = req.file?.path;
  console.log(filePath);
  const data = sheetHandeler(filePath!);
  const role = systemRoles.STAF;
  let dataAfterEditingDate: ExcelRowData[] = dataDateFormatter(data);

  let dataAfterConvertPayrole = dataAfterEditingDate.map((doc: ExcelRowData) => {
    return { ...doc, pyempl: parseNumber(doc.pyempl) };
  });


  const ops = dataAfterConvertPayrole.map((doc: ExcelRowData) => ({
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


  if (insertData.upsertedCount === 0) return next(new Error("this data was be added before or it's in invalid format", { cause: 400 }));
  const users = await UserModel.find().select("_id adKey");
  const filterdUser = dataAfterEditingDate.filter((item) => {
    return users.some((user) => user.adKey === item.pyempl);
  });
  if (filterdUser.length !== 0) {
    filterdUser.forEach(async (element) => {
      await Notification.create({ title: "New Monthly Payroll", message: "There is a new monthly payroll available for you.", userId: element.pyempl, module: "Monthly Payroll" });
    });
  }

  return res.status(200).json({ message: "monthlyPayRoll added successfully", data: insertData });
});

export const getStafManMonthlyPayroll = asyncHandeller(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const {profile} = req.query;
  if (req.user.role === systemRoles.STAF && req.user.adKey !== id) {
    return next(new Error("You are not authorized to access this resource", { cause: 403 }));
  }
  console.log(profile);
  const profileFounded = profile === undefined || profile === "false" || profile === "undefined" ? false : true;
  let queryData: any = {};
    if (req.user.role === systemRoles.ADMIN && !profileFounded) {
      queryData._id = id;
    } else {
      queryData.pyempl = id;
    }
    console.log(queryData);
    
  const statistic = await MonthelyPayrollModel.find(queryData).sort({ "مرتب شهر": -1 });
  console.log(statistic);
  
  if (!statistic) {
    return next(new Error("No payroll data found for this employee", { cause: 404 }));
  }
  const departmentUserId = req.user.role === systemRoles.ADMIN ? statistic[0].pyempl : id;
  const foundedUserName = await DepartmentModel.findOne({ msempl: departmentUserId });
  
  const returnedData = await Promise.all(statistic.map(async (doc: any) => {
    console.log(doc);
    const foundDeducations = await DeducationModel.find({
      inempl: doc.pyempl,
      month: doc['مرتب شهر'],
      deducationModel: deducationTypes.month
    });
    console.log( doc.pyempl , doc['مرتب شهر']);
    
    const foundedAllownces = await EmployeeAllowancesModel.find({
      pyrole: doc.pyempl,
      month: doc['مرتب شهر'],
    }).populate([
      {
        path: "code",
      }
    ]);
    return {
      ...doc.toObject(),
      userName: foundedUserName ? foundedUserName.msname : undefined,
      department: foundedUserName ? foundedUserName.department : undefined,
      deducations: foundDeducations ,
      allowances: foundedAllownces,
    };
  }));
  console.log(returnedData);
  

  return res.status(200).json({
    message: "success",
    data: returnedData
  });
});


export const getAllMonthlyPayrollsForAdmin = asyncHandeller(async (req: Request, res: Response, next: NextFunction) => {
  // Build the base query with filters and search for counting
  console.log(req.query);

  const baseQuery = new ApiFeatures(MonthelyPayrollModel.find(), req.query)
    .search()
    .filters();

  // Get total count based on filters
  const totalCount = await MonthelyPayrollModel.countDocuments(baseQuery.mongooseQuery.getFilter());

  // Build the full query with sorting and pagination
  const apiFeatures = new ApiFeatures(MonthelyPayrollModel.find(), req.query)
    .search()
    .filters()
    .sort()
    .pagination();

  // Execute the query
  const payrolls = await apiFeatures.mongooseQuery;

  // Calculate pagination metadata
  const size = parseInt(req.query.size as string) || 10;
  const page = parseInt(req.query.page as string) || 1;
  const totalPages = Math.ceil(totalCount / size);

  // Enrich data with employee names from HalfMonthBonusModel
  // const enrichedPayrolls = await Promise.all(
  //   payrolls.map(async (payroll: any) => {
  //     const employeeInfo = await HalfMonthBonusModel.findOne({ "الرقم الوظيفي": payroll.pyempl });
  //     return {
  //       ...payroll._doc,
  //       employeeName: employeeInfo ? employeeInfo["الاسم"] : undefined
  //     };
  //   })
  // );

  return res.status(200).json({
    message: "success",
    data: payrolls,
    totalCount,
    size,
    page,
    totalPages
  });
});
