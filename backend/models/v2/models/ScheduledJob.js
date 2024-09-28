import mongoose from 'mongoose';

const scheduledJobSchema = new mongoose.Schema({
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    unique: true,
  },
  isActive: { type: Boolean, default: true },
  scheduledTime: { type: Date, required: true },
});

const ScheduledJob = mongoose.model('ScheduledJob', scheduledJobSchema);

export default ScheduledJob;
