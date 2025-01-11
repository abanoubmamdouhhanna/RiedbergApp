import mongoose, { model, Schema } from "mongoose";

const adminSchema = new Schema(
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
    changeAccountInfo: Date,
    phone: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      default: "admin",
      enum: ["admin","superAdmin"],
    }
  },
  { timestamps: true }
);

const adminModel = mongoose.models.Admin || model("Admin", adminSchema);
export default adminModel;
