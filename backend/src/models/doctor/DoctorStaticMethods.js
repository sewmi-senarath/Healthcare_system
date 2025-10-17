/**
 * DoctorStaticMethods - Static methods for Doctor model
 * Following Single Responsibility Principle - Only handles static query operations
 */

export const doctorStaticMethods = {
  /**
   * Find doctors by specialization
   * @param {string} specialization 
   * @returns {Promise<Array>}
   */
  findBySpecialization: function(specialization) {
    return this.find({ specialization, status: 'active' });
  },

  /**
   * Find doctors by hospital
   * @param {string} hospitalID 
   * @returns {Promise<Array>}
   */
  findByHospital: function(hospitalID) {
    return this.find({ assignedHospitalID: hospitalID, status: 'active' });
  },

  /**
   * Find available doctors
   * @param {Date} date 
   * @param {string} time 
   * @returns {Promise<Array>}
   */
  findAvailableDoctors: function(date, time) {
    return this.find({
      status: 'active',
      currentPatientCount: { $lt: '$maxPatientsPerDay' }
    });
  },

  /**
   * Find doctors by department
   * @param {string} department 
   * @returns {Promise<Array>}
   */
  findByDepartment: function(department) {
    return this.find({ department, status: 'active' });
  },

  /**
   * Find doctors by experience range
   * @param {number} minExperience 
   * @param {number} maxExperience 
   * @returns {Promise<Array>}
   */
  findByExperienceRange: function(minExperience, maxExperience) {
    return this.find({
      experience: { $gte: minExperience, $lte: maxExperience },
      status: 'active'
    });
  },

  /**
   * Find doctors by consultation fee range
   * @param {number} minFee 
   * @param {number} maxFee 
   * @returns {Promise<Array>}
   */
  findByConsultationFeeRange: function(minFee, maxFee) {
    return this.find({
      consultationFee: { $gte: minFee, $lte: maxFee },
      status: 'active'
    });
  },

  /**
   * Find doctors by rating
   * @param {number} minRating 
   * @returns {Promise<Array>}
   */
  findByRating: function(minRating) {
    return this.find({
      averageRating: { $gte: minRating },
      status: 'active'
    });
  },

  /**
   * Find doctors by language
   * @param {string} language 
   * @returns {Promise<Array>}
   */
  findByLanguage: function(language) {
    return this.find({
      languages: language,
      status: 'active'
    });
  },

  /**
   * Find doctors by availability on specific day
   * @param {string} day 
   * @returns {Promise<Array>}
   */
  findByDayAvailability: function(day) {
    return this.find({
      [`availability.${day}`]: { $exists: true, $ne: [] },
      status: 'active'
    });
  },

  /**
   * Find doctors by emergency availability
   * @returns {Promise<Array>}
   */
  findByEmergencyAvailability: function() {
    return this.find({
      'emergencyAvailability.isAvailable': true,
      status: 'active'
    });
  },

  /**
   * Find top rated doctors
   * @param {number} limit 
   * @returns {Promise<Array>}
   */
  findTopRated: function(limit = 10) {
    return this.find({ status: 'active' })
      .sort({ averageRating: -1, totalRatings: -1 })
      .limit(limit);
  },

  /**
   * Find doctors with most experience
   * @param {number} limit 
   * @returns {Promise<Array>}
   */
  findMostExperienced: function(limit = 10) {
    return this.find({ status: 'active' })
      .sort({ experience: -1 })
      .limit(limit);
  },

  /**
   * Find doctors by consultation type
   * @param {string} consultationType 
   * @returns {Promise<Array>}
   */
  findByConsultationType: function(consultationType) {
    return this.find({
      'consultationTypes.type': consultationType,
      'consultationTypes.isAvailable': true,
      status: 'active'
    });
  },

  /**
   * Find doctors by special service
   * @param {string} service 
   * @returns {Promise<Array>}
   */
  findBySpecialService: function(service) {
    return this.find({
      'specialServices.service': service,
      status: 'active'
    });
  },

  /**
   * Find doctors by patient type
   * @param {string} patientType 
   * @returns {Promise<Array>}
   */
  findByPatientType: function(patientType) {
    return this.find({
      'patientTypes.type': patientType,
      status: 'active'
    });
  },

  /**
   * Get doctor statistics
   * @returns {Promise<Object>}
   */
  getDoctorStatistics: async function() {
    const totalDoctors = await this.countDocuments();
    const activeDoctors = await this.countDocuments({ status: 'active' });
    const inactiveDoctors = await this.countDocuments({ status: 'inactive' });
    
    // Specialization distribution
    const specializationStats = await this.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: '$specialization', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    // Department distribution
    const departmentStats = await this.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: '$department', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    // Average rating
    const avgRating = await this.aggregate([
      { $match: { status: 'active', totalRatings: { $gt: 0 } } },
      { $group: { _id: null, avgRating: { $avg: '$averageRating' } } }
    ]);
    
    // Average consultation fee
    const avgFee = await this.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: null, avgFee: { $avg: '$consultationFee' } } }
    ]);
    
    return {
      total: totalDoctors,
      active: activeDoctors,
      inactive: inactiveDoctors,
      averageRating: avgRating[0]?.avgRating || 0,
      averageConsultationFee: avgFee[0]?.avgFee || 0,
      specializations: specializationStats,
      departments: departmentStats
    };
  },

  /**
   * Search doctors
   * @param {Object} searchCriteria 
   * @returns {Promise<Array>}
   */
  searchDoctors: function(searchCriteria) {
    const query = { status: 'active' };
    
    if (searchCriteria.specialization) {
      query.specialization = searchCriteria.specialization;
    }
    
    if (searchCriteria.department) {
      query.department = searchCriteria.department;
    }
    
    if (searchCriteria.hospitalID) {
      query.assignedHospitalID = searchCriteria.hospitalID;
    }
    
    if (searchCriteria.minRating) {
      query.averageRating = { $gte: searchCriteria.minRating };
    }
    
    if (searchCriteria.maxFee) {
      query.consultationFee = { $lte: searchCriteria.maxFee };
    }
    
    if (searchCriteria.language) {
      query.languages = searchCriteria.language;
    }
    
    if (searchCriteria.emergencyAvailable) {
      query['emergencyAvailability.isAvailable'] = true;
    }
    
    let sortCriteria = {};
    if (searchCriteria.sortBy) {
      switch (searchCriteria.sortBy) {
        case 'rating':
          sortCriteria = { averageRating: -1, totalRatings: -1 };
          break;
        case 'experience':
          sortCriteria = { experience: -1 };
          break;
        case 'fee':
          sortCriteria = { consultationFee: 1 };
          break;
        default:
          sortCriteria = { name: 1 };
      }
    }
    
    return this.find(query)
      .sort(sortCriteria)
      .limit(searchCriteria.limit || 20);
  }
};
