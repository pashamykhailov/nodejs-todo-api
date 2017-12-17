const expect = require("expect");
const supertest = require("supertest");

const {
    ObjectId
} = require('mongodb');

const {
    app
} = require("./../server");
const {
    Todo
} = require("./../models/todo");

let todos = [{
        _id: new ObjectId(),
        text: '123324'
    },
    {
        _id: new ObjectId(),
        text: '098765'
    }
];

beforeEach((done) => {
    Todo.remove({}).then(() => {
        return Todo.insertMany(todos);
    }).then(() => done());
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
            .expect(res => {
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
                    .catch(e => done(e));
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

                Todo.find().then((todos) => {
                    expect(todos.length).toBe(2);
                    done();
                }).catch((err) => done(err));
            });
    });
});

describe('GET /todos', () => {
    it('should get all todos', (done) => {
        supertest(app)
            .get('/todos')
            .expect(200)
            .expect((res) => {
                expect(res.body.todos.length).toBe(2);
            })
            .end(done);
    });
});

describe('GET /todos/:id', () => {
    it('should return todos object with specified id', (done) => {
        supertest(app)
            .get(`/todos/${todos[0]._id.toHexString()}`)
            .expect(200)
            .expect((res) => {
                expect(res.body.todo.text).toBe(todos[0].text)
            })
            .end(done);
    });

    it('should return 404 if todo not found', (done) => {
        supertest(app)
            .get(`/todos/${new ObjectId().toHexString()}`)
            .expect(404)
            .end(done);
    });

    it('should return 404 if passing not valid object id', (done) => {
        supertest(app)
            .get(`/todos/12421412`)
            .expect(404)
            .end(done);
    });
});