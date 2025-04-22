const mongoose = require('mongoose');

const UrlSchema = new mongoose.Schema({
  shortCode: { 
    type: String, 
    unique: true,
    required: true
  },
  originalUrl: { 
    type: String, 
    required: true,
    validate: {
      validator: function(v) {
        return /^https?:\/\/.+\..+/.test(v);
      },
      message: props => `${props.value} is not a valid URL!`
    }
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  clicks: {
    type: Number,
    default: 0
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  expiresAt: {
    type: Date,
    validate: {
      validator: function(v) {
        // Ensure expiration date is in the future
        return v > new Date();
      },
      message: 'Expiration date must be in the future'
    }
  }
});

// Pre-save middleware to set default expiration if not provided
UrlSchema.pre('save', function(next) {
  if (!this.expiresAt) {
    // Default to 30 days from creation
    this.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  }
  next();
});

module.exports = mongoose.model('Url', UrlSchema);
