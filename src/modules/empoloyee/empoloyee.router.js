import { Router } from "express";
import * as employeeController from "./controller/empoloyee.js";
import { auth } from "../../middlewares/auth.middleware.js";
import { allowedTypesMap, fileUpload } from "../../utils/multerCloudinary.js";
import { isValid } from "../../middlewares/validation.middleware.js";
import {
  createAppoinmentSchema,
  createEmployeeSchema,
  createProblemSchema,
  deleteEmployeeSchema,
  getAppoitmentSchema,
  headersSchema,
} from "./controller/empolyee.validation.js";

const router = Router();

//create employee
router.post(
  "/createEmployee",
  isValid(headersSchema, true),
  auth(["admin", "superAdmin"]),
  isValid(createEmployeeSchema),
  employeeController.createEmployee
);

//delete employee
router.delete(
  "/deleteEmployee/:employeeId",
  isValid(headersSchema, true),
  auth(["admin", "superAdmin"]),
  isValid(deleteEmployeeSchema),
  employeeController.deleteEmployee
);

//create a problem
router.post(
  "/createProblem/:userId",
  isValid(headersSchema, true),
  auth("employee"),
  fileUpload(2,allowedTypesMap).fields([
    {
      name: "problemImage",
      maxCount: 1,
    },
  ]),
  isValid(createProblemSchema),
  employeeController.createProblem
);

//create appoinment
router.post(
  "/createAppoinment",
  isValid(headersSchema, true),
  auth("employee"),
  fileUpload(2,allowedTypesMap).fields([
    {
      name: "appoinmentAttachment",
      maxCount: 1,
    },
  ]),
  isValid(createAppoinmentSchema),
  employeeController.createAppoinment
);

//get appoitment
router.get(
  "/getAppoitment/:appoinmentId",
  isValid(headersSchema, true),
  auth("employee"),
  isValid(getAppoitmentSchema),
  employeeController.getAppoitment
);

// all employees profiles
router.get(
  "/employeesProfiles",
  isValid(headersSchema, true),
  auth(["admin", "superAdmin"]),
  employeeController.profile
);

export default router;
