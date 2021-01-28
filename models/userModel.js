const mongoose = require ('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema ({
    name: {
        type: 'String',
        required: [true, 'Please enter a name']
    },
    email:{ 
        type: 'String',
        required: [true, 'Please provide your mail'],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'Please provide a valid email']
    },
    photo: String,

    password: {
        type: 'String',
        required: [true, 'Please provide a password'],
        minlength: 8
    },
    passwordConfirm: {
        type: 'String',
        required: [true, 'Please confirm your password'],
        validate:{
            //"this" only works on create and SAVE!!!
            validator: function(el) {
                return el === this.password;
            },
            message: 'Passwords are not the same'
        }
    }
});

userSchema.pre('save', function (next) {
    //Only run this fucntion if password was modified
    if(!this.isModified('password')) 
     return next();

     //Hash the password with cost of 12
    this.password =  await bycrypt.hash(this.password, 12);

    //Delete the password confirm
    this.passwordComfirm = undefined;
    next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;

//name, email, photo, password, passwordConfirm