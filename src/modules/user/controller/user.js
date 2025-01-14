//create user or family

import appoinmentModel from "../../../../DB/models/Appointment.model.js";
import employeeModel from "../../../../DB/models/Employee.model.js";
import userModel from "../../../../DB/models/User.model.js";
import { asyncHandler } from "../../../utils/errorHandling.js";
import { Hash } from "../../../utils/Hash&Compare.js";

export const createUser = asyncHandler(async (req, res, next) => {
  const { userName, email, password, phone, noOfAppartment, familyMembers } =
    req.body;

  // Run the email and username existence checks in parallel
  const [existedUser, checkExistUserName] = await Promise.all([
    userModel.findOne({ email }),
    userModel.findOne({ userName }),
  ]);

  if (existedUser) {
    return next(new Error("Email already exists", { cause: 409 }));
  }

  if (checkExistUserName) {
    return next(new Error("Username already exists", { cause: 409 }));
  }

  // Hash password
  const hashPassword = Hash({ plainText: password });

  const finalFamilyMembers = familyMembers || undefined;

  // Create the user in the database
  const createUser = await userModel.create({
    userName,
    email,
    password: hashPassword,
    phone,
    noOfAppartment,
    familyMembers: finalFamilyMembers,
  });
  return res.status(201).json({
    message: "user added successfully.",
    user: createUser._id,
  });
});

//====================================================================================================================//
//update user
export const updateUser = asyncHandler(async (req, res, next) => {
  const { maintenanceDay } = req.body;
  if (maintenanceDay) {
    const date = new Date(maintenanceDay);
    if (isNaN(date.getTime())) {
      return next(
        new Error(
          "Invalid Maintenance Day format. Please provide a valid date in 'YYYY-MM-DD' format.",
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
  }

  const user = await userModel.findByIdAndUpdate(
    req.user._id,
    { maintenanceDay },
    { new: true }
  );
  // Handle non-existent user
  if (!user) {
    return next(new Error("User not found.", { cause: 404 }));
  }
  return res.status(200).json({ message: "User maintenance day updated successfully" });
});
//====================================================================================================================//
//delete user

export const deleteUser = asyncHandler(async (req, res, next) => {
  const user = await userModel.findByIdAndDelete(req.params.userId);
  // Handle non-existent user
  if (!user) {
    return next(new Error("User not found.", { cause: 404 }));
  }
  return res.status(200).json({ message: "User deleted successfully" });
});

//====================================================================================================================//
//create appointment
export const createAppoinment = asyncHandler(async (req, res, next) => {
  const { appoinmentAttachment } = req.files || {};
  const { appoinmentTitle, appoinmentDate, appoinmentTime, reason } =
    req.body;
    const {employeeId}=req.params

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




  const employee = await employeeModel.findById(employeeId);
  if (!employee) {
    return next(new Error("Employee not found.", { cause: 404 }));
  }

  const existingSchedule = employee.schedule.find((s) => s.date === appoinmentDate);
  if (existingSchedule && existingSchedule.times.includes(appoinmentTime)) {
    return next(
      new Error("The selected time is already booked for this employee.", { cause: 400 })
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

    // Reserve the time slot for the employee
    if (existingSchedule) {
      existingSchedule.times.push(appoinmentTime);
    } else {
      employee.schedule.push({ date: appoinmentDate, times: [appoinmentTime] });
    }
    await employee.save();

  req.body.employeeId =employeeId;

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