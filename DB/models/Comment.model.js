import mongoose, { model, Schema, Types } from "mongoose";

const reactionSchema = new Schema(
  {
    userId: { type: Types.ObjectId, required: true }, 
    userType: {
      type: String,
      enum: ["user", "admin", "employee"],
      required: true,
    }, 
  },
  { _id: false } 
);

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

    likes: [reactionSchema], // Reference the reaction schema
    unlikes: [reactionSchema], // Reference the reaction schema

    postId: { type: Types.ObjectId, ref: "Post", required: true },

    reply: [{ type: Types.ObjectId, ref: "Comment" }],

    isReply: { type: Boolean, default: false },

    createdBy: {
      type: Types.ObjectId,
      required: true,
      refPath: "createdByModel",
    },
    createdByModel: {
      type: String,
      required: true,
      enum: ["User", "Employee", "Admin"],
    },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

commentSchema.pre("find", function () {
  this.where({ isDeleted: false });
});
const commentModel = mongoose.models.Comment || model("Comment", commentSchema);
export default commentModel;
