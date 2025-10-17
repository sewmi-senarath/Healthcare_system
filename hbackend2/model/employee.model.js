// models/employee.model.js
import mongoose from "mongoose";

const { Schema } = mongoose;

const EmployeeSchema = new Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName:  { type: String, required: true, trim: true },
    email:     { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone:     { type: String, trim: true },
    role:      { type: String, enum: ["doctor", "nurse", "pharmacist", "manager", "staff"], required: true },
    salary:    { type: Number, min: 0, default: 0 },
    status:    { type: String, enum: ["active", "inactive"], default: "active" },
    joinedAt:  { type: Date, default: Date.now },
    address: {
      line1: String,
      line2: String,
      city:  String,
      state: String,
      zip:   String,
      country: { type: String, default: "Sri Lanka" }
    },
    isDeleted: { type: Boolean, default: false }
  },
  { timestamps: true }
);

EmployeeSchema.index({ email: 1 }, { unique: true });
EmployeeSchema.index({ firstName: "text", lastName: "text", email: "text", role: "text" });

export default mongoose.model("Employee", EmployeeSchema);
