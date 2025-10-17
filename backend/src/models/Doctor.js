import mongoose from 'mongoose';
import User from './User.js';
import employeeBaseSchema from './Employee.js';
import { doctorSchemaDefinition } from './doctor/DoctorSchema.js';
import { doctorAppointmentMethods } from './doctor/DoctorAppointmentMethods.js';
import { doctorPrescriptionMethods } from './doctor/DoctorPrescriptionMethods.js';
import { doctorProfileMethods } from './doctor/DoctorProfileMethods.js';
import { doctorStaticMethods } from './doctor/DoctorStaticMethods.js';

/**
 * Doctor Model - Following Single Responsibility Principle
 * Responsible only for doctor-specific functionality
 * Extends the base employee schema
 */
const doctorSchema = new mongoose.Schema(doctorSchemaDefinition);

// Pre-save middleware
doctorSchema.pre('save', function(next) {
  // Generate license number if not provided
  if (!this.licenseNumber) {
    const timestamp = Date.now().toString();
    this.licenseNumber = `MD${timestamp.substring(6)}`;
  }
  
  // Calculate average rating
  if (this.ratings && this.ratings.length > 0) {
    const totalRatings = this.ratings.length;
    const sumRatings = this.ratings.reduce((sum, rating) => sum + rating.rating, 0);
    this.averageRating = sumRatings / totalRatings;
    this.totalRatings = totalRatings;
  }
  
  next();
});

// Pre-validate middleware
doctorSchema.pre('validate', function(next) {
  // Validate availability format
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  days.forEach(day => {
    if (this.availability && this.availability[day]) {
      this.availability[day].forEach(slot => {
        if (!slot.start || !slot.end) {
          return next(new Error(`Invalid time slot for ${day}`));
        }
        
        const startTime = slot.start.split(':');
        const endTime = slot.end.split(':');
        
        if (startTime.length !== 2 || endTime.length !== 2) {
          return next(new Error(`Invalid time format for ${day}`));
        }
        
        const startMinutes = parseInt(startTime[0]) * 60 + parseInt(startTime[1]);
        const endMinutes = parseInt(endTime[0]) * 60 + parseInt(endTime[1]);
        
        if (startMinutes >= endMinutes) {
          return next(new Error(`Start time must be before end time for ${day}`));
        }
      });
    }
  });
  
  next();
});

// Add all methods to the schema
Object.assign(doctorSchema.methods, doctorAppointmentMethods);
Object.assign(doctorSchema.methods, doctorPrescriptionMethods);
Object.assign(doctorSchema.methods, doctorProfileMethods);
Object.assign(doctorSchema.statics, doctorStaticMethods);

// Merge employee base schema with doctor schema
const mergedDoctorSchema = new mongoose.Schema({
  ...employeeBaseSchema.obj,
  ...doctorSchema.obj
});

// Copy methods from employee base schema
Object.assign(mergedDoctorSchema.methods, employeeBaseSchema.methods);
Object.assign(mergedDoctorSchema.statics, employeeBaseSchema.statics);

// Add doctor-specific methods
Object.assign(mergedDoctorSchema.methods, doctorAppointmentMethods);
Object.assign(mergedDoctorSchema.methods, doctorPrescriptionMethods);
Object.assign(mergedDoctorSchema.methods, doctorProfileMethods);
Object.assign(mergedDoctorSchema.statics, doctorStaticMethods);

// Add pre-save and pre-validate middleware
mergedDoctorSchema.pre('save', function(next) {
  // Generate license number if not provided
  if (!this.licenseNumber) {
    const timestamp = Date.now().toString();
    this.licenseNumber = `MD${timestamp.substring(6)}`;
  }
  
  // Calculate average rating
  if (this.ratings && this.ratings.length > 0) {
    const totalRatings = this.ratings.length;
    const sumRatings = this.ratings.reduce((sum, rating) => sum + rating.rating, 0);
    this.averageRating = sumRatings / totalRatings;
    this.totalRatings = totalRatings;
  }
  
  next();
});

mergedDoctorSchema.pre('validate', function(next) {
  // Validate availability format
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  days.forEach(day => {
    if (this.availability && this.availability[day]) {
      this.availability[day].forEach(slot => {
        if (!slot.start || !slot.end) {
          return next(new Error(`Invalid time slot for ${day}`));
        }
        
        const startTime = slot.start.split(':');
        const endTime = slot.end.split(':');
        
        if (startTime.length !== 2 || endTime.length !== 2) {
          return next(new Error(`Invalid time format for ${day}`));
        }
        
        const startMinutes = parseInt(startTime[0]) * 60 + parseInt(startTime[1]);
        const endMinutes = parseInt(endTime[0]) * 60 + parseInt(endTime[1]);
        
        if (startMinutes >= endMinutes) {
          return next(new Error(`Start time must be before end time for ${day}`));
        }
      });
    }
  });
  
  next();
});

// Create Doctor model using discriminator pattern on User
const Doctor = User.discriminator('doctor', mergedDoctorSchema);

export default Doctor;