import mongoose, { Schema, model, models } from 'mongoose';

// Recommendation Schema
const RecommendationSchema = new Schema({
  id: { type: String, required: true },
  text: { type: String, required: true },
  order: { type: Number, default: 0 }
});

// Option Schema
const OptionSchema = new Schema({
  id: { type: String, required: true },
  text: { type: String, required: true },
  value: { type: String, required: true },
  order: { type: Number, default: 0 },
  recommendations: [RecommendationSchema]
});

// Skip Logic Condition Schema
const SkipLogicConditionSchema = new Schema({
  questionId: { type: String, required: true },
  operator: { type: String, required: true },
  value: { type: String }
});

// Skip Logic Rule Schema
const SkipLogicRuleSchema = new Schema({
  id: { type: String, required: true },
  condition: { type: SkipLogicConditionSchema, required: true },
  action: { type: String, enum: ['SHOW', 'HIDE'], default: 'HIDE' },
  targetType: { type: String, enum: ['QUESTION', 'SECTION'], default: 'QUESTION' },
  targetSectionId: { type: String }
});

// Scale Config Schema
const ScaleConfigSchema = new Schema({
  min: { type: Number, required: true, default: 0 },
  max: { type: Number, required: true, default: 10 },
  step: { type: Number, required: true, default: 1 },
  labels: {
    min: { type: String, required: true },
    max: { type: String, required: true }
  }
});

// Matrix Config Schema
const MatrixConfigSchema = new Schema({
  rows: [{ type: String }],
  columns: [{ type: String }],
  allowMultiple: { type: Boolean, default: false }
});

// Vital Signs Field Schema
const VitalSignsFieldSchema = new Schema({
  type: { type: String, required: true },
  unit: { type: String, required: true },
  min: { type: Number },
  max: { type: Number },
  required: { type: Boolean, default: true }
});

// Vital Signs Config Schema
const VitalSignsConfigSchema = new Schema({
  fields: [VitalSignsFieldSchema]
});

// Scoring Scale Option Schema
const ScoringScaleOptionSchema = new Schema({
  value: { type: Number, required: true },
  label: { type: String, required: true }
});

// Scoring Scale Config Schema
const ScoringScaleConfigSchema = new Schema({
  options: [ScoringScaleOptionSchema]
});

// Question schema
const QuestionSchema = new Schema({
  id: { type: String, required: true },
  text: { type: String, required: true },
  type: { type: String, required: true },
  order: { type: Number, default: 0 },
  options: [OptionSchema],
  skipLogicRules: [SkipLogicRuleSchema],
  defaultRecommendations: [RecommendationSchema],
  required: { type: Boolean, default: false },
  scaleConfig: { type: ScaleConfigSchema },
  matrixConfig: { type: MatrixConfigSchema },
  vitalSignsConfig: { type: VitalSignsConfigSchema },
  scoringScaleConfig: { type: ScoringScaleConfigSchema }
}, { _id: false });

// Section schema
const SectionSchema = new Schema({
  id: { type: String, required: true },
  title: { type: String, required: true },
  description: String,
  questions: [QuestionSchema]
}, { _id: false });

// Template schema
const TemplateSchema = new Schema({
  name: { type: String, required: true },
  description: String,
  isActive: { type: Boolean, default: true },
  userId: { type: String, sparse: true },
  sections: [SectionSchema],
  sectionCount: { type: Number, default: 0 },
  questionCount: { type: Number, default: 0 },
  isPublic: { type: Boolean, default: false },
}, { 
  timestamps: true 
});

// Only create indexes on the server side
if (typeof window === 'undefined') {
  // Indexes
  TemplateSchema.index({ userId: 1 });
  TemplateSchema.index({ name: 1 });
  TemplateSchema.index({ updatedAt: -1 });
}

// Helper methods
TemplateSchema.pre('save', function(next) {
  // Update section and question counts before saving
  if (this.sections) {
    this.sectionCount = this.sections.length;
    this.questionCount = this.sections.reduce(
      (count, section) => count + (section.questions?.length || 0), 
      0
    );
  }
  this.updatedAt = new Date();
  next();
});

// Create the model
// Using a strict check for the server environment
const Template = (typeof window === 'undefined' && models.Template) || 
  (typeof window === 'undefined' && model('Template', TemplateSchema));

export default Template; 