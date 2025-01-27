import { Router } from "express";
import * as adminController from "./controller/admin.js";
import { auth } from "../../middlewares/auth.middleware.js";
import { allowedTypesMap, fileUpload } from "../../utils/multerCloudinary.js";
import { isValid } from "../../middlewares/validation.middleware.js";
import {
  addGallerySchema,
  aupdateGallerySchema,
  changeStatusSchema,
  creatAnnouncementSchema,
  createNotificationSchema,
  deleteAdminSchema,
  deleteGallerySchema,
  deleteSpAnnouncementSchema,
  headersSchema,
  updateAdminSchema,
  updateAnnouncementSchema,
  updateFamilySchema,
  updatePasswordSchema,
} from "./controller/admin.validation.js";
const router = Router();

//update admin
router.patch(
  "/updateAdmin/:adminId",
  isValid(headersSchema, true),
  auth("superAdmin"),
  isValid(updateAdminSchema),
  adminController.updateAdmin
);

//delete admin
router.delete(
  "/deleteAdmin/:adminId",
  isValid(headersSchema, true),
  auth("superAdmin"),
  isValid(deleteAdminSchema),
  adminController.deleteAdmin
);

//get admins
router.get(
  "/",
  isValid(headersSchema, true),
  auth(["admin", "superAdmin"]),
  adminController.getAdmins
);

//add gallery
router.post(
  "/addGallery",
  isValid(headersSchema, true),
  auth(["admin", "superAdmin"]),
  fileUpload(2, allowedTypesMap).fields([
    {
      name: "galleryImages",
      maxCount: 5,
    },
  ]),
  isValid(addGallerySchema),
  adminController.addGallery
);

//update gallery
router.patch(
  "/updateGallery/:galleryId",
  isValid(headersSchema, true),
  auth(["admin", "superAdmin"]),
  fileUpload(2, allowedTypesMap).fields([
    {
      name: "galleryImages",
      maxCount: 5,
    },
  ]),
  isValid(aupdateGallerySchema),
  adminController.updateGallery
);
//delete gallery
router.delete(
  "/deleteGallery/:galleryId",
  isValid(headersSchema, true),
  auth(["admin", "superAdmin"]),
  isValid(deleteGallerySchema),
  adminController.deleteGallery
);

//delete all gallaries
router.delete(
  "/deleteAllGalleries",
  isValid(headersSchema, true),
  auth(["admin", "superAdmin"]),
  adminController.deleteAllGalleries
);

// change maintenance status
router.patch(
  "/changeStatus/:maintenanceId",
  isValid(headersSchema, true),
  auth(["admin", "superAdmin", "employee"]),
  fileUpload(2, allowedTypesMap).fields([
    {
      name: "maintenanceStatusImage",
      maxCount: 1,
    },
  ]),
  isValid(changeStatusSchema),
  adminController.changeStatus
);

//get all maintenances
router.get(
  "/getAllMaintenances",
  isValid(headersSchema, true),
  auth(["admin", "superAdmin", "employee"]),
  adminController.getAllMaintenances
);

//send notification to user or employee
router.post(
  "/createNotification",
  isValid(headersSchema, true),
  auth(["admin", "superAdmin"]),
  isValid(createNotificationSchema),
  adminController.createNotification
);

//create announcement
router.post(
  "/creatAnnouncement",
  isValid(headersSchema, true),
  auth(["admin", "superAdmin"]),
  fileUpload(2, allowedTypesMap).fields([
    {
      name: "announcementAttach",
      maxCount: 1,
    },
  ]),
  isValid(creatAnnouncementSchema),
  adminController.creatAnnouncement
);

//update announcement
router.patch(
  "/updateAnnouncement/:announcementId",
  isValid(headersSchema, true),
  auth(["admin", "superAdmin"]),
  fileUpload(2, allowedTypesMap).fields([
    {
      name: "announcementAttach",
      maxCount: 1,
    },
  ]),
  isValid(updateAnnouncementSchema),
  adminController.updateAnnouncement
);
//delete all announcement
router.delete(
  "/deleteAllAnnouncements",
  isValid(headersSchema, true),
  auth(["admin", "superAdmin"]),
  adminController.deleteAllAnnouncements
);

//delete sp announcement
router.delete(
  "/deleteSpAnnouncement/:announcementId",
  isValid(headersSchema, true),
  auth(["admin", "superAdmin"]),
  isValid(deleteSpAnnouncementSchema),
  adminController.deleteSpAnnouncement
);

//update user
router.patch(
  "/updateFamily/:userId",
  isValid(headersSchema, true),
  auth(["admin", "superAdmin"]),
  isValid(updateFamilySchema),
  adminController.updateFamily
);

//update password
router.patch(
  "/updatePassword/:userId",
  isValid(headersSchema, true),
  auth(["admin", "superAdmin"]),
  isValid(updatePasswordSchema),
  adminController.updatePassword
);

//get all appointments
router.get(
  "/getAllAppoinments",
  isValid(headersSchema, true),
  auth(["admin", "superAdmin"]),
  adminController.getAllAppoinments
);

//get all responses
router.get(
  "/getAllResponses",
  isValid(headersSchema, true),
  auth(["admin", "superAdmin"]),
  adminController.getAllResponses
);

//Non-responders
router.get(
  "/getNonResponders",
  isValid(headersSchema, true),
  auth(["admin", "superAdmin"]),
  adminController.getNonResponders
);

export default router;
