import mongoose, { Schema, model } from "mongoose";

const responseSchema = new Schema(
  {
    notificationId: {
      type: mongoose.Types.ObjectId,
      ref: "Notification",
      required: true,
    },
    userId: { type: mongoose.Types.ObjectId, required: true },
    userType: { type: String, enum: ["User", "Employee"], required: true },
    userName: { type: String, required: true },
    status: {
      type: String,
      enum: [
        "1. I am Safe, and at the Gathering Point",
        "2. I am outside the building (in the city)",
        "3. I need help",
      ],
      required: true,
    },
  },
  { timestamps: true }
);

const responseModel =
  mongoose.models.Response || model("Response", responseSchema);
export default responseModel;
