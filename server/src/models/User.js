import mongoose from 'mongoose';

const { Schema } = mongoose;

const FamilyMemberSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    relation: { type: String, required: true, trim: true },
    gotra: { type: String, required: true, trim: true },
    rashi: { type: String, trim: true },
    nakshatra: { type: String, trim: true },
  },
  { _id: true, timestamps: true }
);

const UserSchema = new Schema(
  {
    phone: {
      type: String,
      trim: true,
      sparse: true,
      index: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      sparse: true,
      index: true,
    },
    password: {
      type: String,
    },
    authProvider: {
      type: String,
      enum: ['phone', 'email'],
      default: 'phone',
    },
    name: {
      type: String,
      required: true,
      trim: true,
      default: 'धर्मनिष्ठ यजमान',
    },
    gotra: {
      type: String,
      required: true,
      trim: true,
      default: 'Kashyap Gotra',
    },
    kuldevi: {
      type: String,
      trim: true,
      default: 'Mata Shakambhari Devi',
    },
    city: {
      type: String,
      trim: true,
      default: 'Varanasi (Kashi)',
    },
    punyaPoints: {
      type: Number,
      default: 1080,
      min: 0,
    },
    isVip: {
      type: Boolean,
      default: false,
    },
    familyMembers: {
      type: [FamilyMemberSchema],
      default: [
        {
          name: 'Sunita Sharma',
          relation: 'धर्मपत्नी (Spouse)',
          gotra: 'Kashyap Gotra',
          rashi: 'Karka (Cancer)',
          nakshatra: 'Pushya',
        },
        {
          name: 'Aarav Sharma',
          relation: 'पुत्र (Son)',
          gotra: 'Kashyap Gotra',
          rashi: 'Simha (Leo)',
          nakshatra: 'Magha',
        },
        {
          name: 'Pt. Ramprasad Sharma',
          relation: 'पिताश्री (Father)',
          gotra: 'Kashyap Gotra',
          rashi: 'Dhanu (Sagittarius)',
          nakshatra: 'Moola',
        },
      ],
    },
    otp: {
      code: { type: String },
      expiresAt: { type: Date },
    },
  },
  {
    timestamps: true,
  }
);

export const User = mongoose.models.User || mongoose.model('User', UserSchema);
