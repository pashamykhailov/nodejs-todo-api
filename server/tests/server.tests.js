const supertest = require("supertest");
const expect = require("expect");

const { ObjectId } = require("mongodb");

const { app } = require("./../server");
const { Todo } = require("./../models/todo");
const { User } = require('./../models/user');
const { todos, populateTodos, users, populateUsers } = require("./seed/seed");

beforeEach(populateUsers);
beforeEach(populateTodos);

describe("POST /todos", () => {
  it("should create a new todo", (done) => {
    let text = "test text";
    supertest(app)
      .post("/todos")
      .send({
        text
      })
      .expect(200)
      .expect((res) => {
        expect(res.body.text).toBe(text);
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Todo.find({
          text
        })
          .then((todos) => {
            expect(todos.length).toBe(1);
            expect(todos[0].text).toBe(text);
            done();
          })
          .catch((e) => done(e));
      });
  });
  it("should not create todo with individual data", (done) => {
    supertest(app)
      .post("/todos")
      .send({})
      .expect(400)
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Todo.find()
          .then((todos) => {
            expect(todos.length).toBe(2);
            done();
          })
          .catch((err) => done(err));
      });
  });
});

describe("GET /todos", () => {
  it("should get all todos", (done) => {
    supertest(app)
      .get("/todos")
      .expect(200)
      .expect((res) => {
        expect(res.body.todos.length).toBe(2);
      })
      .end(done);
  });
});

describe("GET /todos/:id", () => {
  it("should return todos object with specified id", (done) => {
    supertest(app)
      .get(`/todos/${todos[0]._id.toHexString()}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.todo.text).toBe(todos[0].text);
      })
      .end(done);
  });

  it("should return 404 if todo not found", (done) => {
    supertest(app)
      .get(`/todos/${new ObjectId().toHexString()}`)
      .expect(404)
      .end(done);
  });

  it("should return 404 if passing not valid object id", (done) => {
    supertest(app)
      .get(`/todos/12421412`)
      .expect(404)
      .end(done);
  });
});

describe("DELETE /todos/:id", () => {
  it(`should remove a todo `, (done) => {
    let hex = todos[1]._id.toHexString();

    supertest(app)
      .delete(`/todos/${hex}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.todo._id).toBe(hex);
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Todo.findById(hex)
          .then((todo) => {
            expect(todo).not.toBe();
            done();
          })
          .catch((e) => {
            done(e);
          });
      });
  });

  it(`should return 404 if todo not found `, (done) => {
    supertest(app)
      .delete(`/todos/${new ObjectId().toHexString()}`)
      .expect(404)
      .end(done);
  });

  it(`should return 404 if object id not valid `, (done) => {
    supertest(app)
      .get(`/todos/12421412`)
      .expect(404)
      .end(done);
  });
});

describe("PATCH /todos/:id", () => {
  it("should update the todo", (done) => {
    let text = "My new text from patch method";
    let hex = todos[0]._id.toHexString();
    supertest(app)
      .patch(`/todos/${hex}`)
      .send({ text, completed: true })
      .expect(200)
      .expect((res) => {
        expect(res.body.todo.text).toBe(text);
        expect(res.body.todo.completed).toBe(true);
      })
      .end(done);
  });

  it("should clear completeAt when todo is not complete", (done) => {
    let hex = todos[1]._id.toHexString();
    supertest(app)
      .patch(`/todos/${hex}`)
      .send({ complete: false })
      .expect(200)
      .expect((res) => {
        expect(res.body.todo.completedAt).toBe(null);
      })
      .end(done);
  });
});

describe('GET /users/me', () => {
  it('should returned user if authenticated', (done) => {
    supertest(app)
    .get('/users/me')
    .set('x-auth', users[0].tokens[0].token)
    .expect(200)
    .expect((res) => {
      expect(res.body._id).toBe(users[0]._id.toHexString());
      expect(res.body.email).toBe(users[0].email);
    })
    .end(done);
  });

  it('should returned 401 if user not authenticated', (done) => {
    supertest(app)
    .get('/users/me')
    .expect(401)
    .expect((res) => {
      expect(res.body).toEqual({});
      // expect(res.body.email).toBe(undefined);
    })
    .end(done);
  })
});

describe('POST /users', () => {
  it('should create a user', (done) => {
    let email = 'mail@mail.com';
    let password = 'password';

    supertest(app)
    .post('/users')
    .send({email, password})
    .expect(200)
    .expect((res) => {
      expect(!!res.headers['x-auth']).toBe(true);
      expect(!!res.body._id).toBe(true);
      expect(res.body.email).toBe(email);
    })
    .end((err) => {
      if (err) {
        return done();
      }

      User.findOne({email}).then((user) => {
        expect(!!user).toBe(true);
        if (user.password == password) {
          expect(user.password).toBe(false);
        }
        done();
      })
    });
  });

  it('should return validatoin error if request invalid', (done) => {
    let email = 'qerqwrq';
    let password = '123';

      supertest(app)
      .post('/users')
      .send({email, password})
      .expect(400)
      .end(done);
  });

  it('should not create user if email in use', (done) => {
    supertest(app)
    .post('/users')
    .send({
      email: users[0].email,
      password: 'password123sss'
    })
    .expect(400)
    .end(done);
  })

});
