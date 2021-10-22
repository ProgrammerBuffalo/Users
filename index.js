var express = require('express');
var fs = require('fs');

var mongo = require('mongodb');
var MongoClient = mongo.MongoClient;
var url = "mongodb://localhost:27017/usersDB";

MongoClient.connect(url, function(err, db) {
  if (err) throw err;
  var dbo = db.db("usersDB");

  if(dbo.listCollections({name: "users"}).hasNext()) { return; }

  dbo.createCollection("users", function(err, res) {
    if (err) throw err;
    console.log("Collection created!");
    db.close();
  });
});


var app = express();
var port = 3999;

app.use(express.static(__dirname +"/public"));

app.use(express.urlencoded({
     extended: true
}));

app.get("/users", (request, response) => {
  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db("usersDB");
    dbo.collection("users").find({}).toArray(function(err, result) {
      if (err) throw err;
      console.log(result);
      response.send(JSON.parse(JSON.stringify(result)));
      db.close();
    });

  });

});

app.post("/add", (request, response) => {
  MongoClient.connect(url, function(err, db) {
  let user = {Name: request.body.name, Surname: request.body.surname, Nickname: request.body.nickname}
  var dbo = db.db("usersDB");
  dbo.collection("users").insertOne(user, function(err, res) {
    if (err) throw err;
    console.log("1 document inserted");
    db.close();
    response.sendStatus(200);
  });
});
});

app.put("/change", (request, response) => {
  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
      var dbo = db.db("usersDB");
      console.log(mongo.ObjectId(request.body.id));
      dbo.collection("users").updateOne({ "_id" : mongo.ObjectId(request.body.id)},
      { $set: {"Name": request.body.name, "Surname": request.body.surname, "Nickname": request.body.nickname } }, function(err, res) {
        if (err) throw err;
        console.log("1 document updated");
        db.close();
        response.sendStatus(200);
    });
  });
});

app.delete("/remove", (request, response) => {
  MongoClient.connect(url, function(err, db) {
    var dbo = db.db("usersDB");
    console.log(mongo.ObjectId(request.body.id));
    dbo.collection("users").deleteOne({ "_id" : mongo.ObjectId(request.body.id)}, function(err, obj) {
    if (err) throw err;
    console.log("1 document deleted");
    db.close();
    response.sendStatus(200);
  });
});
});

app.listen(port, () => {
  console.log('Server started...');
});
