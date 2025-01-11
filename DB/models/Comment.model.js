import mongoose, { model, Schema, Types } from "mongoose";

const commentSchema = new Schema(
  {
    author: {
      type: String,
      required: true,
    },
    commentContent: {
      type: String,
      required: true,
    },
    likes: [
      {
        userId: { type: Types.ObjectId, required: true }, // Reference to the user, admin, or employee ID
        userType: { type: String, enum: ["User", "Admin", "Employee"], required: true }, // Role of the user
      },
    ],
    unlikes: [
      {
        userId: { type: Types.ObjectId, required: true }, // Reference to the user, admin, or employee ID
        userType: { type: String, enum: ["User", "Admin", "Employee"], required: true }, // Role of the user
      },
    ],
    

    postId: { type: Types.ObjectId, ref: "Post", required: true },
    reply: [{ type: Types.ObjectId, ref: "Comment" }],
    createdBy: { type: Types.ObjectId, ref: "Admin", required: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);
const commentModel = mongoose.models.Comment || model("Comment", commentSchema);
export default commentModel;
