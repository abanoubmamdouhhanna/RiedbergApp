import mongoose, { model, Schema, Types } from "mongoose";

const problemSchema = new Schema(
  {
    problemTitle: {
      type: String,
      required: true,
    },
    problemDescription: {
      type: String,
      required: true,
    },
    problemImage: String,
    createdBy: { type: Types.ObjectId, ref: "Employee", required: true },
    creationDate: { type: Date, default: Date.now },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);
problemSchema.pre("find", function () {
  this.where({ isDeleted: false });
});

const problemModel = mongoose.models.Problem || model("Problem", problemSchema);
export default problemModel;
