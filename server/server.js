const express = require('express');
const bodyParser = require('body-parser');

const mongoose = require('./db/mongoose');
const {User} = require('./models/user');
const {Todo} = require('./models/todo');

let app = express();

app.use(bodyParser.json());

app.post('/todos', (req, res) => {
    let newTodo = new Todo({
        text: req.body.text
    });

    newTodo.save().then((success) => {
        res.send(success);
    }, (err) => {
        res.status(400).send(err);
    });
});

app.listen(3000, () => {
    console.log('Started on port 3000');

});