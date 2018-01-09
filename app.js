// module imports
const express = require('express');
const MongoClient = require('mongodb').MongoClient;
const bodyParser = require('body-parser');
const app = express();
const watson = require('watson-developer-cloud');
const language_translator = watson.language_translator({
  username: 'username',
  password: 'password',
  version: 'v2'
});

// db config
let db;

MongoClient.connect('url', function(err, client) {
    if(err) {
        console.log(err)
    } else {
        console.log('Connected to db')
        db = client.db('our-super-db')
    }
})

// middelware
app.use(bodyParser.json())

// API
app.post('/support', (req, res) => {
    language_translator.translate({
        text: req.body.description,
        source: req.body.lang,
        target: 'en'
      }, (err, translation) => {
        if(err)
            console.log(err)
        else {
            const collection = db.collection('tickets')
            collection.insertOne({
                username: req.body.username,
                description: translation.translations[0].translation
            }, (err, result) => {
                if(err) {
                    console.log(err)
                } else {
                    res.sendStatus(200)
                }
            })
        } 
    })
})

// server config
const port = process.env.PORT || 5000;
app.listen(port)
