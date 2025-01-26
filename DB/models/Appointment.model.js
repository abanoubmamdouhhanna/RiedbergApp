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
  createdBy:{type:Types.ObjectId,ref:"User"},
  isDeleted: { type: Boolean, default: false },
},
{
  timestamps:true,toJSON: { virtuals: true }, toObject: { virtuals: true } 
});
appoinmentSchema.pre("find", function () {
  this.where({ isDeleted: false });
});
appoinmentSchema.virtual("empDetails",{
  ref:"Employee",
  localField:"employeeId",
  foreignField:"_id",
  justOne:true
})


const appoinmentModel =
  mongoose.models.Appoinment || model("Appoinment", appoinmentSchema);
export default appoinmentModel;
