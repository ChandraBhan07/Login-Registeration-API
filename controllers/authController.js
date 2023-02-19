const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const { promisify } = require('util');

const signToken = id => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });
}

const createSendToken = (user, statusCode, res) => {
    const token = signToken(user._id);

    let resObj = {
        status: 'success',
        token
    };

    if (statusCode === 201) resObj.data = { user };
    user.password = undefined;

    res.status(statusCode).json(resObj);
}

exports.signup = catchAsync(async (req, res, next) => {
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm,
        phone: req.body.phone,
        dob: req.body.dob
    });

    newUser.password = undefined;
    createSendToken(newUser, 201, res)
});

exports.login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password) return next(new AppError('Email and password both are required'));

    const user = await User.findOne({ email }).select('+password');
    if (!user || !user.password) return next(new AppError('Incorrect credentials', 400));

    const result = await user.checkPassword(password, user.password);
    if (!result) return next(new AppError('Incorrect credentials', 400));
    createSendToken(user, 200, res);
});

exports.protect = catchAsync(async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }
    if (!token) return next(new AppError('Please login to get access.', 401));

    // 2. Verify token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    // 3. Get the user from id
    const freshUser = await User.findById(decoded.id);
    if (!freshUser) return next(new AppError('The user belonging to this token dose not exists', 401));

    req.user = freshUser;
    next();
});

// it is protected so it contains req.user
exports.getProfile = (req, res, next) => {
    return res.status(200).json({
        status: 'success',
        data: {
            user: req.user
        }
    });
}

exports.updateProfile = catchAsync(async (req, res, next) => {

    // 1. Update user document
    if (!Object.keys(req.body).length) return next(new AppError('Please provide a field to be updated.', 400));

    const filteredBody = {};
    if (req.file) filteredBody.profileImg = req.file.filename;

    const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
        new: true,
        runValidators: true
    });

    res.status(200).json({
        status: 'success',
        data: {
            user: updatedUser
        }
    });
});




