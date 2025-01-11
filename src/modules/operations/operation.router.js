import { Router } from "express";
import * as operationController from "./controller/operations.js";
import { auth } from "../../middlewares/auth.middleware.js";
import { fileUpload } from "../../utils/multerCloudinary.js";
import { isValid } from "../../middlewares/validation.middleware.js";
import {
  addMaintenanceSchema,
  addPostSchema,
  createCommentSchema,
  createReplyCommentSchema,
  deletePostSchema,
  geSpGallerySchema,
  getMaintenanceSchema,
  headersSchema,
  likeSchema,
  PostLikeSchema,
  updateMaintenanceSchema,
  updatePostSchema,
} from "./controller/operations.validation.js";

const router = Router();


// profile
router.get(
  "/profile",
  isValid(headersSchema, true),
  auth(["admin", "superAdmin", "employee", "user"]),
  operationController.profile
);

//get gallery
router.get(
  "/getGallery",
  isValid(headersSchema, true),
  auth(["admin", "superAdmin", "employee", "user"]),
  operationController.getGallery
);

//get specific gallery
router.get(
  "/geSpGallery/:galleryId",
  isValid(headersSchema, true),
  auth(["admin", "superAdmin", "employee", "user"]),
  isValid(geSpGallerySchema),
  operationController.geSpGallery
);

//add post
router.post(
  "/addPost",
  isValid(headersSchema, true),
  auth(["admin", "superAdmin", "employee", "user"]),
  fileUpload(2).fields([
    {
      name: "postImage",
      maxCount: 1,
    },
  ]),
  isValid(addPostSchema),
  operationController.addPost
);

//update post
router.patch(
  "/updatePost/:postId",
  isValid(headersSchema, true),
  auth(["admin", "superAdmin", "employee", "user"]),
  fileUpload(2).fields([
    {
      name: "postImage",
      maxCount: 1,
    },
  ]),
  isValid(updatePostSchema),
  operationController.updatePost
);

//delete post
router.delete(
  "/deletePost/:postId",
  isValid(headersSchema, true),
  auth(["admin", "superAdmin", "employee", "user"]),
  isValid(deletePostSchema),
  operationController.deletePost
);

//get all posts
router.get("/getPosts", operationController.getPosts);

//create comment
router.post(
  "/createComment/:postId",
  isValid(headersSchema, true),
  auth(["admin", "superAdmin", "employee", "user"]),
  isValid(createCommentSchema),
  operationController.createComment
);

//create reply
router.post(
  "/:commentId/reply",
  isValid(headersSchema, true),
  auth(["admin", "superAdmin", "employee", "user"]),
  isValid(createReplyCommentSchema),
  operationController.createReplyComment
);

//add like
router.patch(
  "/:commentId/like",
  isValid(headersSchema, true),
  auth(["admin", "superAdmin", "employee", "user"]),
  isValid(likeSchema),
  operationController.addlike
);
//add unLike
router.patch(
  "/:commentId/unlike",
  isValid(headersSchema, true),
  auth(["admin", "superAdmin", "employee", "user"]),
  isValid(likeSchema),
  operationController.addUnLike
);

//add post like
router.patch(
  "/:postId/postlike",
  isValid(headersSchema, true),
  auth(["admin", "superAdmin", "employee", "user"]),
  isValid(PostLikeSchema),
  operationController.addPostLike
);

//add post unLike
router.patch(
  "/:postId/postunlike",
  isValid(headersSchema, true),
  auth(["admin", "superAdmin", "employee", "user"]),
  isValid(PostLikeSchema),
  operationController.addPostUnLike
);

//add maintenance
router.post(
  "/addMaintenance",
  isValid(headersSchema, true),
  auth("user"),
  fileUpload(2).fields([
    {
      name: "maintenanceImage",
      maxCount: 1,
    },
  ]),
  isValid(addMaintenanceSchema),
  operationController.addMaintenance
);

//update maintenance
router.patch(
  "/updateMaintenance/:maintenanceId",
  isValid(headersSchema, true),
  auth("user"),
  fileUpload(2).fields([
    {
      name: "maintenanceImage",
      maxCount: 1,
    },
  ]),
  isValid(updateMaintenanceSchema),
  operationController.updateMaintenance
);

//get maintenance
router.get(
  "/getMaintenance/:maintenanceId",
  isValid(headersSchema, true),
  auth(["admin", "superAdmin", "employee", "user"]),
  isValid(getMaintenanceSchema),
  operationController.getMaintenance
);

export default router;
