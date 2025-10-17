import mongoose from "mongoose";

const LeaveSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    leaveType: {
      type: String,
      enum: ["Annual", "Medical", "Casual", "Maternity"],
      required: true,
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    reason: { type: String, trim: true },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Leave", LeaveSchema);
