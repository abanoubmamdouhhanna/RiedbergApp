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
    likes: [reactionSchema],
    unlikes: [reactionSchema],

    authorType: {
      type: String,
      required: true,
      enum: ["user", "admin", "superAdmin", "employee"],
    },
    postImage: String,
    comments: [{ type: Types.ObjectId, ref: "Comment" }],
    createdBy: {
      type: Types.ObjectId,
      refPath: "createdByModel",
      required: true,
    },
    createdByModel: {
      type: String,
      required: true,
      enum: ["User", "Admin", "Employee"],
    },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);
postSchema.pre("find", function () {
  this.where({ isDeleted: false });
});

const postModel = mongoose.models.Post || model("Post", postSchema);
export default postModel;
