import mongoose, { model, Schema, Types } from "mongoose";

const privacySchema = new Schema(
  {
   privacy:String
  },
  { timestamps: true}
);


const privacyModel = mongoose.models.Privacy || model("Privacy", privacySchema);
export default privacyModel;
