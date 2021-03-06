var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");
var cors = require('cors');
// var mongojs = require("mongojs");

var config = require('./config/connection');

// var bodyParser = require('body-parser')

// Our scraping tools
// Axios is a promised-based http library, similar to jQuery's Ajax method
// It works on the client and on the server
var axios = require("axios");
var cheerio = require("cheerio");

// Require all models
var db = require("./models");

var PORT = 3000;
var path = require('path');

// Initialize Express
var app = express();
app.use(cors());

// Configure middleware

// Use morgan logger for logging requests
app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// app.use(express.static("/controller"));
mongoose.connect(config.connection);
// mongoose.connect("mongodb://localhost:27017/newsscraper");
// Routes

// A GET route for scraping the echoJS website
app.get("/scrape", function(req, res) {
  
  // First, we grab the body of the html with request
  // https://www.nytimes.com/
  // axios.get("http://www.nytimes.com/").then(function(response) {
   
    axios.get("http://www.nytimes.com/section/us").then(function(response) {
    // Then, we load that into cheerio and save it to $ for a shorthand selector
    var $ = cheerio.load(response.data);

    // Now, we grab every h2 within an article tag, and do the following:
    $("article h2").each(function(i, element) {
      // Save an empty result object
      var result = {};

      // Add the text and href of every link, and save them as properties of the result object
     
      result.title = $(this).children("a").text();
      result.link = $(this).children("a").attr("href");
      
      mongoose.connection.db.dropCollection('articles', function(err, result) {});

      db.Article.create(result)
        .then(function(dbArticle) {})
        .catch(function(err) {
          return res.json(err);
        });
    });

    // If we were able to successfully scrape and save an Article, send a message to the client
    res.send("Scrape Complete");
  });
});

app.all('/api/note', function(req,res){
  db.Note.create({id:"Computer", note:"Article"})
  .then(function(dbnote){
    console.log("created..");
  })
  .catch(function(err) {
    // If an error occurs, print it to the console
    console.log(err.message);
  });

})


// app.put("api/articles/delete/fromnote/:id", function(req, res){
//   db.note.findOne({ _id: req.params.id })
//   .then(function(dbArticle) {
//     if(dbArticle){
//       db.note.deleteOne({ id:id})
//     }
//   });
//   });


app.get("/articles", (req, res) => {
  db.Article.find({})
    .then(function(dbArticle) {
      res.json(dbArticle);
      // console.log(dbArticle);
    })
    .catch(function(err) {
      res.json(err);
    });
});

// Start the server
app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});