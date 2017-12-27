const _ = require("lodash");
const express = require("express");
const bodyParser = require("body-parser");
const { ObjectId } = require("mongodb");

const { mongoose } = require("./db/mongoose");
const { User } = require("./models/user");
const { Todo } = require("./models/todo");

const port = process.env.PORT || 3000;
let app = express();

app.use(bodyParser.json());

app.post("/todos", (req, res) => {
  let newTodo = new Todo({
    text: req.body.text
  });

  newTodo.save().then(
    (success) => {
      res.send(success);
    },
    (err) => {
      res.status(400).send(err);
    }
  );
});

app.get("/todos", (req, res) => {
  Todo.find().then(
    (todos) => {
      res.send({
        todos
      });
    },
    (err) => {
      res.status(400).send(err);
    }
  );
});

app.get("/todos/:id", (req, res) => {
  let id = req.params.id;
  if (!ObjectId.isValid(id)) {
    return res.status(404).send("Not valid id");
  }

  Todo.findById(id)
    .then((todo) => {
      if (!todo) {
        return res.status(404).send(`Todo doesn't exist`);
      }
      res.status(200).send({
        todo
      });
    })
    .catch((e) => res.status(400).send(e));
});

app.delete("/todos/:id", (req, res) => {
  let id = req.params.id;

  if (!ObjectId.isValid(id)) {
    return res.status(404).send("Not valid id");
  }

  Todo.findByIdAndRemove(id)
    .then((todo) => {
      if (!todo) {
        return res.status(404).send(`Todo doesn't exist`);
      }
      res.status(200).send({
        todo
      });
    })
    .catch((e) => res.status(400).send(e));
});

app.patch("/todos/:id", (req, res) => {
  let id = req.params.id;
  let body = _.pick(req.body, ["text", "completed", "completedAt"]);

  if (!ObjectId.isValid(id)) {
    return res.status(404).send("Not valid id");
  }

  if (_.isBoolean(body.completed) && body.completed) {
    body.completedAt = new Date().getTime();
  } else {
    body.completed = false;
    body.completedAt = null;
  }
  Todo.findByIdAndUpdate(id, { $set: body }, { new: true })
    .then((todo) => {
      if (!todo) {
        return res.status(404).send();
      }

      res.send({ todo });
    })
    .catch((err) => {
      res.status(400).send(err);
    });
});

app.listen(port, () => {
  console.log(`Started on port ${port}`);
});

module.exports = {
  app
};
