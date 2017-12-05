const MongoClient = require('mongodb').MongoClient;

MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, db) => {
  if (err) {
    return console.log('Cannot connect to base ', err);
  }
  console.warn();

  // db.collection('Todos').insertOne({
  //   text: 'new message',
  //   completed: false
  // }, (err, result) => {
  //   if (err) {
  //     return console.log('error occurs ', err);
  //   }
  //   console.log(JSON.stringify(result.ops, undefined, 2));
  // });
  //
  // db.coa sllection('Users').insertOne({
  //   name: 'Pavel',
  //   age: 23,
  //   location: 'Phuket'
  // }, (err, result) => {
  //   if (err) {
  //     return console.log('error occurs ', err);
  //   }
  //   console.log(JSON.stringify(result.ops, undefined, 2))
  // });
  db.collection('Users').find().toArray().then((users) => {
    console.lo(users);
  }, (error) => {
    console.log('some error ', error);
  });

  console.log('Connected to base');
  db.close();
});