const supertest = require("supertest");
const expect = require("expect");

const { ObjectId } = require("mongodb");

const { app } = require("./../server");
const { Todo } = require("./../models/todo");

let todos = [
  {
    _id: new ObjectId(),
    text: "123324"
  },
  {
    _id: new ObjectId(),
    text: "098765",
    completedAt: 333
  }
];

beforeEach((done) => {
  Todo.remove({})
    .then(() => {
      return Todo.insertMany(todos);
    })
    .then(() => done());
});

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
    let text = 'My new text from patch method';
    let hex = todos[0]._id.toHexString();
    supertest(app)
      .patch(`/todos/${hex}`)
      .send({text, completed: true })
      .expect(200)
      .expect((res) => {
        expect(res.body.todo.text).toBe(text);
        expect(res.body.todo.completed).toBe(true);
        expect(res.body.todo.completedAt).toBeA('number');
      })
      .end(done);
  });

  it("should clear completeAt when todo is not complete", (done) => {
    let hex = todos[1]._id.toHexString();
    supertest(app)
    .patch(`/todos/${hex}`)
    .send({complete: false})
    .expect(200)
    .expect((res) => {
      expect(res.body.todo.completedAt).toBe(null);
    })
    .end(done);
  });
});
