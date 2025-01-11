import mongoose, { model, Schema, Types } from "mongoose";

const gallerySchema = new Schema(
  {
    customId:String,
    galleryTitle: {
      type: String,
      required: true,
    },
    galleryDescription: {
      type: String,
      required: true,
    },
    gallaryAuthorType:String,
    galleryImages: [
      {
        imageUrl: { type: String, required: true },
        imageDate: {
          type: String,
          required:true,
          default:()=> new Date().toISOString().split("T")[0],
        }
      }
    ],
    createdBy: { type: Types.ObjectId, ref: "Admin", required: true },
    updatedBy: { type: Types.ObjectId, ref: "Admin"},
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);
const galleryModel = mongoose.models.Gallery || model("Gallery", gallerySchema);
export default galleryModel;
