/**
 * NurseService - Single Responsibility: Nurse-specific business logic
 */
export class NurseService {
  constructor(nurseRepo) {
    this.nurseRepo = nurseRepo;
  }

  async getNurseProfile(nurseId) {
    return await this.nurseRepo.findById(nurseId);
  }

  async updateNurseProfile(nurseId, updateData) {
    return await this.nurseRepo.update(nurseId, updateData);
  }

  async getNursesByWard(ward) {
    return await this.nurseRepo.find({ assignedWard: ward });
  }

  async getNurseShift(nurseId) {
    const nurse = await this.nurseRepo.findById(nurseId);
    return nurse?.shiftSchedule || null;
  }

  // Add more nurse-specific methods as needed
}