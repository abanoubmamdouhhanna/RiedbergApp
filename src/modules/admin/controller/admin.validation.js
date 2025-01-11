import joi from "joi";
import { generalFeilds } from "../../../middlewares/validation.middleware.js";

export const headersSchema = generalFeilds.headers;

export const deleteAdminSchema = joi
  .object({
    adminId: generalFeilds.id,
  })
  .required()
  .messages({
    "object.base": "Input must be a valid object.",
  });

export const addGallerySchema = joi
  .object({
    galleryTitle: joi.string().required(),

    galleryDescription: joi.string().required(),
    file: joi.object({
      galleryImages: joi.array().items(generalFeilds.file).max(5),
    }),
  })
  .required()
  .messages({
    "object.base": "Input must be a valid object.",
  });

export const aupdateGallerySchema = joi
  .object({
    galleryId: generalFeilds.id,
    galleryTitle: joi.string(),

    galleryDescription: joi.string(),

    file: joi.object({
      galleryImages: joi.array().items(generalFeilds.file).max(5),
    }),
  })
  .required()
  .messages({
    "object.base": "Input must be a valid object.",
  });

export const changeStatusSchema = joi
  .object({
    maintenanceId: generalFeilds.id,

    file: joi.object({
      maintenanceStatusImage: joi.array().items(generalFeilds.file).length(1),
    }),

    maintenanceOrderStatuses: joi
      .string()
      .valid("Pending", "Accepted", "In-Progress", "Completed", "Cancelled"),

    feedbackComment: joi.string(),
  })
  .required()
  .messages({
    "object.base": "Input must be a valid object.",
  });

export const createNotificationSchema = joi
  .object({
    recipientId: generalFeilds.id,
    notifyTitle: joi.string().required(),
    notifyDescription: joi.string().required(),
    recipientType: joi.string().required(),
  })
  .required()
  .messages({
    "object.base": "Input must be a valid object.",
  });

export const creatAnnouncementSchema = joi
  .object({
    file: joi.object({
      announcementAttach: joi.array().items(generalFeilds.file).length(1),
    }),

    announcementTitle: joi.string().required(),

    announcementDesc: joi.string().required(),

    Priority: joi.string().valid("Normal", "High"),

    type:joi.string()
    .valid("Information", "Event", "Maintenance")
    .default("Information")
  })
  .required()
  .messages({
    "object.base": "Input must be a valid object.",
  });

export const updateAnnouncementSchema = joi
  .object({
    announcementId:generalFeilds.id,
    file: joi.object({
      announcementAttach: joi.array().items(generalFeilds.file).length(1),
    }),

    author: generalFeilds.userName,

    announcementTitle: joi.string().required(),

    announcementDesc: joi.string().required(),

    Priority: joi.string().valid("Normal", "High"),
  })
  .required()
  .messages({
    "object.base": "Input must be a valid object.",
  });

export const updateFamilySchema = joi
  .object({
    userId: generalFeilds.id,

    userName: generalFeilds.userName,

    email: generalFeilds.email,

    phone: generalFeilds.phone,

    noOfAppartment: joi
      .number()
      .integer()
      .min(1) // Ensure at least 1 apartment
      .messages({
        "number.base": "Number of apartments must be a number.",
        "number.min": "Number of apartments must be at least 1.",
      }),

    familyMembers: joi
      .object()
      .pattern(
        joi.string().valid("father", "mother", "son", "daughter"), // Only specific keys are allowed
        joi.number().integer().min(0) // Values must be non-negative integers
      )

      .messages({
        "object.base": "Family members must be an object.",
        "object.pattern.match":
          "Keys must be one of 'father', 'mother', 'son', or 'daughter', and values must be non-negative numbers.",
      }),
  })
  .required()
  .messages({
    "object.base": "Input must be a valid object.",
  });

export const updatePasswordSchema = joi
  .object({
    userId: generalFeilds.id,

    oldPassword: generalFeilds.password,

    newPassword: generalFeilds.password
      .disallow(joi.ref("oldPassword"))
      .messages({
        "any.invalid": "New Password cannot be the same as Old Password.",
      }),
  })
  .required()
  .messages({
    "object.base": "Input must be a valid object.",
  });
