const multer = require('multer');
const AppError = require('../Utils/appError');
const catchAsync = require('../Utils/catchAsync');
const User = require('../models/userModel');
const factory = require('./handlerFactory');
const sharp = require('sharp');

// const multerStorage = multer.diskStorage({
//     // cb is callback function, it is a bit like the 'next' function in express
//     destination: (req, file, cb) => {
//         // the first argument is an error,if there has one, if not, then just null.
//         // the second argument is then the actual destination
//         cb(null, 'public/img/users');
//     },
//     filename: (req, file, cb) => {
//         // user-456a4sd6-2315315.jpeg
//         const ext = file.mimetype.split('/')[1];
//         cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
//     },
// });
const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image')) {
        cb(null, true);
    } else {
        cb(
            new AppError('Not an image! Please upload only images.', 400),
            false
        );
    }
};

const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter,
});

exports.uploadUserPhoto = upload.single('photo');

exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
    if (!req.file) return next();

    req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

    await sharp(req.file.buffer)
        .resize(500, 500)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/users/${req.file.filename}`);

    next();
});

const filterObj = (obj, ...allowedFilelds) => {
    // Loop through all thhe fields that are in the object,for
    // each allowed field,we create a new field in the newObj.
    const newObj = {};
    Object.keys(obj).forEach((el) => {
        if (allowedFilelds.includes(el)) newObj[el] = obj[el];
    });
    return newObj;
};

exports.getMe = (req, res, next) => {
    req.params.id = req.user.id;
    next();
};

exports.updateMe = catchAsync(async (req, res, next) => {
    // 1) Create error if user POSTs password data.
    if (req.body.password || req.body.passwordConfirm) {
        return next(
            new AppError(
                'This route is not for password updates.please use /updatePassword.',
                400
            )
        );
    }

    // 2) Filtered out unwanted fields name that are not allowed to be updated.
    // Use filteredBody to make the content of body only contain 'name','email'
    const filteredBody = filterObj(req.body, 'name', 'email');

    if (req.file) filteredBody.photo = req.file.filename;
    console.log(filteredBody);

    // 3) Update user document
    const updateuser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
        new: true,
        runValidators: true,
    }); // 'new:true' means it returns the new object instead of the old one.

    res.status(200).json({
        status: 'success',
        data: {
            user: updateuser,
        },
    });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
    await User.findByIdAndUpdate(req.user.id, { active: false });

    res.status(204).json({
        status: 'success',
        data: null,
    });
});

exports.createUser = (req, res) => {
    res.status(500).json({
        // Jsend格式
        status: 'error',
        message: 'This route is not defined! Please use /signup instead!',
    });
};

exports.getUser = factory.getOne(User);
exports.getAllUsers = factory.getAll(User);
// Do Not update passwords with this
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);
