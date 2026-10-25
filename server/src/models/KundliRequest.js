import mongoose from 'mongoose';

const { Schema } = mongoose;

const PersonBirthDetailsSchema = new Schema(
  {
    fullName: { type: String, required: true, trim: true },
    gender: { type: String, default: 'Male' },
    dateOfBirth: { type: String, required: true },
    timeOfBirth: { type: String, required: true },
    placeOfBirth: { type: String, required: true },
    gotra: { type: String, default: 'Kashyap' },
  },
  { _id: false }
);

const KundliRequestSchema = new Schema(
  {
    requestId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    user: { type: Schema.Types.Mixed, ref: 'User' },
    type: {
      type: String,
      enum: ['JANAM_KUNDLI', 'GUNA_MILAN', 'DOSHA_NIVARAN'],
      required: true,
      index: true,
    },
    primaryPerson: { type: PersonBirthDetailsSchema, required: true },
    partnerPerson: { type: PersonBirthDetailsSchema },
    selectedDosha: { type: String },
    specificConcerns: { type: String },
    assignedAcharya: {
      type: String,
      default: 'Pt. Vidyadhar Shastri (Sampurnanand Sanskrit Vishwavidyalaya, Kashi)',
    },
    status: {
      type: String,
      enum: ['SUBMITTED', 'UNDER_ANALYSIS', 'COMPLETED'],
      default: 'SUBMITTED',
      index: true,
    },
    analysisSummary: { type: String },
    remedySuggestions: [{ type: String }],
    pdfReportUrl: { type: String },
  },
  {
    timestamps: true,
  }
);

export const KundliRequest =
  mongoose.models.KundliRequest || mongoose.model('KundliRequest', KundliRequestSchema);
