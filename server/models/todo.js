const mongoose = require('mongoose');

let schema = new mongoose.Schema({
    text: {
        type: String,
        required: true
    },
    completed: {
        type:Boolean,
        default: false
    },
    completedAt: {
        type: Number,
        default: null
    }
});

const Todo = mongoose.model('Todo', schema);

module.exports = {
    Todo
};