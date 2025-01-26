import adminModel from "../../../../DB/models/Admin.model.js";
import employeeModel from "../../../../DB/models/Employee.model.js";
import userModel from "../../../../DB/models/User.model.js";
import { asyncHandler } from "../../../utils/errorHandling.js";
import cloudinary from "../../../utils/cloudinary.js";
import { nanoid } from "nanoid";
import maintenanceModel from "../../../../DB/models/Maintenance.model.js";
import notificationModel from "../../../../DB/models/Notification.model.js";
import galleryModel from "../../../../DB/models/Gallery.model.js";
import announcementModel from "../../../../DB/models/Announcements.model.js";
import { compare, Hash } from "../../../utils/Hash&Compare.js";
import { Server } from "socket.io";
import appoinmentModel from "../../../../DB/models/Appointment.model.js";
import responseModel from "../../../../DB/models/Response.model.js";

//update admin
export const updateAdmin = asyncHandler(async (req, res, next) => {
  const { userName, email, oldPassword, newPassword, phone } = req.body;
  const { adminId } = req.params;
  const admin = await adminModel.findById(adminId);
  if (!admin) {
    return next(new Error("Admin not found", { cause: 404 }));
  }
  if (!(userName || email || phone || (oldPassword && newPassword))) {
    return next(new Error("We need information to update", { cause: 400 }));
  }
  if (userName || email || phone) {
    const object = { ...req.body };
    for (let key in object) {
      if (admin[key] == object[key]) {
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

  if (admin.isDeleted) {
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
      hashValue: admin.password,
    });
    if (!matchOld) {
      return next(new Error("In-valid password", { cause: 400 }));
    }
    const checkMatchNew = compare({
      plainText: newPassword,
      hashValue: admin.password,
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

  // Update the Admin in the database
  const updateAdmin = await adminModel.findByIdAndUpdate(
    { _id: adminId },
    req.body,
    { new: true }
  );

  return res.status(200).json({
    status: "success",
    message: "Admin updated successfully.",
    result: updateAdmin,
  });
});
//====================================================================================================================//
//delete admin

export const deleteAdmin = asyncHandler(async (req, res, next) => {
  const admin = await adminModel.findByIdAndDelete(req.params.adminId);
  return res
    .status(200)
    .json({ message: "Admin deleted successfully", result: admin });
});
//====================================================================================================================//
//admin profile

export const getAdmins = asyncHandler(async (req, res, next) => {
  const allAdmins = await adminModel.find().select("userName email phone");
  return res.status(200).json({ message: "All admins", allAdmins });
});

//====================================================================================================================//
//add gallery
export const addGallery = asyncHandler(async (req, res, next) => {
  const customId = nanoid();
  const { galleryTitle, galleryDescription } = req.body;
  if (!galleryTitle || !galleryDescription) {
    return next(
      new Error("Gallery title and Gallery description are required.", {
        cause: 400,
      })
    );
  }
  let uploadedImages = [];
  if (req.files?.galleryImages?.length) {
    req.body.customId = customId;
    try {
      uploadedImages = await Promise.all(
        req.files.galleryImages.map((image, index) =>
          cloudinary.uploader
            .upload(image.path, {
              folder: `${process.env.APP_NAME}/Gallery/${customId}/galleryImages`,
              public_id: `${customId}galleryImages___${index + 1}`,
            })
            .then((uploadResult) => ({
              imageUrl: uploadResult.secure_url,
              public_id: uploadResult.public_id,
              imageDate: new Date().toISOString().split("T")[0],
            }))
            .catch(() => {
              throw new Error("Failed to upload image", { cause: 500 }); // Error handling per image upload failure
            })
        )
      );
    } catch (error) {
      return next(new Error("Failed to upload image", { cause: 500 }));
    }
    req.body.galleryImages = uploadedImages;
  }
  req.body.customId=customId
  req.body.createdBy = req.user._id;
  req.body.gallaryAuthorType = req.user.role;
  const gallery = await galleryModel.create(req.body);
  return res.status(201).json({
    status: "success",
    message: "Gallery Created successfully",
    result: gallery,
  });
});

//====================================================================================================================//
//update gallery

export const updateGallery = asyncHandler(async (req, res, next) => {
  const { galleryId } = req.params;
  const gallery = await galleryModel.findById(galleryId);
  if (!gallery) {
    return next(
      new Error("In-Valid gallery ID", {
        cause: 400,
      })
    );
  }
  let uploadedImages = [];
  if (req.files?.galleryImages?.length) {
    try {
      uploadedImages = await Promise.all(
        req.files.galleryImages.map((image, index) =>
          cloudinary.uploader
            .upload(image.path, {
              folder: `${process.env.APP_NAME}/Gallery/${gallery.customId}/galleryImages`,
              public_id: `${gallery.customId}galleryImages___${index + 1}`,
            })
            .then((uploadResult) => ({
              imageUrl: uploadResult.secure_url,
              public_id: uploadResult.public_id,
              imageDate: new Date().toISOString().split("T")[0],
            }))
            .catch(() => {
              throw new Error("Failed to upload image", { cause: 500 }); // Error handling per image upload failure
            })
        )
      );
    } catch (error) {
      return next(new Error("Failed to upload image", { cause: 500 }));
    }
    req.body.galleryImages = uploadedImages;
  }
  req.body.updatedBy = req.user._id;
  const updatedGallery = await galleryModel.findByIdAndUpdate(
    galleryId,
    req.body,
    { new: true }
  );
  return res.status(200).json({
    status: "success",
    message: "Gallery updated successfully",
    result: updatedGallery,
  });
});
//====================================================================================================================//
//delete sp gallery

export const deleteGallery = asyncHandler(async (req, res, next) => {
  const { galleryId } = req.params;
  const gallery = await galleryModel.findById(galleryId);
  if (!gallery) {
    return next(new Error("Gallery not found.", { cause: 404 }));
  }
  if (
    gallery.createdBy.toString() !== req.user._id.toString() &&
    req.user.role !== "superAdmin"
  ) {
    return next(
      new Error("You are not authorized to delete this gallery.", {
        cause: 401,
      })
    );
  }

  const deletedGallery = await galleryModel.findByIdAndDelete(galleryId);
  if (!deletedGallery) {
    return next(new Error("Delete failed. Please try again.", { cause: 500 }));
  }

  return res.status(200).json({
    status: "success",
    message: "Gallery deleted successfully.",
    result: deletedGallery,
  });
});
//====================================================================================================================//
//delete all galleries

export const deleteAllGalleries = asyncHandler(async (req, res, next) => {
  const deletedGallaries = await galleryModel.deleteMany();
  return res.status(200).json({
    status: "success",
    message: "All gllaries deleted successfully.",
    result: deletedGallaries,
  });
});

//====================================================================================================================//
// change maintenance status

export const changeStatus = asyncHandler(async (req, res, next) => {
  const maintenance = await maintenanceModel.findById(req.params.maintenanceId);
  if (!maintenance) {
    return next(new Error("in-valid maintenance id", { cause: 400 }));
  }

  if (req.files?.maintenanceStatusImage?.[0]?.path) {
    try {
      const customId = nanoid();
      const maintenanceStatusImage = await cloudinary.uploader.upload(
        req.files.maintenanceStatusImage[0].path,
        {
          folder: `${process.env.APP_NAME}/MaintenanceStatus/${customId}/maintenanceStatusImage`,
          public_id: `${customId}maintenanceStatusImage`,
        }
      );
      req.body.maintenanceStatusImage = maintenanceStatusImage.secure_url;
    } catch (error) {
      return next(new Error("Failed to upload image", { cause: 500 }));
    }
  }
  // Update maintenance fields
  maintenance.maintenanceOrderStatuses = req.body.maintenanceOrderStatuses;

  if (req.body.maintenanceStatusImage) {
    maintenance.maintenanceStatusImage = req.body.maintenanceStatusImage;
  }

  if (req.body.feedbackComment) {
    maintenance.feedbackComment = req.body.feedbackComment;
  }
  await maintenance.save();
  return res.status(200).json({
    status: "success",
    message: "Maintenance status updated successfully",
    result: maintenance,
  });
});

//====================================================================================================================//
//get all maintenances

export const getAllMaintenances = asyncHandler(async (req, res, next) => {
  const maintenance = await maintenanceModel.find();
  return res.status(200).json({
    status: "success",
    message: "Done",
    result: maintenance,
  });
});

//====================================================================================================================//
//send notification to user or employee

export const createNotification = asyncHandler(async (req, res, next) => {
  const { notifyTitle, notifyDescription } = req.body;
  const createNotification = await notificationModel.create({
    notifyTitle,
    notifyDescription,
    createdBy: req.user._id,
  });
 try {
    const io = req.app.get("io");
    if (!io) throw new Error("Socket.IO instance not found");

    const users = await userModel.find({}, "_id");
    const employees = await employeeModel.find({}, "_id");

    const recipientIds = [
      ...users.map((user) => user._id.toString()),
      ...employees.map((emp) => emp._id.toString()),
    ];

    if (io) {
      recipientIds.forEach((recipientId) => {
        io.to(recipientId).emit("emergencyNotification", {
          notificationId:createNotification._id,
          title: createNotification.notifyTitle,
          description:createNotification.notifyDescription,
          createdAt: new Date(),
        });
      });
    }
  } catch (error) {
    return next(new Error("Failed to send notifications", { cause: 500 }));
  }


  return res.status(200).json({
    status: "success",
    message: "Notification created",
    result: createNotification,
  });
});
//====================================================================================================================//
//create announcement

export const creatAnnouncement = asyncHandler(async (req, res, next) => {
  const customId = nanoid();
  if (req.files?.announcementAttach?.[0]?.path) {
    try {
      req.body.customId = customId;
      const announcementAttach = await cloudinary.uploader.upload(
        req.files.announcementAttach[0].path,
        {
          folder: `${process.env.APP_NAME}/AnnouncementAttachs/${customId}/announcementAttach`,
          public_id: `${customId}announcementAttach`,
        }
      );
      req.body.announcementAttach = announcementAttach.secure_url;
    } catch (error) {
      return next(new Error("Failed to upload image", { cause: 500 }));
    }
  }
  req.body.author = req.user.userName;
  req.body.customId=customId
  req.body.createdBy = req.user._id;
  const announcement = await announcementModel.create(req.body);

  // Notify all users and employees
  try {
    const io = req.app.get("io");
    if (!io) throw new Error("Socket.IO instance not found");

    const users = await userModel.find({}, "_id");
    const employees = await employeeModel.find({}, "_id");

    const recipientIds = [
      ...users.map((user) => user._id.toString()),
      ...employees.map((emp) => emp._id.toString()),
    ];

    if (io) {
      recipientIds.forEach((recipientId) => {
        io.to(recipientId).emit("notification", {
          announcementId: announcement._id,
          title: announcement.announcementTitle,
          description: announcement.announcementDesc,
          createdAt: new Date(),
        });
      });
    }
  } catch (error) {
    return next(new Error("Failed to send notifications", { cause: 500 }));
  }

  return res.status(201).json({
    status: "success",
    message: "Announcement created successfully",
    result: announcement,
  });
});
//====================================================================================================================//
//update announcement
export const updateAnnouncement = asyncHandler(async (req, res, next) => {
  const { announcementId } = req.params;
  const checkAnnouncement = await announcementModel.findById(announcementId);
  if (!checkAnnouncement) {
    return next(new Error("Announcement not found", { cause: 404 }));
  }

  if (req.files?.announcementAttach?.[0]?.path) {
    try {
      // const customId = nanoid();
      const announcementAttach = await cloudinary.uploader.upload(
        req.files.announcementAttach[0].path,
        {
          folder: `${process.env.APP_NAME}/AnnouncementAttachs/${checkAnnouncement.customId}/announcementAttach`,
          public_id: `${checkAnnouncement.customId}announcementAttach`,
        }
      );
      req.body.announcementAttach = announcementAttach.secure_url;
    } catch (error) {
      return next(new Error("Failed to update image", { cause: 500 }));
    }
  }
  const announcement = await announcementModel.findByIdAndUpdate(
    announcementId,
    req.body,
    { new: true }
  );
  if (!announcement) {
    return next(
      new Error("Announcement not found or failed to update", { cause: 404 })
    );
  }
  return res.status(200).json({
    status: "success",
    message: "Announcement updated successfully",
    result: announcement,
  });
});
//====================================================================================================================//
//delete all Announcements

export const deleteAllAnnouncements = asyncHandler(async (req, res, next) => {
  // Delete all announcements
  const deletedAnnouncements = await announcementModel.deleteMany();

  return res.status(200).json({
    status: "success",
    message: "All announcements deleted successfully.",
    result: deletedAnnouncements,
  });
});
//====================================================================================================================//
//delete sp Announcements

export const deleteSpAnnouncement = asyncHandler(async (req, res, next) => {
  const announcement = await announcementModel.findById(
    req.params.announcementId
  );
  if (!announcement) {
    return next(new Error("Announcement not found", { cause: 404 }));
  }
  // Delete all announcements
  const deletedAnnouncements = await announcementModel.deleteOne({
    _id: req.params.announcementId,
  });

  return res.status(200).json({
    status: "success",
    message: "Announcement deleted successfully.",
    result: deletedAnnouncements,
  });
});
//====================================================================================================================//
//update user

export const updateFamily = asyncHandler(async (req, res, next) => {
  const { userName, email, phone, noOfAppartment, memberType } = req.body;
  if (!(userName || email || phone || noOfAppartment || memberType)) {
    return next(new Error("We need information to update", { cause: 400 }));
  }
  // Validate memberType
  if (memberType) {
    const allowedMemberTypes = ["father", "mother", "son", "daughter"];
    if (!allowedMemberTypes.includes(memberType)) {
      return next(
        new Error(
          "Invalid member type. Must be one of 'father', 'mother', 'son', 'daughter'.",
          { cause: 400 }
        )
      );
    }
  }

  const checkUser = await userModel.findById(req.params.userId);

  if (!checkUser) {
    return next(new Error("user not found", { cause: 404 }));
  }
  const object = { ...req.body };
  for (let key in object) {
    if (checkUser[key] == object[key]) {
      return next(
        new Error(
          `Cannot update ${key} with the same value. Please provide a different value.`,
          { cause: 400 }
        )
      );
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

  if (checkUser.isDeleted == true) {
    return next(
      new Error(
        "Can't update your information because your account may be suspended or deleted",
        { cause: 403 }
      )
    );
  }
  // Validate rules for memberType changes
  const currentApartment = checkUser.noOfAppartment;
  const newApartment = noOfAppartment || currentApartment;

  const family = await userModel.find({ noOfAppartment: newApartment }); // Find all users in the same family (apartment)
  const familyCounts = family.reduce(
    (counts, member) => {
      counts[member.memberType] = (counts[member.memberType] || 0) + 1;
      return counts;
    },
    { father: 0, mother: 0, son: 0, daughter: 0 }
  );

  if (memberType) {
    if (memberType === "father" && familyCounts.father >= 1) {
      return next(
        new Error("A family can have only one father.", { cause: 400 })
      );
    }

    if (memberType === "mother" && familyCounts.mother >= 1) {
      return next(
        new Error("A family can have only one mother.", { cause: 400 })
      );
    }

    if (memberType === "son" && familyCounts.son >= 3) {
      return next(
        new Error("A family can have a maximum of 3 sons.", { cause: 400 })
      );
    }

    if (memberType === "daughter" && familyCounts.daughter >= 3) {
      return next(
        new Error("A family can have a maximum of 3 daughters.", { cause: 400 })
      );
    }
  }

  // Validate if moving to a new apartment violates rules
  if (noOfAppartment && noOfAppartment !== currentApartment) {
    if (checkUser.memberType === "father" && familyCounts.father >= 1) {
      return next(
        new Error(
          "Cannot move to the new apartment because it already has a father.",
          { cause: 400 }
        )
      );
    }
    if (checkUser.memberType === "mother" && familyCounts.mother >= 1) {
      return next(
        new Error(
          "Cannot move to the new apartment because it already has a mother.",
          { cause: 400 }
        )
      );
    }
    if (checkUser.memberType === "son" && familyCounts.son >= 3) {
      return next(
        new Error(
          "Cannot move to the new apartment because it already has 3 sons.",
          { cause: 400 }
        )
      );
    }
    if (checkUser.memberType === "daughter" && familyCounts.daughter >= 3) {
      return next(
        new Error(
          "Cannot move to the new apartment because it already has 3 daughters.",
          { cause: 400 }
        )
      );
    }
  }
  const user = await userModel.findByIdAndUpdate(
    { _id: req.params.userId },
    req.body,
    { new: true }
  );
  return res
    .status(200)
    .json({ status: "success", message: "User updated", result: user });
});

//====================================================================================================================//
//update password
export const updatePassword = asyncHandler(async (req, res, next) => {
  const { userId } = req.params;
  const { oldPassword, newPassword } = req.body;
  const checkUser = await userModel.findById(userId);
  if (!checkUser) {
    return next(new Error("In-valid user ID", { cause: 400 }));
  }

  const matchOld = compare({
    plainText: oldPassword,
    hashValue: checkUser.password,
  });
  if (!matchOld) {
    return next(new Error("In-valid password", { cause: 400 }));
  }
  const checkMatchNew = compare({
    plainText: newPassword,
    hashValue: checkUser.password,
  });
  if (checkMatchNew) {
    return next(
      new Error("New password can't be old password", { cause: 400 })
    );
  }
  const hashPassword = Hash({ plainText: newPassword });
  const user = await userModel
    .findByIdAndUpdate(
      { _id: userId },
      { password: hashPassword, changeAccountInfo: Date.now() },
      { new: true }
    )
    .select("userName email updatedAt");
  return res.status(200).json({
    status: "success",
    message: "Password updated successfully",
    result: user,
  });
});
//====================================================================================================================//
//get all appoinments

export const getAllAppoinments =asyncHandler(async(req,res,next)=>
{
  const appoinments=await appoinmentModel.find()
  if (!appoinments) {
    return next(new Error("No appoinments found!", { cause: 404 }));
  }
  return res.status(200).json({
    status: "success",
    message: "Done!",
    count:appoinments.length,
    result: appoinments,
  });
})

//====================================================================================================================//
//get all Responses

export const getAllResponses =asyncHandler(async(req,res,next)=>
  {
    const responses=await responseModel.find()
    if (!responses) {
      return next(new Error("No responses found!", { cause: 404 }));
    }
    return res.status(200).json({
      status: "success",
      message: "Done!",
      count:responses.length,
      result: responses,
    });
  })