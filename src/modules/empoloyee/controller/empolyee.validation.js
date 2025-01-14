import joi from "joi";
import { generalFeilds } from "../../../middlewares/validation.middleware.js";

export const headersSchema = generalFeilds.headers;

export const createEmployeeSchema = joi
  .object({
    userName: generalFeilds.userName.required(),

    email: generalFeilds.email.required(),

    password: generalFeilds.password.required(),

    cPassword: generalFeilds.cPassword.valid(joi.ref("password")).required(),

    phone: generalFeilds.phone.required(),

    languages: joi.array()
    .items(
      joi.string()
        .valid(
          "English",
          "Mandarin Chinese",
          "Spanish",
          "Hindi",
          "Arabic",
          "French",
          "Bengali",
          "Russian",
          "Portuguese",
          "Urdu",
          "Japanese",
          "German",
          "Korean",
          "Italian",
          "Turkish"
        )
        .default("Arabic")
    )
    .required(),
    
  days: joi.array()
    .items(
      joi.string()
        .valid(
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday"
        )
        .default("Saturday")
    )
    .required()
  })
  .required()
  .messages({
    "object.base": "Input must be a valid object.",
  });

export const deleteEmployeeSchema = joi
  .object({
    employeeId: generalFeilds.id,
  })
  .required()
  .messages({
    "object.base": "Input must be a valid object.",
  });

export const createProblemSchema = joi
  .object({
    userId: generalFeilds.id,

    file: joi.object({
      problemImage: joi.array().items(generalFeilds.file).length(1),
    }),

    problemTitle: joi.string().required(),

    problemDescription: joi.string().required(),
  })
  .required()
  .messages({
    "object.base": "Input must be a valid object.",
  });



export const getAppoitmentSchema = joi
  .object({
    appoinmentId: generalFeilds.id,
  })
  .required()
  .messages({
    "object.base": "Input must be a valid object.",
  });
