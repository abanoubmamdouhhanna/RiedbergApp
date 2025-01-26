import joi from "joi";
import { generalFeilds } from "../../../middlewares/validation.middleware.js";

export const headersSchema = generalFeilds.headers;

export const geSpGallerySchema = joi
  .object({
    galleryId: generalFeilds.id,
  })
  .required()
  .messages({
    "object.base": "Input must be a valid object.",
  });

export const addPostSchema = joi
  .object({
    file: joi.object({
      postImage: joi.array().items(generalFeilds.file).length(1),
    }),

    postTitle: joi.string().required(),

    postContent: joi.string().required(),
  })
  .required()
  .messages({
    "object.base": "Input must be a valid object.",
  });
export const updatePostSchema = joi
  .object({
    postId: generalFeilds.id,
    file: joi.object({
      postImage: joi.array().items(generalFeilds.file).length(1),
    }),

    postTitle: joi.string(),

    postContent: joi.string(),
  })
  .required()
  .messages({
    "object.base": "Input must be a valid object.",
  });

export const deletePostSchema = joi
  .object({
    postId: generalFeilds.id,
  })
  .required()
  .messages({
    "object.base": "Input must be a valid object.",
  });

export const createCommentSchema = joi
  .object({
    postId: generalFeilds.id,

    commentContent: joi.string().required(),
  })
  .required()
  .messages({
    "object.base": "Input must be a valid object.",
  });

export const createReplyCommentSchema = joi
  .object({
    commentId: generalFeilds.id,

    commentContent: joi.string().required(),
  })
  .required()
  .messages({
    "object.base": "Input must be a valid object.",
  });

export const likeSchema = joi
  .object({
    commentId: generalFeilds.id,
  })
  .required()
  .messages({
    "object.base": "Input must be a valid object.",
  });

export const PostLikeSchema = joi
  .object({
    postId: generalFeilds.id,
  })
  .required()
  .messages({
    "object.base": "Input must be a valid object.",
  });

export const addMaintenanceSchema = joi
  .object({
    categoryName: joi
      .string()
      .valid("Plumbing", "Electrical", "Heating", "Other") // Allowed values
      .default("Plumbing") // Default value
      .required()
      .messages({
        "any.only":
          "Category name must be one of ['Plumbing', 'Electrical', 'Heating', 'Other'].",
        "any.required": "Category name is required.",
      }),

    maintenanceDescription: joi
      .string()
      .required() // Required field
      .messages({
        "string.base": "Maintenance description must be a string.",
        "any.required": "Maintenance description is required.",
      }),

    Priority: joi
      .string()
      .valid("Low", "Medium", "High") // Allowed values
      .default("Low") // Default value
      .messages({
        "any.only": "Priority must be one of ['Low', 'Medium', 'High'].",
        "any.required": "Priority is required.",
      }),

    maintenanceOrderStatuses: joi
      .string()
      .valid("Pending", "Accepted", "In-Progress", "Completed", "Cancelled") // Allowed values
      .default("Pending") // Default value
      .messages({
        "any.only":
          "Maintenance order status must be one of ['Pending', 'Accepted', 'In-Progress', 'Completed', 'Cancelled'].",
        "any.required": "Maintenance order status is required.",
      }),
    notes: joi.string().optional().messages({
      "string.base": "Notes must be a string.",
    }),

    file: joi.object({
      maintenanceImage: joi.array().items(generalFeilds.file).length(1),
    }),
  })
  .required()
  .messages({
    "object.base": "Input must be a valid object.",
  });

export const updateMaintenanceSchema = joi
  .object({
    maintenanceId: generalFeilds.id,

    categoryName: joi
      .string()
      .valid("Plumbing", "Electrical", "Heating", "Other") // Allowed values
      .default("Plumbing") // Default value
      .messages({
        "any.only":
          "Category name must be one of ['Plumbing', 'Electrical', 'Heating', 'Other'].",
        "any.required": "Category name is required.",
      }),

    maintenanceDescription: joi.string().messages({
      "string.base": "Maintenance description must be a string.",
      "any.required": "Maintenance description is required.",
    }),

    Priority: joi
      .string()
      .valid("Low", "Medium", "High") // Allowed values
      .default("Low") // Default value
      .messages({
        "any.only": "Priority must be one of ['Low', 'Medium', 'High'].",
        "any.required": "Priority is required.",
      }),

    maintenanceOrderStatuses: joi
      .string()
      .valid("Pending", "Accepted", "In-Progress", "Completed", "Cancelled") // Allowed values
      .default("Pending") // Default value
      .messages({
        "any.only":
          "Maintenance order status must be one of ['Pending', 'Accepted', 'In-Progress', 'Completed', 'Cancelled'].",
        "any.required": "Maintenance order status is required.",
      }),
    notes: joi.string().optional().messages({
      "string.base": "Notes must be a string.",
    }),

    file: joi.object({
      maintenanceImage: joi.array().items(generalFeilds.file).length(1),

      notes: joi.string(),
    }),
  })
  .required()
  .messages({
    "object.base": "Input must be a valid object.",
  });

export const getAnnouncementSchema = joi
  .object({
    announcementId: generalFeilds.id,
  })
  .required()
  .messages({
    "object.base": "Input must be a valid object.",
  });

export const handleResponsetSchema = joi
  .object({
    notificationId: generalFeilds.id,
    status: joi
      .string()
      .valid(
        "I am Safe, and at the Gathering Point",
        "I am outside the building (in the city)",
        "I need help"
      ) // Allowed values
      .messages({
        "any.only":
          "Status must be one of [I am Safe, and at the Gathering Point - I am outside the building (in the city) - I need help]",
        "any.required": "Status is required.",
      }),
  })
  .required()
  .messages({
    "object.base": "Input must be a valid object.",
  });
