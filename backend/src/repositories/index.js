RepositoryFactory.register('patient', new PatientRepository());
RepositoryFactory.register('doctor', new DoctorRepository());
RepositoryFactory.register('appointment', new AppointmentRepository());
RepositoryFactory.register('notification', new NotificationRepository());
RepositoryFactory.register('prescription', new PrescriptionRepository());

export default RepositoryFactory;