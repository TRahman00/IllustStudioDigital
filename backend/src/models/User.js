import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 8 },
    role: { type: String, enum: ['artist', 'admin'], default: 'artist' },
    status: { type: String, enum: ['active', 'suspended'], default: 'active' },
    plan: { type: String, enum: ['free', 'premium'], default: 'free' },
    loyaltyPoints: { type: Number, default: 50 }, // Added default welcome points
    handle: { type: String, unique: true, sparse: true, trim: true, lowercase: true },
    bio: { type: String, default: '', maxlength: 280 },
    profilePicture: { type: String, default: '' },
    // Google Drive Connectivity
    googleTokens: {
      access_token: String,
      refresh_token: String,
      expiry_date: Number,
    },
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.toSafeObject = function () {
  const { _id, name, email, role, status, plan, loyaltyPoints, createdAt } = this;
  return { 
    id: _id, name, email, role, status, plan, loyaltyPoints, createdAt,
    handle: this.handle, bio: this.bio, profilePicture: this.profilePicture,
    googleConnected: !!(this.googleTokens && this.googleTokens.access_token)
  };
};

export default mongoose.model('User', userSchema);