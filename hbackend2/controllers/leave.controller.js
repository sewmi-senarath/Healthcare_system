import Leave from "../models/leave.model.js";
import Joi from "joi";

const leaveSchema = Joi.object({
  employeeId: Joi.string().required(),
  leaveType: Joi.string().valid("Annual", "Medical", "Casual", "Maternity").required(),
  startDate: Joi.date().required(),
  endDate: Joi.date().required(),
  reason: Joi.string().allow(""),
});

// Apply for leave
export const applyLeave = async (req, res) => {
  try {
    const { error, value } = leaveSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.message });

    const leave = await Leave.create(value);
    res.status(201).json({ success: true, data: leave });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Approve/Reject leave
export const updateLeaveStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const leave = await Leave.findByIdAndUpdate(id, { status }, { new: true });
    if (!leave) return res.status(404).json({ message: "Leave not found" });

    res.json({ success: true, data: leave });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all leave requests
export const getAllLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find().populate("employeeId", "firstName lastName email");
    res.json({ success: true, data: leaves });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
