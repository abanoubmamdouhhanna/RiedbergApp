import mongoose, { model, Schema, Types } from "mongoose";

const appoinmentSchema = new Schema({
  appoinmentTitle: {
    type: String,
    required: true,
  },
  appoinmentDate: {
    type: String,
    required: true,
  },
  appoinmentTime: {
    type: String,
    required: true,
  },
  employeeId: {
    type: Types.ObjectId,
    ref: "Employee",
  },
  reason: {
    type: String,
    required: true,
  },
  notes: String,
  appoinmentAttachment: String,
  isDeleted: { type: Boolean, default: false },
});
appoinmentSchema.pre("find", function () {
  this.where({ isDeleted: false });
});

const appoinmentModel =
  mongoose.models.Appoinment || model("Appoinment", appoinmentSchema);
export default appoinmentModel;
