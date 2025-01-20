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
  headersSchema,
  updateAdminSchema,
  updateAnnouncementSchema,
  updateFamilySchema,
  updatePasswordSchema,
} from "./controller/admin.validation.js";
const router = Router();

//update admin
router.patch("/updateAdmin/:adminId",
  isValid(headersSchema, true),
  auth("superAdmin"),
  isValid(updateAdminSchema),
  adminController.updateAdmin)


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
  fileUpload(2,allowedTypesMap).fields([
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
  fileUpload(2,allowedTypesMap).fields([
    {
      name: "galleryImages",
      maxCount: 5,
    },
  ]),
  isValid(aupdateGallerySchema),
  adminController.updateGallery
);

// change maintenance status
router.patch(
  "/changeStatus/:maintenanceId",
  isValid(headersSchema, true),
  auth(["admin", "superAdmin", "employee"]),
  fileUpload(2,allowedTypesMap).fields([
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
  "/createNotification/:recipientType/:recipientId",
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
  fileUpload(2,allowedTypesMap).fields([
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
  fileUpload(2,allowedTypesMap).fields([
    {
      name: "announcementAttach",
      maxCount: 1,
    },
  ]),
  isValid(updateAnnouncementSchema),
  adminController.updateAnnouncement
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



export default router;
