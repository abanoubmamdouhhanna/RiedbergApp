import mongoose, { model, Schema, Types } from "mongoose";

const reactionSchema = new Schema(
  {
    userId: { type: Types.ObjectId, required: true }, // Reference to the user
    userType: {
      type: String,
      enum: ["user", "admin", "employee"],
      required: true,
    }, // Role of the user
  },
  { _id: false }
);

const postSchema = new Schema(
  {
    customId: String,
    postTitle: {
      type: String,
      required: true,
    },
    postContent: {
      type: String,
      required: true,
    },
    likes: [reactionSchema], // Reference the reaction schema
    unlikes: [reactionSchema], // Reference the reaction schema

    authorType: {
      type: String,
      required: true,
      enum: ["user", "admin", "superAdmin", "employee"], // Ensure it matches valid model types
    },
    postImage: String,
    comments: [{ type: Types.ObjectId, ref: "Comment" }],
    createdBy: { type: Types.ObjectId, required: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);
const postModel = mongoose.models.Post || model("Post", postSchema);
export default postModel;
