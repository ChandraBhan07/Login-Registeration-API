const catchAsync = require('../utils/catchAsync');
const User = require('../models/userModel');
const multer = require('multer');
const sharp = require('sharp');

const multerStorage = multer.memoryStorage();
const multerFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image')) cb(null, true);
    else cb(new AppError('Not an image, please upload images only.', 400), false);
};

const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter
});
exports.uploadUserImage = upload.single('profileImg');

exports.resizeImage = catchAsync(async (req, res, next) => {
    if (!req.file) return next();

    req.file.filename = `user_${req.user.id}_${Date.now()}.jpeg`;

    await sharp(req.file.buffer)
        .resize(500, 500)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/users/${req.file.filename} `);

    req.body.profileImg = req.file.filename;
    next();
});

exports.searchUser = catchAsync(async (req, res, next) => {
    const query = req.query;
    let nameObj = {};
    if (query.name) {
        delete query.name;
        nameObj = { name: /[query.name]/ }
    }
    const users = await User.find({ ...query, ...nameObj });

    res.status(200).json({
        count: users.length,
        data: users
    });
})