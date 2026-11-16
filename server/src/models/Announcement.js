import mongoose from 'mongoose';

const { Schema } = mongoose;

const AnnouncementSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      enum: ['FESTIVAL', 'PUJA_ALERT', 'MUHURAT', 'TEMPLE_NOTICE'],
      default: 'FESTIVAL',
    },
    priority: {
      type: String,
      enum: ['NORMAL', 'HIGH', 'URGENT'],
      default: 'NORMAL',
    },
    actionType: {
      type: String,
      enum: ['PUJAS', 'STORE', 'KUNDLI', 'NONE'],
      default: 'NONE',
    },
    actionRef: {
      type: String,
      default: '',
    },
    actionLabel: {
      type: String,
      default: 'View Details',
    },
    startsOn: {
      type: String, // YYYY-MM-DD
      default: '',
    },
    endsOn: {
      type: String, // YYYY-MM-DD
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  { timestamps: true }
);

export const Announcement =
  mongoose.models.Announcement || mongoose.model('Announcement', AnnouncementSchema);

