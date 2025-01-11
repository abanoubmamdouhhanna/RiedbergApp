//admin registeration or create an admin

import adminModel from "../../../../DB/models/Admin.model.js";
import employeeModel from "../../../../DB/models/Employee.model.js";
import userModel from "../../../../DB/models/User.model.js";
import { asyncHandler } from "../../../utils/errorHandling.js";
import { generateToken } from "../../../utils/generateAndVerifyToken.js";
import { compare, Hash } from "../../../utils/Hash&Compare.js";

//admin registeration or create an admin

export const adminRegisteration = asyncHandler(async (req, res, next) => {
  const { userName, email, password, phone } = req.body;

  // Run the email and username existence checks in parallel
  const [existedUser, checkExistUserName] = await Promise.all([
    adminModel.findOne({ email }),
    adminModel.findOne({ userName }),
  ]);

  if (existedUser) {
    return next(new Error("Email already exists", { cause: 409 }));
  }

  if (checkExistUserName) {
    return next(new Error("Username already exists", { cause: 409 }));
  }

  // Hash password
  const hashPassword = Hash({ plainText: password });
  // Create the admin in the database
  const createAdmin = await adminModel.create({
    userName,
    email,
    password: hashPassword,
    phone,
  });
  return res.status(201).json({
    message: "Admin added successfully.",
    user: createAdmin._id,
  });
});
//====================================================================================================================//
// login

export const logIn = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Validate input data
  if (!email || !password) {
    return next(new Error("Email and password are required.", { cause: 400 }));
  }

  // Models to check based on roles
  const models = [
    { model: adminModel, role: "admin" },
    { model: employeeModel, role: "employee" },
    { model: userModel, role: "user" },
  ];

  let user = null;
  let role = null;

  // Check each model for the user
  for (const { model, role: currentRole } of models) {
    user = await model
      .findOne({ email })
      .select("password isDeleted isBlocked userName email role");
    if (user) {
      role = currentRole;
      break; // Stop searching once the user is found
    }
  }

  // Handle user not found
  if (!user) {
    return next(
      new Error("Invalid credentials, please try again.", { cause: 404 })
    );
  }

  // Check if the account is deleted or blocked
  if (user.isDeleted) {
    return next(new Error("This account has been deleted.", { cause: 403 }));
  }
  if (user.isBlocked) {
    return next(new Error("This account is blocked.", { cause: 403 }));
  }

  // Verify password
  const isPasswordValid = compare({
    plainText: password,
    hashValue: user.password,
  });
  if (!isPasswordValid) {
    return next(
      new Error("Incorrect password. Please try again.", { cause: 401 })
    );
  }

  // Generate JWT token
  const token = generateToken({
    payload: {
      id: user._id,
      userName: user.userName,
      email: user.email,
      role:user.role,
    },
  });

  // Respond to client
  return res.status(200).json({
    message: `Welcome ${user.role}! Logged in successfully.`,
    authorization: { token },
    result:user
  });
});

//====================================================================================================================//
