import appoinmentModel from "../../../../DB/models/Appointment.model.js";
import employeeModel from "../../../../DB/models/Employee.model.js";
import userModel from "../../../../DB/models/User.model.js";
import { asyncHandler } from "../../../utils/errorHandling.js";
import { Hash } from "../../../utils/Hash&Compare.js";
import cloudinary from '../../../utils/cloudinary.js'
import { nanoid } from "nanoid";


//create user or family

export const createUser = asyncHandler(async (req, res, next) => {
  const { userName, email, password, phone, noOfAppartment ,memberType} =
    req.body;

    
  // Validate memberType
  const allowedMemberTypes = ["father", "mother", "son", "daughter"];
  if (!allowedMemberTypes.includes(memberType)) {
    return next(new Error("Invalid member type. Must be one of 'father', 'mother', 'son', 'daughter'.", { cause: 400 }));
  }

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
  const family = await userModel.find({ noOfAppartment }); // Find all users in the same family (apartment)
  const familyCounts = family.reduce(
    (counts, member) => {
      counts[member.memberType] = (counts[member.memberType] || 0) + 1;
      return counts;
    },
    { father: 0, mother: 0, son: 0, daughter: 0 }
  );

  if (memberType === "father" && familyCounts.father >= 1) {
    return next(new Error("A family can have only one father.", { cause: 400 }));
  }

  if (memberType === "mother" && familyCounts.mother >= 1) {
    return next(new Error("A family can have only one mother.", { cause: 400 }));
  }

  if (memberType === "son" && familyCounts.son >= 3) {
    return next(new Error("A family can have a maximum of 3 sons.", { cause: 400 }));
  }

  if (memberType === "daughter" && familyCounts.daughter >= 3) {
    return next(new Error("A family can have a maximum of 3 daughters.", { cause: 400 }));
  }

  // Hash password
  const hashPassword = Hash({ plainText: password });


  // Create the user in the database
  const createUser = await userModel.create({
    userName,
    email,
    password: hashPassword,
    phone,
    noOfAppartment,
    memberType
  });
  return res.status(201).json({
    message: "user added successfully.",
    user: createUser._id,
  });
});

//====================================================================================================================//
//update user maintenanceDay
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
  return res
    .status(200)
    .json({ message: "User maintenance day updated successfully" });
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
  const { appoinmentTitle, appoinmentDate, appoinmentTime, reason } = req.body;
  const { employeeId } = req.params;
  const customId = nanoid();

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

  const [employee, existingSchedule] = await Promise.all([
    employeeModel.findById(employeeId),
    employeeModel.findOne({ _id: employeeId, "schedule.date": appoinmentDate },  { "schedule.$": 1 }),
  ]);
  if (!employee) {
    return next(new Error("Employee not found.", { cause: 404 }));
  }

  if ( existingSchedule &&
    existingSchedule.schedule.some((s) => Array.isArray(s.times) && s.times.includes(appoinmentTime))) {
    return next(
      new Error("The selected time is already booked for this employee.", {
        cause: 400,
      })
    );
  }

  if (appoinmentAttachment?.[0]?.path) {
   try {
      const uploadedAttachment = await cloudinary.uploader.upload(
        appoinmentAttachment[0].path,
        {
          folder: `${process.env.APP_NAME}/Appointment/${customId}/appoinmentAttachment`,
          public_id: `${customId}appoinmentAttachment`,
        }
      );
      req.body.appoinmentAttachment = uploadedAttachment.secure_url;
    } catch (error) {
      console.error('Cloudinary Upload Error:', error);
      return next(
        new Error("Failed to upload appoinment attachment.", { cause: 500 })
      );
    }
  }
  const newSchedule = existingSchedule?.schedule?.[0] || { date: appoinmentDate, times: [] };
  newSchedule.times.push(appoinmentTime);

  await employeeModel.updateOne(
    { _id: employeeId, "schedule.date": appoinmentDate },
    { $set: { "schedule.$": newSchedule } },
    { upsert: true }
  );

  req.body.employeeId = employeeId;
  req.body.createdBy=req.user._id;
  req.body.customId=customId

  const appoinment = await appoinmentModel.create(req.body);
  if (!appoinment) {
    return next(new Error("Failed to create appoinment.", { cause: 500 }));
  }

    // Populate employee details in the response
    const populatedAppoinment = await appoinmentModel
    .findById(appoinment._id)
    .populate("empDetails", "userName email phone");

  return res.status(201).json({
    status: "success",
    message: "Appoinment created successfully",
    result: populatedAppoinment,
     });
});


//====================================================================================================================//
//get all users profiles

export const usersProfiles=asyncHandler(async(req,res,next)=>
  {
    const usersProfiles=await userModel.find().populate("problemDetails")
    return res.status(200).json({
      status: "success",
      message: "Done!",
      result: usersProfiles
    });
  })

  //====================================================================================================================//
// all employee Ids

export const usersIds=asyncHandler(async(req,res,next)=>
  {
    const usersIds=await userModel.find().select("_id")
    return res.status(200).json({
      status: "success",
      message: "Done!",
      result: usersIds,
    });
  })
//====================================================================================================================//
//get user appoinments

export const userAppoinments=asyncHandler(async(req,res,next)=>
{
  const userAppoinments =await appoinmentModel.find({createdBy:req.user._id}).populate("empDetails", "userName email phone");
  if (!userAppoinments) {
    return next(new Error("You havn't any appoinments", { cause: 404 }));
  }
  return res.status(200).json({
    status: "success",
    message: "Done!",
    count:userAppoinments.length,
    result: userAppoinments,
  });
})