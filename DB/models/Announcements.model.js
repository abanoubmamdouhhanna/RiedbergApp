import mongoose, { model, Schema, Types } from "mongoose";

const announcementSchema = new Schema(
  {
    customId: String,
    author: {
      type: String,
      required: true,
    },
    announcementTitle: {
      type: String,
      required: true,
    },
    announcementDesc: {
      type: String,
      required: true,
    },
    Priority: {
      type: String,
      default: "Normal",
      enum: ["Normal", "High"],
    },
    type: {
      type: String,
      default: "Information",
      enum: ["Information", "Event", "Maintenance"],
    },
    Date: {
      type: String,
      required: true,
      default: new Date().toISOString().split("T")[0],
    },
    Time: {
      type: String,
      required: true,
      default: new Date().toISOString().split("T")[1].split(".")[0],
    },
    announcementAttach: String,
    createdBy: { type: Types.ObjectId, ref: "Admin", required: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);
announcementSchema.pre("find", function () {
  this.where({ isDeleted: false });
});
const announcementModel =
  mongoose.models.Announcement || model("Announcement", announcementSchema);
export default announcementModel;
