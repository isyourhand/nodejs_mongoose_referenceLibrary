const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

// name,email,photo just gonna be a string.
// password, passwordConfirm

const userShema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please tell us your name.'],
        trim: true,
        maxlength: [
            25,
            'A user name must have less or equal than 15 characters.',
        ],
        minlength: [3, 'A user name must have more or equal than 4 character.'],
    },
    email: {
        type: String,
        required: [true, 'Please provide your email.'],
        // unique: true,
        lowercase: true,
        validator: [validator.isEmail, 'Please provide a valid email.'],
    },
    photo: {
        type: String,
        default: 'default.jpg',
    },
    role: {
        type: String,
        enum: ['user', 'guide', 'lead-guide', 'admin'],
        default: 'user',
    },
    password: {
        type: String,
        required: [true, 'Please provide a password.'],
        minlength: 8,
        select: false,
    },
    passwordConfirm: {
        type: String,
        required: [true, 'Please confirm your password.'],
        // When we used the custom validator on the model This only works on SAVE OR CREATE!!
        validate: {
            validator: function (el) {
                return el === this.password;
            },
            message: 'Passwords are not the same!',
        },
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    active: {
        type: Boolean,
        default: true,
        select: false,
    },
});

// this middleware function is gonna be happened between the moment that we receive that data and the moment where it's actually presisted to the database.
userShema.pre('save', async function (next) {
    if (!this.isModified('password')) return next(); // isModified 是否有被修改。
    console.log('password is not modified');
    this.password = await bcrypt.hash(this.password, 12); // this hash() is asynchronous version.
    this.passwordConfirm = undefined;

    next();
});

userShema.pre('save', function (next) {
    if (!this.isModified('password') || this.isNew) return next();

    this.passwordChangedAt = Date.now() - 1000;
    next();
});

// "/^find/" means start with find
userShema.pre(/^find/, function (next) {
    // this points to the current ducument
    this.find({ active: { $ne: false } });
    next();
});

// Instance Method: a method that is gonna be available on all documents of a certain collection.
/*
    这段代码定义了一个名为 correctPassword 的方法，它被添加到了 userSchema 对象的 methods 属性中。
    这个方法可以在 userSchema 对象所创建的用户模型实例中被调用，用于验证用户输入的密码是否正确。
*/
userShema.methods.correctPassword = async function (
    candidatePassword,
    userPassword
) {
    // this.password will not be available because I set 'select: false' in userSchema.
    return await bcrypt.compare(candidatePassword, userPassword);
};

userShema.methods.changedPasswordAfter = function (JWTTimestamp) {
    // In instance Method the 'this' keyword always points to the current document.
    if (this.passwordChangedAt) {
        const changedTimestamp = parseInt(
            this.passwordChangedAt.getTime() / 1000,
            10
        ); //将一个日期对象转换为 Unix 时间戳,为了将毫秒转换成秒将获取到的时间戳除以 1000，第二个参数表示进制，这里选择十进制。

        return JWTTimestamp < changedTimestamp;
    }
    return false;
};

userShema.methods.createPasswordResetToken = function () {
    const resetToken = crypto.randomBytes(32).toString('hex');

    // 如果说用户自己要修改密码，并没有忘记密码。我该怎么处理呢？我还需要这个resettoken吗

    // createHash('sha256'): create a SHA-256 hash object.
    // update(resetToken): update the hash object with the contents of the resetToken string.
    // digest('hex'): generates the final hash value as a hexadecimal string.
    this.passwordResetToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    console.log(
        { resetToken },
        this.passwordResetToken,
        new Date(Date.now() + 10 * 60 * 1000).toLocaleString()
    );

    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

    return resetToken;
};

const User = mongoose.model('User', userShema);

module.exports = User;
