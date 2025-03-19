import mongoose, { Schema } from 'mongoose';

// Define the Visit schema
const VisitSchema = new Schema({
  patientId: {
    type: String,
    required: [true, 'Patient ID is required']
  },
  patientName: {
    type: String,
    required: [true, 'Patient name is required']
  },
  templateId: {
    type: String,
    required: [true, 'Template ID is required']
  },
  templateName: {
    type: String,
    required: [true, 'Template name is required']
  },
  date: {
    type: Date,
    required: [true, 'Visit date is required'],
    default: Date.now
  },
  status: {
    type: String,
    enum: ['scheduled', 'in-progress', 'completed', 'cancelled'],
    default: 'scheduled'
  },
  provider: {
    type: String,
    required: [true, 'Provider is required']
  },
  notes: {
    type: String
  },
  duration: {
    type: Number,
    min: 0
  },
  responses: {
    type: Object,
    default: {}
  },
  recommendations: [{
    text: String,
    source: String,
    linked: {
      type: Boolean,
      default: false
    }
  }],
  userId: {
    type: String,
    required: [true, 'User ID is required']
  }
}, {
  timestamps: true
});

// Create the model from the schema or use existing model
export const Visit = mongoose.models.Visit || mongoose.model('Visit', VisitSchema);

export default Visit; 