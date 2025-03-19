import mongoose, { Schema, model, models } from 'mongoose';

// Define the Patient schema
const PatientSchema = new Schema({
  name: { 
    type: String, 
    required: true 
  },
  dateOfBirth: { 
    type: Date, 
    required: true 
  },
  gender: { 
    type: String, 
    enum: ['Male', 'Female', 'Other', 'Prefer not to say'],
    required: true 
  },
  email: { 
    type: String,
    match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address'] 
  },
  phone: { 
    type: String 
  },
  address: { 
    type: String 
  },
  mrn: { 
    type: String,
    required: true,
    unique: true
  },
  insuranceProvider: { 
    type: String 
  },
  insuranceNumber: { 
    type: String 
  },
  allergies: [{ 
    type: String 
  }],
  medications: [{ 
    type: String 
  }],
  notes: { 
    type: String 
  },
  userId: {
    type: String,
    required: true
  },
  lastVisitDate: {
    type: Date
  }
}, {
  timestamps: true // Adds createdAt and updatedAt
});

// Create or get the model
const Patient = models.Patient || model('Patient', PatientSchema);

export default Patient; 