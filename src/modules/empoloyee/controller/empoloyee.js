import { nanoid } from "nanoid";
import employeeModel from "../../../../DB/models/Employee.model.js";
import problemModel from "../../../../DB/models/Problem.model.js";
import userModel from "../../../../DB/models/User.model.js";
import { asyncHandler } from "../../../utils/errorHandling.js";
import cloudinary from "../../../utils/cloudinary.js";

import { compare, Hash } from "../../../utils/Hash&Compare.js";
import appoinmentModel from "../../../../DB/models/Appointment.model.js";

//create employee
export const createEmployee = asyncHandler(async (req, res, next) => {
  const { userName, email, password, phone, languages, days,workSpecialization } = req.body;

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

  const requiredFields = [
    { key: "userName", value: userName },
    { key: "email", value: email },
    { key: "phone", value: phone },
    { key: "password", value: password },
    { key: "languages", value: Array.isArray(languages) && languages.length > 0 },
    { key: "days", value: Array.isArray(days) && days.length > 0 },
    { key: "workSpecialization", value: Array.isArray(workSpecialization) && workSpecialization.length > 0 }
  ];
  
  // Find the first missing field
  const missingField = requiredFields.find(field => !field.value);
  
  if (missingField) {
    return next(new Error(`${missingField.key} is required`, { cause: 400 }));
  }
  
  // Hash password
  const hashPassword = Hash({ plainText: password });
  // Create the employee in the database
  const createEmployee = await employeeModel.create({
    userName,
    email,
    password: hashPassword,
    phone,
    languages,
    days,
    workSpecialization
  });
  return res.status(201).json({
    message: "employee added successfully.",
    user: createEmployee._id,
  });
});
//====================================================================================================================//
//update employee

export const updateEmployee = asyncHandler(async (req, res, next) => {
  const { employeeId } = req.params;
  const { userName, email, phone, languages, days, oldPassword, newPassword,workSpecialization } =
    req.body;
  const empoloyee = await employeeModel.findById(employeeId);
  if (!empoloyee) {
    return next(new Error("Employee not found", { cause: 404 }));
  }
  if (
    !(
      userName ||
      email ||
      phone ||
      (oldPassword && newPassword) ||
      (Array.isArray(languages) && languages.length > 0) ||
      (Array.isArray(days) && days.length > 0)||
      (Array.isArray(workSpecialization) && workSpecialization.length > 0)
    )
  ) {
    return next(new Error("We need information to update", { cause: 400 }));
  }
  if (userName || email || phone) {
    const object = { ...req.body };
    for (let key in object) {
      if (empoloyee[key] == object[key]) {
        return next(
          new Error(
            `Cannot update ${key} with the same value. Please provide a different value.`,
            { cause: 400 }
          )
        );
      }
    }
  }
  if (userName || email) {
    const existingUser = await employeeModel.findOne({
      $or: [{ userName }, { email }],
    });

    if (existingUser) {
      if (existingUser.userName === userName) {
        return next(
          new Error("The username you have chosen is already taken.", {
            cause: 409,
          })
        );
      }
      if (existingUser.email === email) {
        return next(
          new Error("The email you have entered is already in use.", {
            cause: 409,
          })
        );
      }
    }
  }

  if (empoloyee.isDeleted) {
    return next(
      new Error(
        "Cannot update user information because the account is suspended or deleted.",
        { cause: 403 }
      )
    );
  }
  if (oldPassword && newPassword) {
    const matchOld = compare({
      plainText: oldPassword,
      hashValue: empoloyee.password,
    });
    if (!matchOld) {
      return next(new Error("In-valid password", { cause: 400 }));
    }
    const checkMatchNew = compare({
      plainText: newPassword,
      hashValue: empoloyee.password,
    });
    if (checkMatchNew) {
      return next(
        new Error("New password can't be old password", { cause: 400 })
      );
    }
    const hashPassword = Hash({ plainText: newPassword });
    req.body.password = hashPassword;
    req.body.changeAccountInfo = Date.now();
  }

  // Update the Employee in the database
  const updateEmployee = await employeeModel.findByIdAndUpdate(
    { _id: employeeId },
    req.body,
    { new: true }
  );

  return res.status(200).json({
    status: "success",
    message: "Employee updated successfully.",
    result: updateEmployee,
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
  const customId = nanoid();
  if (req.files?.problemImage?.[0]?.path) {
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
  req.body.customId=customId
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
//get appoitment

export const getAppoitment = asyncHandler(async (req, res, next) => {
  const { appoinmentId } = req.params;
  const appoinment = await appoinmentModel.findById(appoinmentId);
  if (!appoinment) {
    return next(new Error("Invalid apponitment ID.", { cause: 400 }));
  }
  return res.status(200).json({
    status: "success",
    message: "Done!",
    result: appoinment,
  });
});
//====================================================================================================================//
//Employees Profiles

export const profile = asyncHandler(async (req, res, next) => {
  const employeesProfiles = await employeeModel.find();
  return res.status(200).json({
    status: "success",
    message: "Done!",
    result: employeesProfiles,
  });
});
//====================================================================================================================//
// all employee Ids

export const employeeIds = asyncHandler(async (req, res, next) => {
  const employeesIds = await employeeModel.find().select("_id");
  return res.status(200).json({
    status: "success",
    message: "Done!",
    result: employeesIds,
  });
});
//====================================================================================================================//
//Fetch Available Times

export const getAvailableTimes = asyncHandler(async (req, res, next) => {
  const { employeeId, date } = req.params;

  const employee = await employeeModel.findById(employeeId);
  if (!employee) {
    return next(new Error("Employee not found.", { cause: 404 }));
  }

  const workingHours = [
    "08:00",
    "08:30",
    "09:00",
    "09:30",
    "10:00",
    "10:30",
    "11:00",
    "11:30",
    "12:00",
    "12:30",
    "13:00",
    "13:30",
    "14:00",
    "14:30",
    "15:00",
    "15:30",
    "16:00",
    "16:30",
    "17:00",
    "17:30",
    "18:00",
    "18:30",
    "19:00",
    "19:30",
    "20:00",
  ];
  const schedule = employee.schedule.find((s) => s.date === date);
  const bookedTimes = schedule ? schedule.times : [];

  const availableTimes = workingHours.filter(
    (time) => !bookedTimes.includes(time)
  );

  res.status(200).json({ status: "success", availableTimes });
});

