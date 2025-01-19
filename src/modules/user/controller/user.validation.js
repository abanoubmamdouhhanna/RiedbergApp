import joi from "joi";
import { generalFeilds } from "../../../middlewares/validation.middleware.js";

export const headersSchema = generalFeilds.headers;

export const createUserSchema = joi
  .object({
    userName: generalFeilds.userName.required(),

    email: generalFeilds.email.required(),

    password: generalFeilds.password.required(),

    cPassword: generalFeilds.cPassword.valid(joi.ref("password")).required(),

    phone: generalFeilds.phone.required(),

    noOfAppartment: joi
      .number()
      .integer()
      .min(1) // Ensure at least 1 apartment
      .required()
      .messages({
        "number.base": "Number of apartments must be a number.",
        "number.min": "Number of apartments must be at least 1.",
      }),

    maintenanceDay: joi
      .date()
      .min("now") // Maintenance day cannot be in the past
      .messages({
        "date.min": "Maintenance day must be today or in the future.",
      }),

    memberType: joi
      .string()
      .valid("father", "mother", "son", "daughter")
      .default("father")
      .messages({
        "any.only":
          "Member type must be one of 'father', 'mother', 'son', or 'daughter'.",
        "string.base": "Member type must be a string.",
      }),

    role: joi
      .string()
      .valid("user") // Only "user" is allowed
      .default("user") // Default value is "user"
      .messages({
        "any.only": "Role must be 'user'.",
      }),
  })
  .required()
  .messages({
    "object.base": "Input must be a valid object.",
  });

new Date(`${new Date().getFullYear()}-12-31`);
export const updateUserSchema = joi
  .object({
    maintenanceDay: joi
      .date()
      .min("now") // Maintenance day cannot be in the past
      .max(new Date(`${new Date().getFullYear()}-12-31`)) // Maintenance day cannot be in next year
      .messages({
        "date.min": "Maintenance day must be today or in the future.",
        "date.max": `Maintenance day must be within the current year (${new Date().getFullYear()}).`,
      }),
  })
  .required()
  .messages({
    "object.base": "Input must be a valid object.",
  });

export const deleteUserSchema = joi
  .object({
    userId: generalFeilds.id,
  })
  .required()
  .messages({
    "object.base": "Input must be a valid object.",
  });

export const createAppoinmentSchema = joi
  .object({
    employeeId: generalFeilds.optionalId,

    file: joi.object({
      appoinmentAttachment: joi
        .array()
        .items(generalFeilds.file)
        .min(1)
        .messages({
          "array.length":
            "The appointment attachment must contain exactly one file.",
          "array.min": "Appointment attachment can't be empty.",
        }),
    }),

    appoinmentTitle: joi.string().required(),

    appoinmentDate: joi
      .date()
      .min("now")
      .messages({
        "date.base": "Appointment date must be a valid date.",
        "date.greater": "Appointment date must be today or in the future.",
        "any.required": "Appointment date is required.",
      })
      .required(),

    appoinmentTime: joi
      .string()
      .custom((value, helpers) => {
        const validTimes = [];
        for (let hour = 8; hour < 20; hour++) {
          validTimes.push(`${hour.toString().padStart(2, "0")}:00`);
          validTimes.push(`${hour.toString().padStart(2, "0")}:30`);
        }
        validTimes.push("20:00");

        if (!validTimes.includes(value)) {
          return helpers.message(
            `Invalid appointment time. Please select a time from 08:00 to 20:00 in 30-minute intervals.`
          );
        }
        return value;
      })
      .required()
      .messages({
        "any.required": "Appointment time is required.",
      }),

    reason: joi.string().required(),

    notes: joi.string(),
  })
  .required()
  .messages({
    "object.base": "Input must be a valid object.",
  });
