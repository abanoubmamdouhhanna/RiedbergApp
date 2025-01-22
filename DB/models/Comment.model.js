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
  { _id: false } // Prevent creation of a separate `_id` for each sub-document
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
const commentModel = mongoose.models.Comment || model("Comment", commentSchema);
export default commentModel;
