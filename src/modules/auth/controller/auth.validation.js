import joi from "joi";
import { generalFeilds } from "../../../middlewares/validation.middleware.js";

export const headersSchema = generalFeilds.headers;

export const registerationSchema = joi
  .object({
    userName: generalFeilds.userName.required(),

    email: generalFeilds.email.required(),

    password: generalFeilds.password.required(),

    cPassword: generalFeilds.cPassword.valid(joi.ref("password")).required(),

    phone: generalFeilds.phone.required(),
  })
  .required()
  .messages({
    "object.base": "Input must be a valid object.",
  });

export const loginSchema = joi
  .object({
    email: generalFeilds.email.required(),

    password: generalFeilds.password.required(),
  })
  .required()
  .messages({
    "object.base": "Input must be a valid object.",
  });
