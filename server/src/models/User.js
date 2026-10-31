import mongoose from 'mongoose';

const { Schema } = mongoose;

const FamilyMemberSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    relation: { type: String, required: true, trim: true, maxlength: 40 },
    gotra: { type: String, trim: true, maxlength: 60, default: '' },
    dateOfBirth: { type: String, trim: true, default: '' },
    rashi: { type: String, trim: true, default: '' },
    nakshatra: { type: String, trim: true, default: '' },
  },
  { timestamps: true }
);

const UserSchema = new Schema(
  {
    phone: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true },
    password: { type: String, select: false },
    authProvider: { type: String, enum: ['phone', 'email'], required: true },
    emailVerified: { type: Boolean, default: false },
    avatarUrl: { type: String, trim: true, default: '' },
    name: { type: String, trim: true, maxlength: 80, default: '' },
    gender: { type: String, enum: ['MALE', 'FEMALE', 'OTHER', ''], default: '' },
    dateOfBirth: { type: String, trim: true, default: '' },
    timeOfBirth: { type: String, trim: true, default: '' },
    placeOfBirth: { type: String, trim: true, maxlength: 120, default: '' },
    gotra: { type: String, trim: true, maxlength: 60, default: '' },
    rashi: { type: String, trim: true, maxlength: 40, default: '' },
    city: { type: String, trim: true, maxlength: 80, default: '' },
    state: { type: String, trim: true, maxlength: 80, default: '' },
    address: { type: String, trim: true, maxlength: 300, default: '' },
    pinCode: { type: String, trim: true, default: '' },
    profileCompleted: { type: Boolean, default: false, index: true },
    familyMembers: { type: [FamilyMemberSchema], default: [] },
    isBlocked: { type: Boolean, default: false },
    lastLoginAt: { type: Date },
  },
  { timestamps: true }
);

UserSchema.index({ phone: 1 }, { unique: true, partialFilterExpression: { phone: { $type: 'string' } } });
UserSchema.index({ email: 1 }, { unique: true, partialFilterExpression: { email: { $type: 'string' } } });

UserSchema.methods.toPublic = function toPublic() {
  return {
    id: this._id.toString(),
    phone: this.phone || '',
    email: this.email || '',
    authProvider: this.authProvider,
    emailVerified: this.emailVerified,
    avatarUrl: this.avatarUrl || '',
    name: this.name,
    gender: this.gender,
    dateOfBirth: this.dateOfBirth,
    timeOfBirth: this.timeOfBirth,
    placeOfBirth: this.placeOfBirth,
    gotra: this.gotra,
    rashi: this.rashi,
    city: this.city,
    state: this.state,
    address: this.address,
    pinCode: this.pinCode,
    profileCompleted: this.profileCompleted,
    familyMembers: (this.familyMembers || []).map((m) => ({
      id: m._id.toString(),
      name: m.name,
      relation: m.relation,
      gotra: m.gotra,
      dateOfBirth: m.dateOfBirth,
      rashi: m.rashi,
      nakshatra: m.nakshatra,
    })),
    createdAt: this.createdAt,
  };
};

export const User = mongoose.models.User || mongoose.model('User', UserSchema);
