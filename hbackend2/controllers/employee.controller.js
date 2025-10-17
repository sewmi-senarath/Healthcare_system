// controllers/employee.controller.js
import Joi from "joi";
import Employee from "../models/employee.model.js";

const idParamSchema = Joi.object({
  id: Joi.string().length(24).hex().required()
});

const createSchema = Joi.object({
  firstName: Joi.string().trim().min(2).required(),
  lastName:  Joi.string().trim().min(2).required(),
  email:     Joi.string().email().required(),
  phone:     Joi.string().trim().optional(),
  role:      Joi.string().valid("doctor", "nurse", "pharmacist", "manager", "staff").required(),
  salary:    Joi.number().min(0).optional(),
  status:    Joi.string().valid("active", "inactive").optional(),
  joinedAt:  Joi.date().optional(),
  address: Joi.object({
    line1: Joi.string().allow(""),
    line2: Joi.string().allow(""),
    city: Joi.string().allow(""),
    state: Joi.string().allow(""),
    zip: Joi.string().allow(""),
    country: Joi.string().allow("")
  }).optional()
});

const updateSchema = createSchema.fork(
  ["firstName","lastName","email","role"],
  (s) => s.optional()
);

export const createEmployee = async (req, res) => {
  try {
    const { error, value } = createSchema.validate(req.body, { abortEarly: false });
    if (error) return res.status(400).json({ success: false, message: "Validation failed", details: error.details });

    const exists = await Employee.findOne({ email: value.email, isDeleted: false });
    if (exists) return res.status(409).json({ success: false, message: "Email already exists" });

    const employee = await Employee.create(value);
    return res.status(201).json({ success: true, data: employee });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getEmployees = async (req, res) => {
  try {
    // Filters & pagination
    const {
      q, role, status,
      page = 1, limit = 10,
      sort = "-createdAt" // e.g. "firstName" or "-salary"
    } = req.query;

    const filter = { isDeleted: false };
    if (role)   filter.role = role;
    if (status) filter.status = status;

    if (q) {
      filter.$text = { $search: q };
    }

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const pageSize = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 100);

    const [items, total] = await Promise.all([
      Employee.find(filter).sort(sort).skip((pageNum - 1) * pageSize).limit(pageSize),
      Employee.countDocuments(filter)
    ]);

    return res.json({
      success: true,
      data: items,
      meta: {
        total,
        page: pageNum,
        limit: pageSize,
        pages: Math.ceil(total / pageSize)
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getEmployeeById = async (req, res) => {
  try {
    const { error } = idParamSchema.validate(req.params);
    if (error) return res.status(400).json({ success: false, message: "Invalid ID" });

    const employee = await Employee.findOne({ _id: req.params.id, isDeleted: false });
    if (!employee) return res.status(404).json({ success: false, message: "Employee not found" });

    return res.json({ success: true, data: employee });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const updateEmployee = async (req, res) => {
  try {
    const { error: idErr } = idParamSchema.validate(req.params);
    if (idErr) return res.status(400).json({ success: false, message: "Invalid ID" });

    const { error: bodyErr, value } = updateSchema.validate(req.body, { abortEarly: false });
    if (bodyErr) return res.status(400).json({ success: false, message: "Validation failed", details: bodyErr.details });

    // If email is being updated, ensure uniqueness (excluding this doc)
    if (value.email) {
      const exists = await Employee.findOne({ email: value.email, _id: { $ne: req.params.id }, isDeleted: false });
      if (exists) return res.status(409).json({ success: false, message: "Email already in use" });
    }

    const updated = await Employee.findOneAndUpdate(
      { _id: req.params.id, isDeleted: false },
      { $set: value },
      { new: true }
    );

    if (!updated) return res.status(404).json({ success: false, message: "Employee not found" });
    return res.json({ success: true, data: updated });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteEmployee = async (req, res) => {
  try {
    const { error } = idParamSchema.validate(req.params);
    if (error) return res.status(400).json({ success: false, message: "Invalid ID" });

    const deleted = await Employee.findOneAndUpdate(
      { _id: req.params.id, isDeleted: false },
      { $set: { isDeleted: true, status: "inactive" } },
      { new: true }
    );

    if (!deleted) return res.status(404).json({ success: false, message: "Employee not found" });
    return res.json({ success: true, message: "Employee deleted (soft)", data: deleted });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
