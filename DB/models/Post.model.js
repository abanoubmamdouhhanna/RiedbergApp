import mongoose, { model, Schema, Types } from "mongoose";

const postSchema = new Schema(
  {
    customId:String,
    postTitle: {
      type: String,
      required: true,
    },
    postContent: {
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
    authorType:String,
    postImage: String,
    comments: [{ type: Types.ObjectId, ref: "Comment" }],
    createdBy: { type: Types.ObjectId, required: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);
const postModel = mongoose.models.Post || model("Post", postSchema);
export default postModel; 
