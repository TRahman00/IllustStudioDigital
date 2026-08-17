import mongoose from 'mongoose';

// Define the schema for Users (Artists & Admins)
const userSchema = new mongoose.Schema({
  // Registration Step 1: Basic Information
  name: { 
    type: String, 
    required: [true, 'Name is required'], 
    trim: true 
  },
  email: { 
    type: String, 
    required: [true, 'Email is required'], 
    unique: true, 
    lowercase: true,
    trim: true
  },
  password: { 
    type: String, 
    required: [true, 'Password is required'],
    minlength: 6 
  },
  
  // Registration Step 2: Verification Details
  phone: { 
    type: String, 
    required: [true, 'Phone number is required'] 
  },
  location: { 
    type: String, 
    required: [true, 'Location is required'] 
  },
  
  // Account Role and Verification Status
  role: { 
    type: String, 
    enum: ['artist', 'admin'], 
    default: 'artist' 
  },
  status: { 
    type: String, 
    enum: ['pending', 'active', 'suspended'], 
    default: 'pending' // New artists remain 'pending' until verified by an Admin
  }
}, { timestamps: true }); // Automatically manages createdAt and updatedAt timestamps

const User = mongoose.model('User', userSchema);

export default User;