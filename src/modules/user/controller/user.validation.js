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

    familyMembers: joi
      .object()
      .pattern(
        joi.string().valid("father", "mother", "son", "daughter"), // Only specific keys are allowed
        joi.number().integer().min(0) // Values must be non-negative integers
      )
      .required()
      .messages({
        "object.base": "Family members must be an object.",
        "object.pattern.match":
          "Keys must be one of 'father', 'mother', 'son', or 'daughter', and values must be non-negative numbers.",
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
      .max(new Date(`${new Date().getFullYear()}-12-31`))// Maintenance day cannot be in next year
      .messages({
        "date.min": "Maintenance day must be today or in the future.",
        "date.max": `Maintenance day must be within the current year (${ new Date().getFullYear()}).`,
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