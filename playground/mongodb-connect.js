const {MongoClient, ObjectId} = require('mongodb');

MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, db) => {
  if (err) {
    return console.log('Cannot connect to base ', err);
  }
  // db.collection('Todos').insertOne({
  //   text: 'make homework',
  //   completed: false
  // }, (err, result) => {
  //   if (err) {
  //     return console.log('error occurs ', err);
  //   }
  //   console.log(JSON.stringify(result.ops, undefined, 2));
  // });
  //
  // db.collection('Users').insertOne({
  //   name: 'Pavel',
  //   age: 23,
  //   location: 'Phuket'
  // }, (err, result) => {
  //   if (err) {
  //     return console.log('error occurs ', err);
  //   }
  //   console.log(JSON.stringify(result.ops, undefined, 2))
  // });
  // db.collection('Todos').find().toArray().then((list) => {
  //   console.log(list);
  // }, (error) => {
  //   console.log('some error ', error);
  // });
  // db.collection('Users').deleteOne({
  //   _id:  new ObjectId("5a280d0198f941cf98504783")
  // }).then((result) => {
  //   console.log(result);
  // });
  // db.collection('Users').deleteMany({
  //   name: 'Pavel'
  // }).then((result) => {
  //   console.log(result);
  // });
  db.collection('Users').findOneAndUpdate({
    _id: new ObjectId('5a2024d54bb2ae34ca34f7b5')
  },{
    $set: {
      location: 'New York'
    },
    $inc: {
      age: 12
    }
  }, {
    returnOriginal: false
  }).then((success) => {
    console.log(success);
  }, (err) => {
    console.log(err);
  });

  console.log('Connected to base');
  // db.close();
});
