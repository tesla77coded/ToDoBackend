import mongoose from 'mongoose';

const SubtaskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  done: { type: Boolean, default: false }
}, { _id: true });

const TaskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  subtasks: [SubtaskSchema],
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['in-progress', 'done', 'expired'], default: 'in-progress' },
  dueDate: { type: Date, default: null },
  completedAt: { type: Date, default: null },
  archived: { type: Boolean, default: false },
}, { timestamps: true });

TaskSchema.index({ owner: 1, status: 1, dueDate: 1 });
TaskSchema.index({ owner: 1, createdAt: -1 });

const Task = mongoose.model('Task', TaskSchema)

export default Task;
