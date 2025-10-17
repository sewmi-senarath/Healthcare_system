/**
 * DoctorSchema - Core schema definition for Doctor model
 * Following Single Responsibility Principle - Only handles schema definition
 */

export const doctorSchemaDefinition = {
  specialization: {
    type: String,
    required: true,
    enum: [
      'cardiology', 'neurology', 'oncology', 'pediatrics', 'surgery',
      'orthopedics', 'dermatology', 'psychiatry', 'radiology', 'anesthesiology',
      'emergency_medicine', 'family_medicine', 'internal_medicine', 'gynecology',
      'urology', 'ophthalmology', 'otolaryngology', 'pathology', 'pulmonology'
    ]
  },
  availability: {
    monday: [{ start: String, end: String }],
    tuesday: [{ start: String, end: String }],
    wednesday: [{ start: String, end: String }],
    thursday: [{ start: String, end: String }],
    friday: [{ start: String, end: String }],
    saturday: [{ start: String, end: String }],
    sunday: [{ start: String, end: String }]
  },
  assignedHospitalID: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  whatsApp: {
    type: String
  },
  preferredCommunicationMethod: {
    type: String,
    enum: ['email', 'phone', 'whatsapp', 'sms'],
    default: 'email'
  },
  licenseNumber: {
    type: String,
    required: true,
    unique: true
  },
  experience: {
    type: Number,
    required: true,
    min: 0
  },
  education: {
    medicalDegree: {
      degree: String,
      university: String,
      graduationYear: Number
    },
    residency: {
      specialty: String,
      hospital: String,
      duration: Number
    },
    fellowship: {
      specialty: String,
      hospital: String,
      duration: Number
    },
    certifications: [{
      name: String,
      issuer: String,
      issueDate: Date,
      expiryDate: Date
    }]
  },
  consultationFee: {
    type: Number,
    required: true,
    min: 0
  },
  maxPatientsPerDay: {
    type: Number,
    default: 10,
    min: 1,
    max: 50
  },
  currentPatientCount: {
    type: Number,
    default: 0,
    min: 0
  },
  ratings: [{
    patientId: String,
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    review: String,
    date: {
      type: Date,
      default: Date.now
    }
  }],
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalRatings: {
    type: Number,
    default: 0
  },
  profilePicture: {
    type: String,
    default: ''
  },
  bio: {
    type: String,
    maxlength: 1000
  },
  languages: [{
    type: String,
    enum: ['english', 'spanish', 'french', 'german', 'italian', 'portuguese', 'chinese', 'japanese', 'arabic', 'hindi']
  }],
  emergencyContact: {
    name: String,
    relationship: String,
    phone: String,
    email: String
  },
  insuranceAccepted: [{
    provider: String,
    planType: String
  }],
  hospitalAffiliations: [{
    hospitalId: String,
    hospitalName: String,
    position: String,
    startDate: Date,
    endDate: Date
  }],
  researchInterests: [String],
  publications: [{
    title: String,
    journal: String,
    publicationDate: Date,
    authors: [String],
    doi: String
  }],
  awards: [{
    name: String,
    organization: String,
    year: Number,
    description: String
  }],
  professionalMemberships: [{
    organization: String,
    membershipType: String,
    membershipNumber: String,
    startDate: Date,
    endDate: Date
  }],
  officeHours: {
    monday: { start: String, end: String, isAvailable: Boolean },
    tuesday: { start: String, end: String, isAvailable: Boolean },
    wednesday: { start: String, end: String, isAvailable: Boolean },
    thursday: { start: String, end: String, isAvailable: Boolean },
    friday: { start: String, end: String, isAvailable: Boolean },
    saturday: { start: String, end: String, isAvailable: Boolean },
    sunday: { start: String, end: String, isAvailable: Boolean }
  },
  consultationTypes: [{
    type: {
      type: String,
      enum: ['in_person', 'video_call', 'phone_call', 'chat']
    },
    fee: Number,
    duration: Number, // in minutes
    isAvailable: Boolean
  }],
  patientTypes: [{
    type: {
      type: String,
      enum: ['adult', 'pediatric', 'geriatric', 'all']
    }
  }],
  specialServices: [{
    service: String,
    description: String,
    additionalFee: Number
  }],
  emergencyAvailability: {
    isAvailable: Boolean,
    contactMethod: String,
    responseTime: Number // in minutes
  }
};
