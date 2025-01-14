import { nanoid } from "nanoid";
import { asyncHandler } from "../../../utils/errorHandling.js";
import cloudinary from "../../../utils/cloudinary.js";
import galleryModel from "../../../../DB/models/Gallery.model.js";
import postModel from "../../../../DB/models/Post.model.js";
import commentModel from "../../../../DB/models/Comment.model.js";
import maintenanceModel from "../../../../DB/models/Maintenance.model.js";
import userModel from "../../../../DB/models/User.model.js";
import employeeModel from "../../../../DB/models/Employee.model.js";
import adminModel from "../../../../DB/models/Admin.model.js";

//profile

export const profile = asyncHandler(async (req, res, next) => {
  const roleModelMap = {
    user: userModel,
    employee: employeeModel,
    admin: adminModel,
    superAdmin: adminModel,
  };

  const model = roleModelMap[req.user.role];

  if (!model) {
    return next(new Error("Invalid role provided", { cause: 400 }));
  }

  let profileQuery = await model.findOne({ _id: req.user._id });

  if (req.user.role === "user") {
    profileQuery = profileQuery.populate("userProblems"); // Assuming "userProblems" is a reference to another model
  }

  const profile = await profileQuery;
  if (!profile) {
    return next(
      new Error(`${req.user.role} profile not found`, { cause: 404 })
    );
  }
  return res
    .status(200)
    .json({
      status: "Success",
      message: `${req.user.role} profile`,
      result: profile,
    });
});

//====================================================================================================================//
//get gallery

export const getGallery = asyncHandler(async (req, res, next) => {
  const gallery = await galleryModel.find();
  if (!gallery || gallery.length === 0) {
    return next(new Error("no gellaries found", { cause: 404 }));
  }
  return res.status(200).json({
    status: "success",
    message: "All gellaries",
    result: gallery,
  });
});

//====================================================================================================================//
//get sp gallery

export const geSpGallery = asyncHandler(async (req, res, next) => {
  const { galleryId } = req.params;
  const gallery = await galleryModel.findById(galleryId);
  if (!gallery || gallery.length === 0) {
    return next(new Error("no gellaries found", { cause: 404 }));
  }
  return res.status(200).json({
    status: "success",
    message: "Done",
    result: gallery,
  });
});

//====================================================================================================================//
//add post

export const addPost = asyncHandler(async (req, res, next) => {
  if (req.files?.postImage?.[0]?.path) {
    const customId = nanoid();
    req.body.customId = customId;
    const postImage = await cloudinary.uploader.upload(
      req.files.postImage[0].path,
      {
        folder: `${process.env.APP_NAME}/Posts/${customId}/postImage`,
        public_id: `${customId}postImage`,
      }
    );
    req.body.postImage = postImage.secure_url;
  }
  req.body.createdBy = req.user._id;
  req.body.authorType = req.user.role;
  const addPost = await postModel.create(req.body);
  return res.status(201).json({
    status: "success",
    message: "Post created successfully",
    result: addPost,
  });
});
//====================================================================================================================//
//update Post

export const updatePost = asyncHandler(async (req, res, next) => {
  const { postId } = req.params;
  const post = await postModel.findOne({
    _id: postId,
    createdBy: req.user._id,
  });
  if (!post) {
    return next(
      new Error("In-valid post ID or no posts found", { cause: 404 })
    );
  }
  if (req.files?.postImage?.[0]?.path) {
    const postImage = await cloudinary.uploader.upload(
      req.files.postImage[0].path,
      {
        folder: `${process.env.APP_NAME}/Posts/${post.customId}/postImage`,
        public_id: `${post.customId}postImage`,
      }
    );
    req.body.postImage = postImage.secure_url;
  }
  const updatePost = await postModel.findByIdAndUpdate(
    { _id: postId },
    req.body,
    {
      new: true,
    }
  );
  if (!updatePost) {
    return next(new Error("Post not found, update failed.", { cause: 404 }));
  }

  return res.status(200).json({ message: "post updated", result: updatePost });
});

//====================================================================================================================//
//delete post

export const deletePost = asyncHandler(async (req, res, next) => {
  const { postId } = req.params;
  const post = await postModel.findOne({
    _id: postId,
    createdBy: req.user._id,
  });
  if (!post) {
    return next(new Error("you are not authorized", { cause: 401 }));
  }
  await commentModel.deleteMany({ postId });
  const deletedPost = await postModel.findByIdAndDelete(postId);
  if (!deletedPost) {
    return next(new Error("Post not found, delete failed.", { cause: 404 }));
  }
  return res.status(200).json({
    status: "success",
    message: "Post and associated comments deleted successfully",
    result: deletedPost,
  });
});

//====================================================================================================================//
//get Posts
const populateReplies = (depth) => {
  let populateConfig = {
    path: "reply",
    populate: {},
  };

  if (depth > 1) {
    populateConfig.populate = populateReplies(depth - 1);
  } else {
    populateConfig.populate = {
      path: "createdBy",
      select: "userName email phone",
    };
  }

  return populateConfig;
};

export const getPosts = async (req, res, next) => {
  const post = await postModel
    .find()
    .populate({
      path: "comments",
      populate: populateReplies(100), //Maximum call stack size :2379
    })
    .populate({
      path: "createdBy",
      select: "userName email phone",
    });

  return res.status(200).json({ message: "All posts", result: post });
};

//====================================================================================================================//
//get user posts

const populateUserReplies = (depth) => {
  let populateConfig = {
    path: "reply",
    populate: {},
  };

  if (depth > 1) {
    populateConfig.populate = populateUserReplies(depth - 1);
  } else {
    populateConfig.populate = {
      path: "createdBy",
      select: "userName email phone",
    };
  }

  return populateConfig;
};

export const getUserPosts = async (req, res, next) => {

   
  const posts = await postModel
    .find({createdBy:req.user._id})
    .populate({
      path: "comments",
      populate: populateReplies(100), //Maximum call stack size :2379
    })

  return res.status(200).json({ message: "All posts", result: posts });
};
//====================================================================================================================//
//add comment

export const createComment = asyncHandler(async (req, res, next) => {
  const { postId } = req.params;
  const { commentContent } = req.body;

  const post = await postModel.findById(postId);
  if (!post) {
    return next(new Error("In-valid post ID", { cause: 400 }));
  }
  const comment = await commentModel.create({
    author: req.user.userName,
    createdBy: req.user._id,
    commentContent,
    postId,
  });
  post.comments.push(comment._id);
  await post.save();
  return res.status(201).json({
    status: "success",
    message: "Comment created successfully",
    comment,
  });
});

//====================================================================================================================//
//create reply

export let createReplyComment = asyncHandler(async (req, res, next) => {
  let { commentId } = req.params;
  let { commentContent } = req.body;

  let comment = await commentModel.findOne({ _id: commentId });
  if (!comment) {
    return next(new Error("In-valid comment ID", { cause: 400 }));
  }
  let replyComment = await commentModel.create({
    commentContent,
    postId: comment.postId,
    createdBy: req.user._id,
    author: req.user.userName,
  });
  comment.reply.push(replyComment);
  await comment.save();
  return res.status(201).json({ message: "Done", replyComment });
});
//====================================================================================================================//
//add comment like

export let addlike = asyncHandler(async (req, res, next) => {
  let { commentId } = req.params;
  let userRole;
  if (req.user.role == "superAdmin") {
    userRole = "Admin";
  }
  let comment = await commentModel.findOneAndUpdate(
    { _id: commentId },
    {
      $addToSet: { likes: { userId: req.user._id, userType: userRole } },
      $pull: { unlikes: { userId: req.user._id } },
    },
    { new: true }
  );
  return res.status(201).json({ message: "liked", comment });
});
//====================================================================================================================//
//add comment unLike

export let addUnLike = asyncHandler(async (req, res, next) => {
  let { commentId } = req.params;
  let userRole;
  if (req.user.role == "superAdmin") {
    userRole = "Admin";
  }
  let comment = await commentModel.findOneAndUpdate(
    { _id: commentId },
    {
      $addToSet: { unlikes: { userId: req.user._id, userType: userRole } },
      $pull: { likes: { userId: req.user._id } },
    },
    { new: true }
  );
  return res.status(201).json({ message: "un liked", comment });
});
//====================================================================================================================//
//add post like

export let addPostLike = asyncHandler(async (req, res, next) => {
  let { postId } = req.params;
  let userRole;
  if (req.user.role == "superAdmin") {
    userRole = "Admin";
  }
  let post = await postModel.findOneAndUpdate(
    { _id: postId },
    {
      $addToSet: { likes: { userId: req.user._id, userType: userRole } },
      $pull: { unlikes: { userId: req.user._id } },
    },
    { new: true }
  );
  return res.status(201).json({ message: "liked", post });
});
//====================================================================================================================//
//add post unLike

export let addPostUnLike = asyncHandler(async (req, res, next) => {
  let { postId } = req.params;
  let userRole;
  if (req.user.role == "superAdmin") {
    userRole = "Admin";
  }
  let post = await postModel.findOneAndUpdate(
    { _id: postId },
    {
      $addToSet: { unlikes: { userId: req.user._id, userType: userRole } },
      $pull: { likes: { userId: req.user._id } },
    },
    { new: true }
  );
  return res.status(201).json({ message: "un liked", post });
});

//====================================================================================================================//
//Add Maintenance

export const addMaintenance = asyncHandler(async (req, res, next) => {
  if (req.files?.maintenanceImage?.[0]?.path) {
    const customId = nanoid();
    req.body.customId = customId;
    const maintenanceImage = await cloudinary.uploader.upload(
      req.files.maintenanceImage[0].path,
      {
        folder: `${process.env.APP_NAME}/Maintenances/${customId}/maintenanceImage`,
        public_id: `${customId}maintenanceImage`,
      }
    );
    req.body.maintenanceImage = maintenanceImage.secure_url;
  }
  req.body.createdBy = req.user._id;
  const addMaintenance = await maintenanceModel.create(req.body);
  return res.status(201).json({
    status: "success",
    message: "Maintenance created successfully",
    result: addMaintenance,
  });
});
//====================================================================================================================//
//Update Maintenance

export const updateMaintenance = asyncHandler(async (req, res, next) => {
  const { maintenanceId } = req.params;
  const checkmaintenance = await maintenanceModel.findById(maintenanceId);
  if (!checkmaintenance) {
    return next(new Error("Maintenance not found", { cause: 404 }));
  }
  if (req.files?.maintenanceImage?.[0]?.path) {
    const maintenanceImage = await cloudinary.uploader.upload(
      req.files.maintenanceImage[0].path,
      {
        folder: `${process.env.APP_NAME}/Maintenances/${checkmaintenance.customId}/maintenanceImage`,
        public_id: `${checkmaintenance.customId}maintenanceImage`,
      }
    );
    req.body.maintenanceImage = maintenanceImage.secure_url;
  }
  const updatedMaintenance = await maintenanceModel.findByIdAndUpdate(
    { _id: maintenanceId, createdBy: req.user._id },
    req.body,
    { new: true }
  );
  if (!updatedMaintenance) {
    return next(
      new Error("Maintenance record not found or update failed.", {
        cause: 404,
      })
    );
  }
  return res.status(201).json({
    status: "success",
    message: "Maintenance updated successfully",
    result: updatedMaintenance,
  });
});
//====================================================================================================================//
//get maintenance

export const getMaintenance = asyncHandler(async (req, res, next) => {
  const maintenance = await maintenanceModel.findById(req.params.maintenanceId);

  return res.status(200).json({
    status: "success",
    message: "Done",
    result: maintenance,
  });
});
