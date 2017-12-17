const {
    mongoose
} = require('./../server/db/mongoose');
const {
    Todo
} = require('./../server/models/todo');
const {
    User
} = require('./../server/models/user');

User.findById('5a3654fbe2dd2899030c0481').then((user) => {
    if (!user) {
        return console.log('user not found');
    }
    console.log('user one ', user);
}).catch(e => console.log('error ', e));