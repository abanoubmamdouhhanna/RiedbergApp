import mongoose, { model, Schema, Types } from "mongoose";

const maintenanceSchema = new Schema(
  {
    customId:String,
    categoryName: {
      type: String,
      default: "Pluming",
      enum: ["Pluming", "Electrical", "Heating", "Other"],
    },
    maintenanceDescription: {
      type: String,
      required: true,
    },
    Priority: {
      type: String,
      default: "Low",
      enum: ["Low", "Medium", "High"],
    },
    maintenanceOrderStatuses: {
      type: String,
      default: "Pending",
      enum: ["Pending", "Accepted", "In-Progress", "Completed", "Cancelled"],
    },
    maintenanceImage: String,
    maintenanceStatusImage: String,
    feedbackComment: String,
    createdBy: { type: Types.ObjectId, ref: "Admin", required: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const maintenanceModel =
  mongoose.models.Maintenance || model("Maintenance", maintenanceSchema);
export default maintenanceModel;
