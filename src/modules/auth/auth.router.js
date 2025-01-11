import { Router } from "express";
import * as authController from "./controller/auth.js";
import { auth } from "../../middlewares/auth.middleware.js";
import { isValid } from "../../middlewares/validation.middleware.js";
import { headersSchema, loginSchema, registerationSchema } from "./controller/auth.validation.js";
const router = Router();

//admin registeration or create an admin
router.post(
  "/register",
  isValid(headersSchema, true),
  auth("superAdmin"),
  isValid(registerationSchema),
  authController.adminRegisteration
);

// login
router.post("/logIn",  isValid(loginSchema)
,authController.logIn)


export default router;
