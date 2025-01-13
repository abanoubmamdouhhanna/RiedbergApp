import { nanoid } from "nanoid";
import employeeModel from "../../../../DB/models/Employee.model.js";
import problemModel from "../../../../DB/models/Problem.model.js";
import userModel from "../../../../DB/models/User.model.js";
import { asyncHandler } from "../../../utils/errorHandling.js";
import cloudinary from "../../../utils/cloudinary.js";

import { Hash } from "../../../utils/Hash&Compare.js";
import appoinmentModel from "../../../../DB/models/Appointment.model.js";

//create employee

export const createEmployee = asyncHandler(async (req, res, next) => {
  const { userName, email, password, phone ,languages,days} = req.body;

  // Run the email and username existence checks in parallel
  const [existedUser, checkExistUserName] = await Promise.all([
    employeeModel.findOne({ email }),
    employeeModel.findOne({ userName }),
  ]);

  if (existedUser) {
    return next(new Error("Email already exists", { cause: 409 }));
  }

  if (checkExistUserName) {
    return next(new Error("Username already exists", { cause: 409 }));
  }

  // Hash password
  const hashPassword = Hash({ plainText: password });
  // Create the employee in the database
  const createEmployee = await employeeModel.create({
    userName,
    email,
    password: hashPassword,
    phone
    ,languages,days
  });
  return res.status(201).json({
    message: "employee added successfully.",
    user: createEmployee._id,
  });
});

//====================================================================================================================//
//delete employee

export const deleteEmployee = asyncHandler(async (req, res, next) => {
  const Employee = await employeeModel.findByIdAndDelete(req.params.employeeId);
  return res
    .status(200)
    .json({ message: "Employee deleted successfully", result: Employee });
});
//====================================================================================================================//
//create a problem

export const createProblem = asyncHandler(async (req, res, next) => {
  const { userId } = req.params;
  const user = await userModel.findById(userId);
  if (!user) {
    return next(new Error("Invalid user ID", { cause: 404 }));
  }
  if (req.files?.problemImage?.[0]?.path) {
    const customId = nanoid();
    const problemImage = await cloudinary.uploader.upload(
      req.files.problemImage[0].path,
      {
        folder: `${process.env.APP_NAME}/Posts/${customId}/problemImage`,
        public_id: `${customId}problemImage`,
      }
    );
    req.body.problemImage = problemImage.secure_url;
  }
  req.body.createdBy = req.user._id;
  const addProblem = await problemModel.create(req.body);
  user.userProblems.push(addProblem._id);
  await user.save();
  return res.status(201).json({
    status: "success",
    message: "Problem created successfully",
    result: addProblem,
  });
});
//====================================================================================================================//
//create appointment
export const createAppoinment = asyncHandler(async (req, res, next) => {
  const { appoinmentAttachment } = req.files || {};
  const { appoinmentTitle, appoinmentDate, appoinmentTime, reason } =
    req.body;

  if (!appoinmentTitle || !appoinmentDate || !appoinmentTime || !reason) {
    return next(
      new Error("Appoinment title ,date ,time and reason are required.", {
        cause: 400,
      })
    );
  }
  const date = new Date(appoinmentDate);
  if (isNaN(date.getTime())) {
    return next(
      new Error(
        "Invalid appoinment date. Please provide a valid date in 'YYYY-MM-DD' format.",
        { cause: 422 }
      )
    );
  }
  if (date < new Date().setHours(0, 0, 0, 0)) {
    return next(
      new Error("maintenanceDay must be today or in the future.", {
        cause: 400,
      })
    );
  }

  if (appoinmentAttachment?.[0]?.path) {
    try {
      const customId = nanoid();
      const uploadedAttachment = await cloudinary.uploader.upload(
        appoinmentAttachment[0].path,
        {
          folder: `${process.env.APP_NAME}/Appointment/${customId}/appoinmentAttachment`,
          public_id: `${customId}appoinmentAttachment`,
        }
      );
      req.body.appoinmentAttachment = uploadedAttachment.secure_url;
    } catch (error) {
      return next(
        new Error("Failed to upload appoinment attachment.", { cause: 500 })
      );
    }
  }

  req.body.employeeId = req.user._id;

  const appoinment = await appoinmentModel.create(req.body);
  if (!appoinment) {
    return next(new Error("Failed to create appoinment.", { cause: 500 }));
  }
 
  return res.status(201).json({
    status: "success",
    message: "Appoinment created successfully",
    result: appoinment,
  });
});
//====================================================================================================================//
//get appoitment

export const getAppoitment =asyncHandler(async(req,res,next)=>
{
  const {appoinmentId}=req.params
  const appoinment=await appoinmentModel.findById(appoinmentId)
  if (!appoinment) {
    return next(new Error("Invalid apponitment ID.", { cause: 400 }));
  }
  return res.status(200).json({
    status: "success",
    message: "Done!",
    result: appoinment,
  });
})
//====================================================================================================================//
//Employees Profiles

export const profile=asyncHandler(async(req,res,next)=>
{
  const employeesProfiles=await employeeModel.find()
  return res.status(200).json({
    status: "success",
    message: "Done!",
    result: employeesProfiles,
  });
})