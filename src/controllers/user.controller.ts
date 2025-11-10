import { asyncHandeller } from "../utils/errorHandlig.js";
import { Request, Response, NextFunction } from "express";
import UserModel from "../DB/models/usersModel.js";
import fs from "fs";
import { hashSync, compareSync } from "bcrypt";
import { createToken } from "../utils/token-manager.js";
import authenticateUser from "../utils/authinticateUser.js";
import MonthelyPayrollModel from "../DB/models/monthlyPayrollModel.js";
import parseNumber from "../utils/convertStrNum.js";


export const login = asyncHandeller(
  async (req: Request, res: Response, next: NextFunction) => {
    const { userName, password } = req.body;
    const { user, groups } = await authenticateUser(userName, password);
    console.log(user ,groups);
    console.log(userName);
    
    const adKey = parseNumber(userName) ||"0000";
    console.log(adKey);
    if (!user) return next(new Error("Invalid credentials", { cause: 400 }));
    const foundedDBUser = await UserModel.findOne({ userName });
    if (!foundedDBUser) {
      const hashedPassword = hashSync(password, parseInt(process.env.SALT) || 10);
      const newUser = await UserModel.create({ userName, password: hashedPassword, adKey, groups: groups});
      const token: string = createToken(newUser._id.toString(), newUser.userName);
      newUser.tokens = [...newUser.tokens, token];
      await newUser.save();
      return res.status(200).json({ message: "success", data: { userName: newUser.userName, adKey }, token });
    }
    const token: string = createToken(foundedDBUser._id.toString(), foundedDBUser.userName);
    foundedDBUser.tokens = [...foundedDBUser.tokens, token];
    await foundedDBUser.save();
    return res.status(200).json({ message: "success", data: { userName: foundedDBUser.userName, adKey: foundedDBUser.adKey }, token });
  }
); 

export const logout = asyncHandeller(
  async (req: Request, res: Response, next: NextFunction) => {
    const { user } = req;
    user.tokens = user.tokens.filter((token: string) => token !== req.token);
    await user.save();
    return res.status(200).json({ message: "user logged out successfully" });
  }
);


export const getDashboardStates = asyncHandeller(async (req: Request, res: Response, next: NextFunction) => { // Get unique employees
    const uniqueEmployees = await MonthelyPayrollModel.distinct('pyempl');

    // Calculate totals
    const payrollData = await MonthelyPayrollModel.find();
    const totalPayroll = payrollData.reduce((sum, record) => sum + record['اجمالي الدخل'], 0);

    // const deductionsData = await TotalDeductionModel.find();
    // const totalDeductions = deductionsData.reduce((sum, record) => sum + record.totalDeductions, 0);

    // const allowancesData = await StaffAllowanceModel.find();
    // const totalAllowances = allowancesData.reduce((sum, record) => sum + record.amount, 0);

    // Monthly data for charts
    const monthlyData = await MonthelyPayrollModel.aggregate([
      {
        $group: {
          _id: '$مرتب شهر',
          payroll: { $sum: '$اجمالي الدخل' },
          deductions: { $sum: '$اجمالي الاستقطاعات' }
        }
      },
      { $sort: { _id: 1 } },
      { $limit: 12 }
    ]);

    // Department data
    const departmentData = await MonthelyPayrollModel.aggregate([
      {
        $group: {
          _id: '$الادارة',
          employees: { $addToSet: '$pyempl' },
          totalPayroll: { $sum: '$الصافي' }
        }
      },
      {
        $project: {
          department: '$_id',
          employees: { $size: '$employees' },
          totalPayroll: 1
        }
      }
    ]);

    res.json({
      totalEmployees: uniqueEmployees.length,
      totalPayroll,
      // totalDeductions,
      // totalAllowances,
      monthlyData: monthlyData.map(m => ({
        month: m._id,
        payroll: m.payroll,
        deductions: m.deductions,
        allowances: 0 // Calculate from allowances collection
      })),
      departmentData: departmentData.map(d => ({
        department: d.department,
        employees: d.employees,
        totalPayroll: d.totalPayroll
      }))
    });})

