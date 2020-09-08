var mysql = require('mysql');
var fs = require('fs');
var readline = require('readline');
var myCon = mysql.createConnection({
   host: 'localhost',
   port: '3306',
   database: 'matcha',
   user: 'seefeesaw',
   password: 'seefeesaw1'
});
var rl = readline.createInterface({
  input: fs.createReadStream('./matcha.sql'),
  terminal: false
 });
rl.on('line', function(chunk){
    myCon.query(chunk.toString('ascii'), function(err, sets, fields){
     if(err) console.log(err);
    });
});
rl.on('close', function(){
  console.log("finished");
  myCon.end();
});