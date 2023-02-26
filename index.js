
const express = require('express');
const app = express();
let server = require('http').createServer(app);
var bodyParser = require('body-parser');
var cors = require('cors');
var mysql = require('mysql');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());
const fs = require("fs");

const connection = mysql.createConnection({
	host     : 'db-chatapp-do-user-13320451-0.b.db.ondigitalocean.com',
  ssl:{
    ca: fs.readFileSync('./ca-certificate.crt')
  },
	user     : 'umar9122',
	password : 'AVNS_Jnk5EqU9gpgUx2EFnRV',
	database : 'defaultdb',
  port:25060
});

connection.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
  // var sql = "CREATE TABLE conversation (id int(11) NOT NULL PRIMARY KEY AUTO_INCREMENT, msg varchar(500) DEFAULT NULL, user varchar(225) DEFAULT NULL, createdAt timestamp NOT NULL DEFAULT current_timestamp())";
  // connection.query(sql, function (err, result) {
  //   if (err) throw err;
  //   console.log("Table created");
  // });

  // var sql = "INSERT INTO users (email, password, firstName, lastName) VALUES(?,?,?,?)";
  // connection.query(sql, ["umar@user.com", "password", "Muhammad", "Umar"], function (err, result) {
  //   if (err) throw err;
  //   console.log("Data Inserted");
  // });
});

app.post('/login', function (req, res) {

  let username = req.body.email;
	let password = req.body.password;
 
  connection.query('SELECT * FROM users WHERE email = ? AND password = ?', [username, password], function (err, result, fields) {
      if(result.length > 0){

        res.statusCode = 200;
        res.send({user: result[0]}); 
          

      }else{

        res.statusCode = 401;
        res.send("Wrong Email & Password !");
        
      }

   
  });
 
 });

 app.get('/getConversationMessages', function (req, res) {
 
  connection.query('SELECT * FROM conversation ORDER BY id DESC LIMIT 0,10', function (err, result, fields) {
      if(result.length > 0){

        res.statusCode = 200;
        console.log(result);
        res.send(result); 
          

      }else{

        res.statusCode = 401;
        res.send("No Data found !");
        
      }

   
  });
 
 });

 app.post('/addMessage', function (req, res) {

  let message = req.body.message.message;
  let user = req.body.message.user;

 
  console.log(req.body);
  connection.query('INSERT INTO conversation (msg, user) VALUES(?,?)', [message, user], function (err, result, fields) {


      if(err){

        res.statusCode = 401;
        res.send("Message Sending Error!");
          

      }else{
        res.statusCode = 200;
        res.send({status: 'ok'}); 
        
        
      }

   
  });
 
 });

let io = require('socket.io')(server,
  {
    cors: {
      origin: "*"
    }});  
io.on('connection', (socket) => {

  socket.on('disconnect', function(){
    io.emit('users-changed', {user: socket.username, event: 'left'});
  });

  socket.on('set-name', (name) => {
    socket.username = name;
    io.emit('users-changed', {user: name, event: 'joined'});
  });

  socket.on('send-message', (message) => {
    io.emit('message', {msg: message.text, user: socket.username, createdAt: new Date()});
  });
});






var port = process.env.PORT || 3001;

server.listen(port, function(){
   console.log('listening in http://localhost:' + port);
});