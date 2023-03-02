require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { request } = require('express');

const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const dns = require('dns');
const urlparser = require('url');	
const app = express();




mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
},()=>{
  console.log('connexion reussi')
})

const Schema = new mongoose.Schema(
  {
    url: String,
  }
);

const Url = mongoose.model('Url',Schema);

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use(bodyParser.urlencoded({ extended: false }));

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.post("/api/shorturl", (req, res)=>{
  const bodyUrl = req.body.url;

  const dnsValue = dns.lookup(urlparser.parse(bodyUrl).hostname, (err, data)=>{
    if(!data){
      res.json({ error: "Invalid URL"});
    }else{
      const url = new Url({url: bodyUrl});
      url.save((err, data)=>{
        res.json({ 
          original_url: data.url,
          short_url: data.id
         }); 
      })
    }
    console.log("dns "+data);
  });
})

app.get("/api/shorturl/:id", (req, res) => {
  const id = req.params.id;
  Url.findById(id, (err, data)=>{
    if(!data) res.json({error: "Invalid URL"});
    else res.redirect(data.url);
  })
})
app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
