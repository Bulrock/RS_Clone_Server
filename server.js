const express = require("express");
const server = express();

server.get("/", function(request, response){
  response.send(`<h2>${request.method}</h2>`);
});

server.listen(3000);