import Attendance from "../models/attendance.model.js";
import Joi from "joi";

// Employee check-in
export const checkIn = async (req, res) => {
  try {
    const { employeeId } = req.body;
    const today = new Date().setHours(0, 0, 0, 0);

    const existing = await Attendance.findOne({ employeeId, date: today });
    if (existing) {
      return res.status(400).json({ message: "Already checked in today" });
    }

    const record = await Attendance.create({ employeeId, checkIn: new Date() });
    res.status(201).json({ success: true, data: record });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Employee check-out
export const checkOut = async (req, res) => {
  try {
    const { employeeId } = req.body;
    const today = new Date().setHours(0, 0, 0, 0);

    const record = await Attendance.findOne({ employeeId, date: today });
    if (!record) {
      return res.status(404).json({ message: "No check-in record found for today" });
    }

    record.checkOut = new Date();
    await record.save();
    res.json({ success: true, data: record });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get attendance logs
export const getAttendance = async (req, res) => {
  try {
    const records = await Attendance.find().populate("employeeId", "firstName lastName email");
    res.json({ success: true, data: records });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
