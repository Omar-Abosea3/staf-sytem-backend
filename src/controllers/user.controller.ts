import { asyncHandeller } from "../utils/errorHandlig.js";
import { Request, Response, NextFunction } from "express";
import UserModel from "../DB/models/usersModel.js";
import fs from "fs";
import { hashSync, compareSync } from "bcrypt";
import { createToken } from "../utils/token-manager.js";
import authenticateUser from "../utils/authinticateUser.js";
import MonthelyPayrollModel from "../DB/models/monthlyPayrollModel.js";
import HalfMonthBonusModel from "../DB/models/halfMounthBonus.model.js";
import TotalProfitsModel from "../DB/models/totalProfits.model.js";
import parseNumber from "../utils/convertStrNum.js";
import { systemRoles } from "../utils/systemRoles.js";


export const login = asyncHandeller(
  async (req: Request, res: Response, next: NextFunction) => {
    const { userName, password } = req.body;
    // const { user, groups } = await authenticateUser(userName, password);
    // console.log(user ,groups);
    // console.log(userName);

    // const adKey = parseNumber(userName) ||"0000";
    // console.log(adKey);
    // if (!user) return next(new Error("Invalid credentials", { cause: 400 }));
    const foundedDBUser = await UserModel.findOne({ userName });
    // if (!foundedDBUser) {
    //   const hashedPassword = hashSync(password, parseInt(process.env.SALT) || 10);
    //   const isAdmin = groups.join(' ').toLowerCase().includes("admin");
    //   const newUser = await UserModel.create({ userName, password: hashedPassword, adKey, groups: groups , role:isAdmin?systemRoles.ADMIN:systemRoles.STAF});
    //   const token: string = createToken(newUser._id.toString(), newUser.userName);
    //   newUser.tokens = [...newUser.tokens, token];
    //   await newUser.save();
    //   return res.status(200).json({ message: "success", data: { userName: newUser.userName, adKey }, token });
    // }
    const comparedPassword = compareSync(password, foundedDBUser.password);
    if (!comparedPassword) return next(new Error("incorrect password", { cause: 400 }));
    const token: string = createToken(foundedDBUser._id.toString(), foundedDBUser.userName);
    foundedDBUser.tokens = [...foundedDBUser.tokens, token];
    await foundedDBUser.save();
    return res.status(200).json({ message: "success", data: { userName: foundedDBUser.userName, adKey: foundedDBUser.adKey, role: foundedDBUser.role }, token });
  }
);

export const logout = asyncHandeller(
  async (req: Request, res: Response, next: NextFunction) => {
    const { user } = req;
    console.log(user);

    user.tokens = user.tokens.filter((token: string) => token !== req.token);
    await user.save();
    return res.status(200).json({ message: "user logged out successfully" });
  }
);


export const getDashboardStates = asyncHandeller(async (req: Request, res: Response, next: NextFunction) => {
  const { type, date } = req.query;

  // Default to monthly if no type specified
  const moduleType = (type as string) || 'monthly';

  // Set default date based on module type
  let targetDate;
  if (date) {
    targetDate = new Date(date as string);
  } else {
    targetDate = new Date();
  }

  switch (moduleType) {
    case 'monthly':
      // Format date for monthly payroll (month-year format)
      const monthYear = `${targetDate.getFullYear()}-${String(targetDate.getMonth() + 1).padStart(2, '0')}`;

      // Get unique employees for the specific month
      const uniqueMonthlyEmployees = await MonthelyPayrollModel.distinct('pyempl', { 'مرتب شهر': monthYear });

      // Calculate totals for the specific month
      const payrollData = await MonthelyPayrollModel.find({ 'مرتب شهر': monthYear });
      const totalPayroll = payrollData.reduce((sum, record) => sum + record['الصافي'], 0);

      // Monthly data for charts (for the specific month)
      const monthlyData = await MonthelyPayrollModel.aggregate([
        { $match: { 'مرتب شهر': monthYear } },
        {
          $group: {
            _id: '$مرتب شهر',
            payroll: { $sum: '$اجمالي الدخل' },
            deductions: { $sum: '$اجمالي الاستقطاعات' }
          }
        }
      ]);

      // Department data for the specific month
      const departmentData = await MonthelyPayrollModel.aggregate([
        { $match: { 'مرتب شهر': monthYear } },
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

      return res.json({
        totalEmployees: uniqueMonthlyEmployees.length,
        totalPayroll,
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
      });

    case 'half_month':
      // Format date for half month bonus (month-year format)
      const halfMonthYear = `${targetDate.getFullYear()}-${String(targetDate.getMonth() + 1).padStart(2, '0')}`;

      // Get unique employees for the specific month
      const uniqueHalfMonthEmployees = await HalfMonthBonusModel.distinct('الرقم الوظيفي', { month: halfMonthYear });

      // Calculate totals for the specific month
      const halfMonthData = await HalfMonthBonusModel.find({ month: halfMonthYear });
      const totalHalfMonthBonus = halfMonthData.reduce((sum, record) => sum + record['صافي مكافاة نصف الشهر'], 0);

      // Monthly data for charts (for the specific month)
      const halfMonthMonthlyData = await HalfMonthBonusModel.aggregate([
        { $match: { month: halfMonthYear } },
        {
          $group: {
            _id: '$month',
            totalBonus: { $sum: '$صافي مكافاة نصف الشهر' },
            totalDeductions: { $sum: '$الاستقطاعات' }
          }
        }
      ]);

      // Employee data for the specific month
      const halfMonthEmployeeData = await HalfMonthBonusModel.aggregate([
        { $match: { month: halfMonthYear } },
        {
          $group: {
            _id: '$الرقم الوظيفي',
            totalBonus: { $sum: '$صافي مكافاة نصف الشهر' }
          }
        }
      ]);

      return res.json({
        totalEmployees: uniqueHalfMonthEmployees.length,
        totalPayroll: totalHalfMonthBonus,
        monthlyData: halfMonthMonthlyData.map(m => ({
          month: m._id,
          payroll: m.totalBonus,
          deductions: m.totalDeductions,
          allowances: 0
        })),
        employeeData: halfMonthEmployeeData.map(e => ({
          employeeId: e._id,
          totalBonus: e.totalBonus
        }))
      });

    case 'yearly_profit':
      // Format date for yearly profits (year only)
      const year = targetDate.getFullYear().toString();

      // Get unique employees for the specific year
      const uniqueYearlyEmployees = await TotalProfitsModel.distinct('رقم العامل', { 'العام': year });

      // Calculate totals for the specific year
      const yearlyData = await TotalProfitsModel.find({ 'العام': year });
      const totalYearlyProfits = yearlyData.reduce((sum, record) => sum + record['صافي مكافاة'], 0);

      // Yearly data for charts (for the specific year)
      const yearlyProfitData = await TotalProfitsModel.aggregate([
        { $match: { 'العام': year } },
        {
          $group: {
            _id: '$العام',
            totalProfits: { $sum: '$صافي مكافاة' },
            totalDeductions: { $sum: '$الاستقطاعات' }
          }
        }
      ]);

      // Employee data for the specific year
      const yearlyEmployeeData = await TotalProfitsModel.aggregate([
        { $match: { 'العام': year } },
        {
          $group: {
            _id: '$رقم العامل',
            totalProfits: { $sum: '$صافي مكافاة' }
          }
        }
      ]);

      return res.json({
        totalEmployees: uniqueYearlyEmployees.length,
        totalPayroll: totalYearlyProfits,
        monthlyData: yearlyProfitData.map(y => ({
          month: y._id,
          payroll: y.totalProfits,
          deductions: y.totalDeductions,
          allowances: 0
        })),
        employeeData: yearlyEmployeeData.map(e => ({
          employeeId: e._id,
          totalBonus: e.totalProfits
        }))
      });

    default:
      return next(new Error('Invalid module type', { cause: 400 }));
  }
});

