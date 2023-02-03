const express = require("express");
const pass = require("path");
const mongoose = require("mongoose");
const bp = require('body-parser');
const cors = require('cors')

const server = express();
server.use(cors());
server.use(bp.json());
server.use(bp.urlencoded({ extended: true }));

const PORT = process.env.PORT || 5002;
const db = "mongodb+srv://Admin:nn6vJw.n7d3FXZs@cluster0.pzvo6cd.mongodb.net/games-stack?retryWrites=true&w=majority";

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  highScores: Object
});

const Users = mongoose.model('User', userSchema);

const scoresSchema = new mongoose.Schema({
  gamename: String,
  userScores: Object
});

const Games = mongoose.model('Game', scoresSchema);

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

server.get("/", function(request, response){
  response.status(200).send(`
  <h1>Server API</h1>
  <ul>
    <li>Register new User: POST request with body: <br>
      { 'username': 'User_Name', 'password': '12345' } <br>
      on 'https://rsclonetestserver-production.up.railway.app/user/register' <br>
    </li>
    <li>Login User: POST request with body: <br>
      { 'username': 'User_Name', 'password': '12345' } <br>
      on 'https://rsclonetestserver-production.up.railway.app/user/login' <br>
    </li>
    <li>Check existence of Username: POST request with body: <br>
      { 'username': 'User_Name', } <br>
      on 'https://rsclonetestserver-production.up.railway.app/user/check' <br>
    </li>
    <li>Add current game score to User's scores statistic: POST request with body: <br>
      { 'username': 'User_Name', 'gamename': 'tetris', 'score': 1 } <br>
      on 'https://rsclonetestserver-production.up.railway.app/user/addscore' <br>
    </li>
    <li>Add current game score to TOP10 game scores statistic: POST request with body: <br>
      { 'username': 'User_Name', 'gamename': 'tetris', 'score': 1 } <br>
      on 'https://rsclonetestserver-production.up.railway.app/top/addscore' <br>
    </li>
    <li>Get current user scores with sorting ability: POST request with body: <br>
      { 'username': 'User_Name', 'options': 'ascScore'/'descScore'/'ascGame'/'descGame'/ } <br>
      on 'https://rsclonetestserver-production.up.railway.app/user/scores' <br>
    </li>
    <li>Get specified game TOP10 with sorting ability: POST request with body: <br>
      { 'gamename': 'tetris', 'options': 'ascScore'/'descScore'/'ascName'/'descName'/ } <br>
      on 'https://rsclonetestserver-production.up.railway.app/game/top10' <br>
    </li>
  </ul>`)
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

server.post("/user/check", function(request, response){
  console.log(request.body);
  const username = request.body.username;

  Users.exists({username: username}, (err, user) => {
    if(user === null) {
      response.send({success: false, message: "Username is available"});
    } else {
      response.send({success: true, message: "Username is already exists"})
    }
  })
});

server.post("/user/addscore", function(request, response){
  console.log(request.body);
  const username = request.body.username;
  const gamename = request.body.gamename;
  const score = request.body.score;

  Users.findOne({username: username}, (err, user) => {
    if(err) {console.log(`Error: ${err}`)}
    if(user !== null) {
      if(user.highScores && user.highScores[gamename]) {
        if(user.highScores[gamename] < score) {
          const filter = {username: username};
          user.highScores[gamename] = score;
          const update = {highScores: user.highScores};

          Users.findOneAndUpdate(filter, update, { upsert: true, new: true }, (err, user) => {
            if(err) {
              response.send({success: false, message: `Score wasn't updated: ${err.message}`});
            } else {
              response.send({success: true, message: "Score updated successfully"});
            }
          })
        } else {
          response.send({success: false, message: "Score is already up to date"});
        }
      } else {
        const filter = {username: username};
        user.highScores = user.highScores ? user.highScores : {};
        user.highScores[gamename] = score;
        const update = {highScores: user.highScores};

        Users.findOneAndUpdate(filter, update, { upsert: true, new: true }, (err, user) => {
          if(err) {
            response.send({success: false, message: `Score wasn't updated: ${err.message}`});
          } else {
            response.send({success: true, message: "Score has been updated successfully"});
          }
        })
      }
    }
  });
});

server.post("/top/addscore", function(request, response){
  console.log(request.body);
  const username = request.body.username;
  const gamename = request.body.gamename;
  const score = request.body.score;

  Games.findOne({gamename: gamename}, (err, game) => {
    if(err) {
      response.send({success: false, message: `Score wasn't added to top 10: ${err.message}`});
    }
    if(game !== null) {
      if(Object.values(game.userScores).length <= 10) {
        game.userScores[username] = score;
        const filter = {gamename: gamename};
        const update = {userScores: sortObject(game.userScores)};

        Games.findOneAndUpdate(filter, update, { new: true }, (err, user) => {
          if(err) {
            response.send({success: false, message: `Top wasn't updated: ${err.message}`});
          } else {
            response.send({success: true, message: "Top updated successfully"});
          }
        })
      }
    } else {
      Games.exists({gamename: gamename}, (err, game) => {
        if(game === null) {
          Games.updateOne(
            {gamename: gamename},
            { $set:
              {
              gamename: gamename,
              userScores: {[username]: score},
              }
            },
            {upsert: true})
            .then(()=>{
              response.send({success: true, message: "Top updated successfully"})
            });
        } else {
          response.send({success: false, error: `Top wasn't updated: ${err.message}`})
        }
      })
    }
  });
})

server.post("/user/scores", function(request, response){
  console.log(request.body);
  const username = request.body.username;
  const option = request.body.option;
  let sortOption;

  switch(option) {
    case "ascScore":
      sortOption = ascScore;
      break;
    case "descScore":
      sortOption = descScore;
      break;
    case "ascGame":
      sortOption = ascGame;
      break;
    case "descGame":
      sortOption = descGame;
      break;
  }

  Users.findOne({username: username}, (err, user) => {
    if(err) {console.log(`Error: ${err}`)}
    if(user !== null) {
      response.send({success: true, [username]: sortObject(user.highScores, sortOption)});
    } else {
      response.send({success: false, message: "Score isn't available"});
    }
  });
});

server.post("/game/top10", function(request, response){
  console.log(request.body);
  const gamename = request.body.gamename;
  const option = request.body.option;
  let sortOption;

  switch(option) {
    case "ascScore":
      sortOption = ascScore;
      break;
    case "descScore":
      sortOption = descScore;
      break;
    case "ascName":
      sortOption = ascName;
      break;
    case "descName":
      sortOption = descName;
      break;
  }

  Games.findOne({gamename: gamename}, (err, game) => {
    if(err) {console.log(`Error: ${err}`)}
    if(game !== null) {
      response.send({success: true, [gamename]: sortObject(game.userScores, sortOption)});
    } else {
      response.send({success: false, message: "Top isn't available"});
    }
  });
});

const descScore = (a, b) => b[1] - a[1];
const ascScore = (a, b) => a[1] - b[1];
const ascGame = (a, b) => a[0].localeCompare(b[0]);
const descGame = (a, b) => b[0].localeCompare(a[0]);
const ascName = (a, b) => a[0].localeCompare(b[0]);
const descName = (a, b) => b[0].localeCompare(a[0]);

function sortObject(object, func = descScore) {
  let sortable = [];
  for (let key in object) {
    sortable.push([key, object[key]]);
  }

  sortable.sort(func);

  if (sortable.length > 10) {
    sortable = sortable.slice(0, 10);
  }

  let orderedObj = {};
  for (let idx in sortable) {
    orderedObj[sortable[idx][0]] = sortable[idx][1];
  }

  return orderedObj;
}
