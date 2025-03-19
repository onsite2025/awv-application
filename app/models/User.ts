import mongoose, { Schema, model, models } from 'mongoose';

// Define healthcare-specific user roles
export enum UserRole {
  ADMIN = 'ADMIN',             // System administrators
  PROVIDER = 'PROVIDER',       // Doctors, nurses, practitioners
  STAFF = 'STAFF',             // Office/admin staff
  PATIENT = 'PATIENT',         // Patient users
  BILLING = 'BILLING',         // Billing department
  RESEARCHER = 'RESEARCHER'    // Research personnel (limited access)
}

// User schema
const UserSchema = new Schema({
  firebaseUid: { 
    type: String, 
    required: true, 
    unique: true 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true 
  },
  displayName: String,
  photoURL: String,
  // Update role field to use the enum values
  role: { 
    type: String, 
    enum: Object.values(UserRole),
    default: UserRole.PROVIDER
  },
  // Add additional healthcare-specific fields
  specialty: String,
  organization: String,
  phoneNumber: String,
  npi: String,  // National Provider Identifier
  licenseNumber: String,
  licenseState: String,
  // Track account status
  isActive: {
    type: Boolean,
    default: true
  },
  // Track user permissions
  permissions: {
    manageUsers: { type: Boolean, default: false },
    manageTemplates: { type: Boolean, default: false },
    viewReports: { type: Boolean, default: false },
    createVisits: { type: Boolean, default: true },
    editVisits: { type: Boolean, default: true },
    deleteVisits: { type: Boolean, default: false },
    managePatients: { type: Boolean, default: true }
  },
  // Audit and metadata fields
  metadata: {
    lastLogin: Date,
    createdAt: Date,
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    lastUpdated: Date,
    lastUpdatedBy: { type: Schema.Types.ObjectId, ref: 'User' }
  },
  settings: {
    theme: { type: String, default: 'light' },
    notifications: {
      email: { type: Boolean, default: true },
      inApp: { type: Boolean, default: true },
      sms: { type: Boolean, default: false }
    },
    display: {
      compactView: { type: Boolean, default: false },
      hideCompleted: { type: Boolean, default: false },
      showTutorials: { type: Boolean, default: true }
    }
  }
}, {
  timestamps: true
});

// Only create indexes on the server side
if (typeof window === 'undefined') {
  // Indexes for quick lookups
  UserSchema.index({ firebaseUid: 1 });
  UserSchema.index({ email: 1 });
  UserSchema.index({ role: 1 });
  UserSchema.index({ organization: 1 });
}

// Helper method to check permissions
UserSchema.methods.hasPermission = function(permission) {
  if (this.role === UserRole.ADMIN) return true; // Admins have all permissions
  return this.permissions && this.permissions[permission] === true;
};

// Create the model only on the server side
const User = (typeof window === 'undefined' && models.User) || 
  (typeof window === 'undefined' && model('User', UserSchema));

export default User; 