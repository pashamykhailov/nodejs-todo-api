const mongoose = require('mongoose');

let users = new mongoose.Schema({
    email: {
        type: String,
        minlength: 1,
        trim: true,
        required: true
    }
});

let User = mongoose.model('User', users);

module.exports = {
    User
};