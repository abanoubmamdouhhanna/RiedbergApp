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
import announcementModel from "../../../../DB/models/Announcements.model.js";

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
  return res.status(200).json({
    status: "Success",
    message: `${req.user.role} profile`,
    result: profile,
  });
});

//====================================================================================================================//
//get gallery

export const getGallery = asyncHandler(async (req, res, next) => {
  const gallery = await galleryModel.find();
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
  const customId = nanoid();
  if (req.files?.postImage?.[0]?.path) {
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
  req.body.customId=customId

  const roleToModelMap = {
    admin: "Admin",
    superAdmin: "Admin", // Assuming superAdmin is also mapped to the Admin model
    employee: "Employee",
    user: "User",
  };
  
  const createdByModel = roleToModelMap[req.user.role];
  
  if (!createdByModel) {
    return next(
      new Error(
        "Invalid user role",
        { cause: 400 }
      )
    );
  }
req.body.createdByModel=createdByModel

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
const populateAllReplies = (depth) => {
  let populateConfig = {
    path: "reply",
    populate: {},
  };

  if (depth > 1) {
    populateConfig.populate = populateAllReplies(depth - 1);
  } else {
    populateConfig.populate = {
      path: "createdBy",
      select: "userName email phone",
    };
  }

  return populateConfig;
};

//allPosts

export const allPosts = asyncHandler(async (req, res, next) => {
  const userId = req.user._id; 
  const posts = await postModel
    .find()
    .populate({
      path: "createdBy", 
      select: "userName email phone", 
    })
    .populate({
      path: "comments",
      populate: [
        {
          path: "createdBy", 
          select: "userName email phone", 
        },
        {
          path: "reply",
          populate: populateAllReplies(10),
        },
      ],
    });

  // Add `like` and `unliked` fields for the logged-in user
  const postsWithUserInteraction = posts.map((post) => {
    const isLiked = post.likes.some(
      (like) => like.userId && like.userId.toString() === userId.toString()
    );
    const isUnliked = post.unlikes.some(
      (unlike) =>
        unlike.userId && unlike.userId.toString() === userId.toString()
    );

    return {
      ...post.toObject(), // Convert the post document to a plain object
      like: isLiked,
      unliked: isUnliked,
    };
  });

  return res
    .status(200)
    .json({ message: "All posts", result: postsWithUserInteraction });
});



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
  const userId = req.user._id; // Get the logged-in user's ID

  const posts = await postModel.find({ createdBy: userId }).populate({
    path: "comments",
    populate: populateUserReplies(10), //Maximum call stack size :2379
  });
  // Add `like` and `unliked` fields for the logged-in user
  const postsWithUserInteraction = posts.map((post) => {
    const isLiked = post.likes.some(
      (like) => like.userId && like.userId.toString() === userId.toString()
    );
    const isUnliked = post.unlikes.some(
      (unlike) =>
        unlike.userId && unlike.userId.toString() === userId.toString()
    );
    return {
      ...post.toObject(), // Convert the post document to a plain object
      like: isLiked,
      unliked: isUnliked,
    };
  });

  return res
    .status(200)
    .json({ message: "All posts", result: postsWithUserInteraction });
};
//====================================================================================================================//
//add comment

export const createComment = asyncHandler(async (req, res, next) => {
  const { postId } = req.params;
  const { commentContent } = req.body;

  const post = await postModel.findById(postId);
  if (!post) {
    return next(new Error("Invalid post ID", { cause: 400 }));
  }
  const roleToModelMap = {
    admin: "Admin",
    superAdmin: "Admin", 
    employee: "Employee",
    user: "User",
  };
  
  const createdByModel = roleToModelMap[req.user.role];
  
  if (!createdByModel) {
    return next(
      new Error(
        "Invalid user role",
        { cause: 400 }
      )
    );
  }

  const comment = await commentModel.create({
    author: req.user.userName,
    createdBy: req.user._id,
    createdByModel, 
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
//get post comments

export const getComments=asyncHandler(async(req,res,next)=>
{
  const {postId}=req.params
  const post=await postModel.findById(postId)
  if (!post) {
    return next(new Error("Invalid post ID", { cause: 400 }));

  }

  const comments =await commentModel.find({postId, isReply: false})
  .populate({
    path: "reply",
    populate: [
        {
        path: "reply",
        populate: populateAllReplies(10),
      },
    ],
  });

  return res.status(200).json({
    status: "success",
    message: "All post comments",
    comments,
  });

})
//====================================================================================================================//
//create reply

export let createReplyComment = asyncHandler(async (req, res, next) => {
  let { commentId } = req.params;
  let { commentContent } = req.body;

  let comment = await commentModel.findOne({ _id: commentId });
  if (!comment) {
    return next(new Error("In-valid comment ID", { cause: 400 }));
  }

  let createdByModel;
  if (req.user.role ===( "admin"  || "superAdmin")) {
    createdByModel = "Admin";
  } else if (req.user.role === "employee") {
    createdByModel = "Employee";
  } else if (req.user.role === "user") {
    createdByModel = "User";
  } else {
    return next(
      new Error("Invalid user role. Must be one of 'Admin', 'Employee', or 'User'.", { cause: 400 })
    );
  }

  let replyComment = await commentModel.create({
    commentContent,
    postId: comment.postId,
    createdBy: req.user._id,
    createdByModel,
    author: req.user.userName,
    isReply:true
  });
  comment.reply.push(replyComment);
  await comment.save();
  return res.status(201).json({ message: "Done", replyComment });
});
//====================================================================================================================//

// Get all replies to a comment
export const getReplies = asyncHandler(async (req, res, next) => {
  const { commentId } = req.params;

  const comment = await commentModel.findById(commentId);
  if (!comment) {
    return next(new Error("Invalid comment ID", { cause: 400 }));
  }

  const populatedComment = await commentModel
    .findById(commentId)
    .populate({
      path: "reply",
      select: "author commentContent likes unlikes createdAt", 
    });

  return res.status(200).json({
    status: "success",
    message: "Replies fetched successfully",
    replies: populatedComment?.reply || [],
  });
});

//====================================================================================================================//
//add comment like

export let addlike = asyncHandler(async (req, res, next) => {
  let { commentId } = req.params;
  const userId = req.user._id;
  const userRole = req.user.role === "superAdmin" ? "Admin" : req.user.role;

  const comment = await commentModel.findById(commentId);
  if (!comment) {
    return next(new Error("Comment not found", { cause: 404 }));
  }

  let updatedComment = await commentModel.findByIdAndUpdate(
    { _id: commentId },
    {
      $addToSet: { likes: { userId, userType: userRole } },
      $pull: { unlikes: { userId } },
    },
    { new: true }
  );
  return res.status(201).json({ message: "liked", updatedComment });
});
//====================================================================================================================//
//add comment unLike

export let addUnLike = asyncHandler(async (req, res, next) => {
  let { commentId } = req.params;
  const userRole = req.user.role === "superAdmin" ? "Admin" : req.user.role;

  const comment = await commentModel.findById(commentId);
  if (!comment) {
    return next(new Error("Comment not found", { cause: 404 }));
  }
  let updatedComment = await commentModel.findOneAndUpdate(
    { _id: commentId },
    {
      $addToSet: { unlikes: { userId: req.user._id, userType: userRole } },
      $pull: { likes: { userId: req.user._id } },
    },
    { new: true }
  );
  return res.status(201).json({ message: "un liked", updatedComment });
});
//====================================================================================================================//
//add post like

export let addPostLike = asyncHandler(async (req, res, next) => {
  const { postId } = req.params;
  const userId = req.user._id;
  const userRole = req.user.role === "superAdmin" ? "Admin" : req.user.role;

  // Find the post
  const post = await postModel.findById(postId);
  if (!post) {
    return next(new Error("Post not found", { cause: 404 }));
  }
  const updatedPost = await postModel.findByIdAndUpdate(
    postId,
    {
      $addToSet: { likes: { userId, userType: userRole } },
      $pull: { unlikes: { userId } },
    },
    { new: true }
  );

  return res.status(201).json({
    status: "success",
    message: "Post liked successfully.",
    updatedPost,
  });
});

//====================================================================================================================//
//add post unLike

export let addPostUnLike = asyncHandler(async (req, res, next) => {
  let { postId } = req.params;
  const userId = req.user._id;
  const userRole = req.user.role === "superAdmin" ? "Admin" : req.user.role;

  // Find the post
  const post = await postModel.findById(postId);
  if (!post) {
    return next(new Error("Post not found", { cause: 404 }));
  }
  let updatedPost = await postModel.findOneAndUpdate(
    { _id: postId },
    {
      $addToSet: { unlikes: { userId: userId, userType: userRole } },
      $pull: { likes: { userId: userId } },
    },
    { new: true }
  );
  return res.status(201).json({ message: "un liked", updatedPost });
});

//====================================================================================================================//
//Add Maintenance

export const addMaintenance = asyncHandler(async (req, res, next) => {
  const customId = nanoid();
  if (req.files?.maintenanceImage?.[0]?.path) {
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
  req.body.customId=customId
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

  const maintenance = await maintenanceModel.find({createdBy:req.user._id});
  if (!maintenance) {
    return next(
      new Error("no maintenances found", {
        cause: 404,
      })
    );
  }

  return res.status(200).json({
    status: "success",
    message: "Done",
    result: maintenance,
  });
});
//====================================================================================================================//
// all Ids

export const allIds = asyncHandler(async (req, res, next) => {
  const usersIds = await userModel.find().select("_id").lean();
  const employeesIds = await employeeModel.find().select("_id").lean();
  const Ids = [
    ...usersIds.map((user) => user._id),
    ...employeesIds.map((employee) => employee._id),
  ];
  return res.status(200).json({
    status: "success",
    message: "Done!",
    allIds: Ids,
  });
});
//====================================================================================================================//
//get announcement
export const getAnnouncement = asyncHandler(async (req, res, next) => {
  const { announcementId } = req.params;
  const announcement = await announcementModel.findById(announcementId);
  if (!announcement) {
    return next(new Error("Announcement not found", { cause: 404 }));
  }
  return res.status(200).json({
    status: "success",
    message: "Done",
    result: announcement,
  });
});

//====================================================================================================================//
//get all announcements

export const getAllAnnouncement = asyncHandler(async (req, res, next) => {
  const announcement = await announcementModel.find();
  return res.status(200).json({
    status: "success",
    message: "Done",
    count: announcement.length,
    result: announcement,
  });
});
