const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String, required: true, unique: true, trim: true
        },
        email: { 
            type: String, required: true, unique: true, lowercase: true, trim: true
         },
        passwordHash: { 
            type: String, required: true 
        },
        displayName: { 
            type: String, default: 'User' 
        },
        // avatarUrl: { type: String, default: '' }
    },
    { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);