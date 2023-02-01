const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const userSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Please tell us your name"],
            minLength: [5, "name should be longer than 5 characters"],
            maxLength: [50, "name should not be longer than 50 characters"],
        },
        email: {
            type: String,
            unique: true,
            lowercase: true,
            required: [true, "Please tell us your email"],
            validate: [validator.isEmail, `invalid email ({VALUE})`],
        },
        password: {
            type: String,
            required: [true, "Please privide a password"],
            minLength: [6, "name should be longer than 6 characters"],
            maxLength: [50, "name should not be longer than 50 characters"],
            select: false, // this is not working on create & save
        },
        passwordConfirm: {
            type: String,
            required: [true, "Please privide a confirm password"],
            validate: {
                // this validate only works on CREATE and SAVE!!
                // because of this reason, we only use save when updating a user
                validator: function (confirm) {
                    return confirm === this.password;
                },
                message: "ConfirmPassword does not match Password",
            },
        },
        passwordChangedAt: Date,
        role: {
            type: String,
            enum: {
                values: ["user", "guide", "lead-guide", "admin"],
                message: "Invalid role",
            },
            default: "user",
        },
        photo: {
            type: String,
            required: false,
        },
        passwordResetToken: String,
        passwordResetExpires: Date,        
    },
    {
        timestamps: true,
        toJSON: {
            transform: function (doc, ret) {
                delete ret.password;
            },
        },
    }
);

userSchema.pre("save", async function (next) {
    if (this.isModified("password")) {
        // two way to hash: with/without salt
        // commonly hash the password with cost of 12
        this.password = await bcrypt.hash(this.password, 12);
        // delete passwordConfirm field
        this.passwordConfirm = undefined;
    }

    next();
});

userSchema.pre("save", async function (next) {
    if (!this.isModified("password") || this.isNew) { return next(); }

    this.passwordChangedAt = Date.now() - 1000; // because signing a token is earlier than user.save()
    next()
});

// create an instance method: a method available among all documents of a certain collection
// candidatePassword is the plain text version of the password
// userPassword is the hashed version of the password
// return true if the passwords match
userSchema.methods.correctPassword = async function (
    candidatePassword,
    userPassword
) {
    return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changePasswordAfter = function (JWTTimestamp) {
    if (this.passwordChangedAt) {
        console.log("JWTTimestamp", JWTTimestamp);
        const changedTimestamp = parseInt(
            this.passwordChangedAt.getTime() / 1000
        );
        console.log("changedTimestamp", changedTimestamp);
        return JWTTimestamp < changedTimestamp;
    }

    return false; // password hasn't changed
};

userSchema.methods.createPasswordResetToken = function () {
    const resetToken = crypto.randomBytes(32).toString("hex");

    this.passwordResetToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes in ms

    console.log({resetToken, passwordResetToken: this.passwordResetToken});

    return resetToken;
}

const User = mongoose.model("User", userSchema);
module.exports = User;
