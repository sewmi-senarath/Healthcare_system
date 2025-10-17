/**
 * DoctorProfileMethods - Profile-related methods for Doctor model
 * Following Single Responsibility Principle - Only handles profile operations
 */

export const doctorProfileMethods = {
  /**
   * Update doctor availability
   * @param {string} day 
   * @param {Array} timeSlots 
   * @returns {Promise<Object>}
   */
  updateAvailability: function(day, timeSlots) {
    if (this.availability[day]) {
      this.availability[day] = timeSlots;
    }
    return this.save();
  },

  /**
   * Access patient record
   * @param {string} patientId 
   * @returns {Object}
   */
  accessPatientRecord: function(patientId) {
    // This would typically fetch from patient record service
    return {
      patientId: patientId,
      accessedBy: this.empID,
      accessedByName: this.name,
      accessTime: new Date(),
      specialization: this.specialization
    };
  },

  /**
   * Update contact information
   * @param {Object} contactData 
   * @returns {Promise<Object>}
   */
  updateContact: function(contactData) {
    const allowedFields = ['phone', 'whatsApp', 'preferredCommunicationMethod'];
    const updates = {};
    
    allowedFields.forEach(field => {
      if (contactData[field]) {
        updates[field] = contactData[field];
      }
    });
    
    Object.assign(this, updates);
    return this.save();
  },

  /**
   * Add patient rating
   * @param {string} patientId 
   * @param {number} rating 
   * @param {string} review 
   * @returns {Promise<Object>}
   */
  addRating: function(patientId, rating, review) {
    this.ratings.push({
      patientId: patientId,
      rating: rating,
      review: review,
      date: new Date()
    });
    
    // Recalculate average rating
    const totalRatings = this.ratings.length;
    const sumRatings = this.ratings.reduce((sum, r) => sum + r.rating, 0);
    this.averageRating = sumRatings / totalRatings;
    this.totalRatings = totalRatings;
    
    return this.save();
  },

  /**
   * Check availability for a specific date and time
   * @param {string} date 
   * @param {string} time 
   * @returns {boolean}
   */
  checkAvailability: function(date, time) {
    const dayOfWeek = new Date(date).toLocaleLowerCase();
    const dayAvailability = this.availability[dayOfWeek];
    
    if (!dayAvailability || dayAvailability.length === 0) {
      return false;
    }
    
    return dayAvailability.some(slot => 
      time >= slot.start && time < slot.end
    );
  },

  /**
   * Check if doctor can accept new patients
   * @returns {boolean}
   */
  canAcceptNewPatient: function() {
    return this.currentPatientCount < this.maxPatientsPerDay;
  },

  /**
   * Get doctor profile summary
   * @returns {Object}
   */
  getDoctorProfile: function() {
    return {
      empID: this.empID,
      name: this.name,
      email: this.email,
      specialization: this.specialization,
      department: this.department,
      phone: this.phone,
      whatsApp: this.whatsApp,
      preferredCommunicationMethod: this.preferredCommunicationMethod,
      licenseNumber: this.licenseNumber,
      experience: this.experience,
      education: this.education,
      consultationFee: this.consultationFee,
      maxPatientsPerDay: this.maxPatientsPerDay,
      currentPatientCount: this.currentPatientCount,
      averageRating: this.averageRating,
      totalRatings: this.totalRatings,
      profilePicture: this.profilePicture,
      bio: this.bio,
      languages: this.languages,
      availability: this.availability,
      hospitalAffiliations: this.hospitalAffiliations,
      researchInterests: this.researchInterests,
      publications: this.publications,
      awards: this.awards,
      professionalMemberships: this.professionalMemberships,
      consultationTypes: this.consultationTypes,
      specialServices: this.specialServices,
      emergencyAvailability: this.emergencyAvailability
    };
  },

  /**
   * Update profile information
   * @param {Object} profileData 
   * @returns {Promise<Object>}
   */
  updateProfile: function(profileData) {
    const allowedFields = [
      'name', 'email', 'specialization', 'department', 'phone', 'whatsApp',
      'preferredCommunicationMethod', 'experience', 'education', 'consultationFee',
      'maxPatientsPerDay', 'profilePicture', 'bio', 'languages', 'availability',
      'hospitalAffiliations', 'researchInterests', 'publications', 'awards',
      'professionalMemberships', 'consultationTypes', 'specialServices',
      'emergencyAvailability'
    ];
    
    const updates = {};
    allowedFields.forEach(field => {
      if (profileData[field] !== undefined) {
        updates[field] = profileData[field];
      }
    });
    
    Object.assign(this, updates);
    return this.save();
  },

  /**
   * Get doctor statistics
   * @returns {Object}
   */
  getDoctorStatistics: function() {
    return {
      totalRatings: this.totalRatings,
      averageRating: this.averageRating,
      currentPatientCount: this.currentPatientCount,
      maxPatientsPerDay: this.maxPatientsPerDay,
      experience: this.experience,
      consultationFee: this.consultationFee,
      specialization: this.specialization,
      languages: this.languages,
      publications: this.publications.length,
      awards: this.awards.length,
      professionalMemberships: this.professionalMemberships.length,
      hospitalAffiliations: this.hospitalAffiliations.length
    };
  },

  /**
   * Update office hours
   * @param {Object} officeHours 
   * @returns {Promise<Object>}
   */
  updateOfficeHours: function(officeHours) {
    this.officeHours = {
      ...this.officeHours,
      ...officeHours
    };
    return this.save();
  },

  /**
   * Add publication
   * @param {Object} publication 
   * @returns {Promise<Object>}
   */
  addPublication: function(publication) {
    this.publications.push({
      ...publication,
      addedDate: new Date()
    });
    return this.save();
  },

  /**
   * Add award
   * @param {Object} award 
   * @returns {Promise<Object>}
   */
  addAward: function(award) {
    this.awards.push({
      ...award,
      addedDate: new Date()
    });
    return this.save();
  },

  /**
   * Add professional membership
   * @param {Object} membership 
   * @returns {Promise<Object>}
   */
  addProfessionalMembership: function(membership) {
    this.professionalMemberships.push({
      ...membership,
      addedDate: new Date()
    });
    return this.save();
  },

  /**
   * Add hospital affiliation
   * @param {Object} affiliation 
   * @returns {Promise<Object>}
   */
  addHospitalAffiliation: function(affiliation) {
    this.hospitalAffiliations.push({
      ...affiliation,
      addedDate: new Date()
    });
    return this.save();
  },

  /**
   * Update emergency availability
   * @param {Object} emergencyData 
   * @returns {Promise<Object>}
   */
  updateEmergencyAvailability: function(emergencyData) {
    this.emergencyAvailability = {
      ...this.emergencyAvailability,
      ...emergencyData
    };
    return this.save();
  },

  /**
   * Get consultation types
   * @returns {Array}
   */
  getConsultationTypes: function() {
    return this.consultationTypes || [];
  },

  /**
   * Update consultation types
   * @param {Array} consultationTypes 
   * @returns {Promise<Object>}
   */
  updateConsultationTypes: function(consultationTypes) {
    this.consultationTypes = consultationTypes;
    return this.save();
  },

  /**
   * Get special services
   * @returns {Array}
   */
  getSpecialServices: function() {
    return this.specialServices || [];
  },

  /**
   * Add special service
   * @param {Object} service 
   * @returns {Promise<Object>}
   */
  addSpecialService: function(service) {
    if (!this.specialServices) {
      this.specialServices = [];
    }
    this.specialServices.push(service);
    return this.save();
  },

  /**
   * Remove special service
   * @param {string} serviceName 
   * @returns {Promise<Object>}
   */
  removeSpecialService: function(serviceName) {
    if (this.specialServices) {
      this.specialServices = this.specialServices.filter(
        service => service.service !== serviceName
      );
    }
    return this.save();
  }
};
