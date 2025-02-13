import mongoose, { model, Schema, Types } from "mongoose";

const employeeSchema = new Schema(
  {
    userName: {
      type: String,
      min: 3,
      max: 20,
      lowercase: true,
      required: [true, "userName is required"],
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      default: "employee",
      enum: ["employee"],
    },
    workSpecialization:[String],
    languages: [
      {
        type: String,
        // default: "Arabic",
        // enum: [
        //   "English",
        //   "Mandarin Chinese",
        //   "Spanish",
        //   "Hindi",
        //   "Arabic",
        //   "French",
        //   "Bengali",
        //   "Russian",
        //   "Portuguese",
        //   "Urdu",
        //   "Japanese",
        //   "German",
        //   "Korean",
        //   "Italian",
        //   "Turkish",
        // ],
      },
    ],
    days: [
      {
        type: String,
        default: "Saturday",
        enum: [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday",
        ],
      },
    ],
    changeAccountInfo: Date,
    isDeleted: {
      type: Boolean,
      default: false,
    },

    schedule: [
      {
        date: String, // "YYYY-MM-DD"
        times: { type: [String], default: [] }, // Reserved times ["09:00", "10:30", ...]
      },
    ],
    isDeleted: {
      type: Boolean,
      default: false,
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);
employeeSchema.pre("find", function () {
  this.where({ isDeleted: false });
});

const employeeModel =
  mongoose.models.Employee || model("Employee", employeeSchema);
export default employeeModel;
