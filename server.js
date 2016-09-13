var express = require("express");
var path =require("path");

var port = parseInt(process.argv[2], 10) || 3000;

var app = express();

app.use(express.static(path.join(__dirname, 'public')));

process.on('uncaughtException', function(err) {
  if(err.errno === 'EADDRINUSE' || err.errno === 'EACCES'){
    console.log('Server cannot be initialized. Please, try different port number.');
  }else{
    console.log("Server error:");
    console.log(err);
  }
  process.exit(1);
}); 


var server = app.listen(port, function () {
  console.log("Go to http://localhost:%s in your browser to enjoy EvolConf!", port);
});


app.get('/',function(req,res){
  res.sendFile(path.join(__dirname, 'index.html'));
});
