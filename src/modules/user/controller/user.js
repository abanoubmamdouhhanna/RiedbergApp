//create user or family

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
          { cause: 400 }
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