import mongoose, { model, Schema, Types } from "mongoose";

const notificationSchema = new Schema(
  {
    notifyTitle: {
      type: String,
      required: true,
    },
    notifyDescription: {
      type: String,
      required: true,
    },
    receieverType: String,
    userId: { type: Types.ObjectId, ref: "User" },
    employeeId: { type: Types.ObjectId, ref: "Employee" },
    createdBy: { type: Types.ObjectId, ref: "Admin", required: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);
notificationSchema.pre("find", function () {
  this.where({ isDeleted: false });
});

const notificationModel =
  mongoose.models.Notification || model("Notification", notificationSchema);
export default notificationModel;
