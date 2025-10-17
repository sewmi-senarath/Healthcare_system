/**
 * AsyncHandler - Wrapper to catch async errors
 */
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Example usage in controller:
// async bookAppointment(req, res) {
//   return asyncHandler(async (req, res) => {
//     const appointment = await this.appointmentService.bookAppointment(req.body);
//     ResponseFormatter.created(res, { appointment }, 'Appointment booked successfully');
//   })(req, res);
// }

export default {
  EmployeeServiceFactory,
  DoctorService,
  NotificationRepository,
  PrescriptionRepository,
  ResponseFormatter,
  ValidationHelper,
  ErrorHandler,
  errorMiddleware,
  asyncHandler
};