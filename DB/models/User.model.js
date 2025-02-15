import mongoose, { model, Schema, Types } from "mongoose";

const userSchema = new Schema(
  {
    userName: {
      type: String,
      min: 3,
      max: 20,
      lowercase: true,
      required: [true, "userName is required"],
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    noOfAppartment: {
      type: Number,
      required: true,
    },
    maintenanceDay: {
      type: String,
      default: new Date().toISOString().split("T")[0],
    },
    memberType: {
      type: String,
      required: true,
      enum: ["father", "mother", "son", "daughter"],
    },
    role: {
      type: String,
      default: "user",
      enum: ["user"],
    },
    userProblems: [{ type: Types.ObjectId, ref: "Problem" }],
    changeAccountInfo: Date,
    isDeleted: {
      type: Boolean,
      default: false,
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true ,toJSON: { virtuals: true }, toObject: { virtuals: true }}
);
userSchema.pre("find", function () {
  this.where({ isDeleted: false });
});
userSchema.virtual("problemDetails",{
  ref:"Problem",
  localField:"userProblems",
  foreignField:"_id"
})



const userModel = mongoose.models.User || model("User", userSchema);
export default userModel;
