import { Router } from "express";
import { auth } from "../../middlewares/auth.middleware.js";
import * as userController from "./controller/user.js";
import { isValid } from "../../middlewares/validation.middleware.js";
import {
  createAppoinmentSchema,
  createUserSchema,
  deleteUserSchema,
  headersSchema,
  updateUserSchema,
} from "./controller/user.validation.js";
import { allowedTypesMap, fileUpload } from "../../utils/multerCloudinary.js";

const router = Router();

//create user
router.post(
  "/createUser",
  isValid(headersSchema, true),
  auth(["admin", "superAdmin"]),
  isValid(createUserSchema),
  userController.createUser
);

//update user
router.patch(
  "/updateUser",
  isValid(headersSchema, true),
  auth("user"),
  isValid(updateUserSchema),
  userController.updateUser
);

//delete user
router.delete(
  "/deleteUser/:userId",
  isValid(headersSchema, true),
  auth(["admin", "superAdmin"]),
  isValid(deleteUserSchema),
  userController.deleteUser
);

//create appoinment
router.post(
  "/createAppoinment/:employeeId",
  isValid(headersSchema, true),
  auth("user"),
  fileUpload(2,allowedTypesMap).fields([
    {
      name: "appoinmentAttachment",
      maxCount: 1,
    },
  ]),
  isValid(createAppoinmentSchema),
  userController.createAppoinment
);


export default router;
