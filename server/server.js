require("./config/config");
const _ = require("lodash");
const express = require("express");
const bodyParser = require("body-parser");
const { ObjectId } = require("mongodb");

const { mongoose } = require("./db/mongoose");
const { User } = require("./models/user");
const { Todo } = require("./models/todo");
const { authenticate } = require("./middleware/authenticate");

const port = process.env.PORT;
let app = express();

app.use(bodyParser.json());

app.post("/todos", authenticate, (req, res) => {
  let newTodo = new Todo({
    text: req.body.text,
    _creator: req.user._id
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

app.get("/todos", authenticate, (req, res) => {
  Todo.find({
    _creator: req.user._id
  }).then(
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

app.get("/todos/:id", authenticate, (req, res) => {
  let id = req.params.id;
  if (!ObjectId.isValid(id)) {
    return res.status(404).send("Not valid id");
  }

  Todo.findOne({
    _id: id,
    _creator: req.user._id
  })
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

app.delete("/todos/:id", authenticate, (req, res) => {
  let id = req.params.id;

  if (!ObjectId.isValid(id)) {
    return res.status(404).send("Not valid id");
  }

  Todo.findOneAndRemove({
    _id: id,
    _creator: req.user._id
  })
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

app.patch("/todos/:id", authenticate, (req, res) => {
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
  Todo.findOneAndUpdate({
    _id: id,
    _creator: req.user._id
  }, { $set: body }, { new: true })
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

app.post("/users", (req, res) => {
  let body = _.pick(req.body, ["email", "password"]);
  let user = new User(body);
  user
    .save()
    .then(() => {
      return user.generateAuthToken(user);
    })
    .then((token) => {
      res.header("x-auth", token).send(user);
    })
    .catch((err) => {
      res.status(400).send("error " + err);
    });
});

app.post('/users/login', (req, res) => {
  let body = _.pick(req.body, ['email', 'password']);

  User.findByCredentials(body.email, body.password).then((user) => {
    return user.generateAuthToken(user).then((token) => {
      res.header("x-auth", token).send(user);
    });
  }).catch((e) => {
    res.status(400).send(e);
  });
  
});

app.delete('/users/me/token', authenticate, (req, res) => {
  req.user.removeToken(req.token).then(() => {
    res.status(200).send();
  }, () => {
    res.status(400).send();
  });
});

app.get("/users/me", authenticate, (req, res) => {
  res.send(req.user);
});

app.listen(port, () => {
  console.log(`Started on port ${port}`);
});

module.exports = {
  app
};
