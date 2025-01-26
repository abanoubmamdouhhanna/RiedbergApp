import mongoose, { model, Schema, Types } from "mongoose";

const notificationSchema = new Schema(
  {
    notifyTitle: {
      type: String,
      default:"A fire has been reported in the building."
    },
    notifyDescription: {
      type: String,
      default:"Please evacuate immediately using the nearest emergency exit to the gathering Point. Await further instructions"
    },
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
