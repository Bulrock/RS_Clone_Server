const express = require("express");
const pass = require("path");
const mongoose = require("mongoose");
const bp = require('body-parser');

const server = express();
server.use(bp.json());
server.use(bp.urlencoded({ extended: true }));

const PORT = 3000;
const db = "mongodb+srv://Admin:nn6vJw.n7d3FXZs@cluster0.pzvo6cd.mongodb.net/games-stack?retryWrites=true&w=majority";

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  userHighScores: [
    {
      gamename: String,
      score: String
    },
  ]
});

const Users = mongoose.model('users', userSchema);

mongoose.set('strictQuery', true);
mongoose
  .connect(db)
  .then((res) => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => console.log(error));

server.listen(PORT, (error) => {
  error ? console.log(error) : console.log(`listening port: ${PORT}`)
});

server.post("/user/login", function(request, response){
  console.log(request.body);
  const username = request.body.username;
  const password = request.body.password;
  Users.findOne({username: username}, (err, user) => {
    if(user?.password === password) {
      response.send({success: true, user})
    } else {
      response.send({success: false, error: "Username or password isn't correct"})
    }
  })
});

server.post("/user/register", function(request, response){
  console.log(request.body);
  const username = request.body.username;
  const password = request.body.password;
  Users.exists({username: username}, (err, user) => {
    if(user === null) {
      Users.updateOne(
        {username: username},
        { $set:
          {
          username: username,
          password: password,
          }
        },
        {upsert: true})
        .then(()=>{
          response.send({success: true, message: "User added successfully"})
        });
    } else {
      response.send({success: false, error: "Username is already exists"})
    }
  })
});
