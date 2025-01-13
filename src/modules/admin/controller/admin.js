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
              throw new Error("Failed to upload image",{ cause: 500 }); // Error handling per image upload failure
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
  const { recipientType, recipientId } = req.params;

  let recipientModel;
  if (recipientType === "user") {
    recipientModel = userModel;
  } else if (recipientType === "employee") {
    recipientModel = employeeModel;
  } else {
    return next(new Error("Invalid recipient type", { cause: 400 }));
  }

  const recipient = await recipientModel.findById(recipientId);
  if (!recipient) {
    return next(new Error("Invalid recipient ID", { cause: 404 }));
  }

  const createNotification = await notificationModel.create({
    notifyTitle,
    notifyDescription,
    createdBy: req.user._id,
    [`${recipientType}Id`]: recipient._id,
    receieverType: recipient.role,
  });
    const io = req.app.get("io"); 
    if (io) {
      io.to(recipientId).emit("notification", {
        title: notifyTitle,
        description: notifyDescription,
        createdAt: new Date(),
      });
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
  if (req.files?.announcementAttach?.[0]?.path) {
    try {
      const customId = nanoid();
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
  req.body.createdBy = req.user._id;
  const announcement = await announcementModel.create(req.body);
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
    return next(new Error("Announcement not found or failed to update", { cause: 404 }));
  }
  return res.status(200).json({
    status: "success",
    message: "Announcement updated successfully",
    result: announcement,
  });
});
//====================================================================================================================//
//update user

export const updateFamily = asyncHandler(async (req, res, next) => {
  const { userName, email, phone, noOfAppartment, familyMembers } = req.body;
  if (!(userName || email || phone || noOfAppartment || familyMembers)) {
    return next(new Error("We need information to update", { cause: 400 }));
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
          `I'm sorry, but we cannot update your ${key} with your old one. Please make sure that ${key} you have entered correctly and try again.`,
          { cause: 400 }
        )
      );
    }
  }
  if (userName) {
    if (await userModel.findOne({ userName })) {
      return next(
        new Error(
          "I'm sorry, but the username you have chosen is already taken",
          { cause: 409 }
        )
      );
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
      { password: hashPassword,
        changeAccountInfo:Date.now()
       },
      { new: true }
    )
    .select("userName email updatedAt");
  return res.status(200).json({
    status: "success",
    message: "Password updated successfully",
    result: user,
  });
});

