import multer from "multer";
import { asyncHandler } from "./errorHandling.js";
import { dangerousExtensions } from "./dangerousExtensions.js";

export const allowedTypesMap = {
  galleryImages: ["image/png", "image/jpeg","image/gif","image/webp"],
  postImage: ["image/png", "image/jpeg","image/gif","image/webp"],
  maintenanceImage: ["image/png", "image/jpeg","image/gif","image/webp"],
  problemImage: ["image/png", "image/jpeg","image/gif","image/webp"],
  appoinmentAttachment: ["image/png", "image/jpeg", "application/pdf","image/gif","image/webp"],
  announcementAttach: ["image/png", "image/jpeg","image/jpg", "application/pdf","image/gif","image/webp"],
};

const fileValidation = (allowedTypesMap = {}) => {
  return asyncHandler(async (req, file, cb) => {
    const fileExtension = file.originalname.split(".").pop().toLowerCase();
    if (dangerousExtensions.includes(fileExtension)) {
      return cb(
        new Error(`File type '${fileExtension}' not allowed`, { cause: 400 }),
        false
      );
    }

    const allowedMimeTypes = allowedTypesMap[file.fieldname] || [];
      // Allow all images dynamically for 'announcementAttach'
      if (
        file.fieldname === "announcementAttach" &&
        file.mimetype.startsWith("image/")
      ) {
        return cb(null, true); // Allow all image types
      }
  
    if (!allowedMimeTypes.includes(file.mimetype)) {
      return cb(
        new Error(`Invalid type for ${file.fieldname}`, { cause: 400 }),
        false
      );
    }

    cb(null, true);
  });
};

export function fileUpload(size, allowedTypesMap) {
  const storage = multer.diskStorage({});
  const limits = { fileSize: size * 1024 * 1024 };
  const fileFilter = fileValidation(allowedTypesMap);
  const upload = multer({ fileFilter, storage, limits });
  return upload;
}
