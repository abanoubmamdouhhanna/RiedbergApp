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
    languages: [
      {
        type: String,
        default: "Arabic",
        enum: [
          "English",
          "Mandarin Chinese",
          "Spanish",
          "Hindi",
          "Arabic",
          "French",
          "Bengali",
          "Russian",
          "Portuguese",
          "Urdu",
          "Japanese",
          "German",
          "Korean",
          "Italian",
          "Turkish",
        ],
      },
    ],
    days:[{type:String,
      default:"Saturday",
      enum: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday"
      ]
    }]
    ,changeAccountInfo: Date,
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

const employeeModel =
  mongoose.models.Employee || model("Employee", employeeSchema);
export default employeeModel;
