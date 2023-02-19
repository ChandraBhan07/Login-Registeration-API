const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt')

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please tell us your name.'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Please provide your email address.'],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'Please provide a valid email.']
    },
    password: {
        type: String,
        required: [true, 'Please provide your password.'],
        minlength: [6, 'Password should contain atleast 6 characters.'],
        maxlength: [16, 'Password should not contain more than 16 characters.'],
        select: false
    },
    passwordConfirm: {
        type: String,
        required: [true, 'Please confirm your password.'],
        validate: {
            // This validator will only word for .create or .save 
            validator: function (val) {
                return val === this.password
            },
            message: 'Both passwords does not match.'
        }
    },
    profileImg: {
        type: String
    },
    phone: {
        type: String,
        required: [true, 'Please provide your phone number with contry code.']
    },
    dob: {
        type: Date,
        required: [true, 'Please provide your date of birth.']
    },
    createdAt: {
        type: Date,
        default: Date.now(),
        select: false
    }
});

// encrypt password
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 14);
    this.passwordConfirm = undefined;
    next();
});

// check password
userSchema.methods.checkPassword = async (inpPass, origPass) => {
    return await bcrypt.compare(inpPass, origPass);
}

module.exports = new mongoose.model('User', userSchema);