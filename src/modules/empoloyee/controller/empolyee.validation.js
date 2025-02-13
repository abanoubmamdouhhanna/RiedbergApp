import joi from "joi";
import { generalFeilds } from "../../../middlewares/validation.middleware.js";

export const headersSchema = generalFeilds.headers;

export const createEmployeeSchema = joi
  .object({
    userName: generalFeilds.userName,

    email: generalFeilds.email,

    password: generalFeilds.password,

    workSpecialization:joi.array(),

    cPassword: generalFeilds.cPassword.valid(joi.ref("password")),

    phone: generalFeilds.phone,

    languages: joi
      .array()
      .items(
        joi
          .string()
          // .valid(
          //   "English",
          //   "Mandarin Chinese",
          //   "Spanish",
          //   "Hindi",
          //   "Arabic",
          //   "French",
          //   "Bengali",
          //   "Russian",
          //   "Portuguese",
          //   "Urdu",
          //   "Japanese",
          //   "German",
          //   "Korean",
          //   "Italian",
          //   "Turkish"
          // )
          // .default("Arabic")
      )
      ,

    days: joi
      .array()
      .items(
        joi
          .string()
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
      ,
  })
  .required()
  .messages({
    "object.base": "Input must be a valid object.",
  });

export const updateEmployeeSchema = joi
  .object({
    employeeId: generalFeilds.id,

    userName: generalFeilds.userName,

    email: generalFeilds.email,

    workSpecialization:joi.array(),

    oldPassword: generalFeilds.password,

    newPassword:generalFeilds.password
        .disallow(joi.ref("oldPassword"))
        .messages({
          "any.invalid": "New Password cannot be the same as Old Password.",
        }),

    phone: generalFeilds.phone,

    languages: joi
      .array()
      .items(
        joi
          .string()
          // .valid(
          //   "English",
          //   "Mandarin Chinese",
          //   "Spanish",
          //   "Hindi",
          //   "Arabic",
          //   "French",
          //   "Bengali",
          //   "Russian",
          //   "Portuguese",
          //   "Urdu",
          //   "Japanese",
          //   "German",
          //   "Korean",
          //   "Italian",
          //   "Turkish"
          // )
          // .default("Arabic")
      ),
    days: joi
      .array()
      .items(
        joi
          .string()
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
      ),
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
