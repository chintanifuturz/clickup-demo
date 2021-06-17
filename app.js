
// app.js
require("dotenv").config();
/*  EXPRESS */
// Import the axios library, to make HTTP requests
const axios = require('axios')
const express = require('express');
const app = express();
const pavlok = require('pavlok');
const moment = require("moment");

// This is the client ID and client secret that you obtained
// while registering on github app
const clientID = 'CPTYBMUSMU3E6VQ2WD4F4KW3W9G19UDJ'
const clientIDpavlok = 'c06ea4cdf41486e11dede9a1b72c430e6e7d7469127b6f6832889f640ee8ff11' //pavlok
const clientSecret = 'HHM2IADLTYDB7ZZ98K5U8PRBQP19U9BWTFIQK8NUBCC4EXCRC2BPMGQDCYLQX6RA'
const clientSecretpavlok = '784f7a06e7dc7e360d0b5b6b0886a2ea3804b3164e504ad42b11b713d5f4ee9d' //pavlok

app.set('view engine', 'ejs');
var access_token = "";
var pavlokCode = "";
app.use(express.static('public'));
// Declare the callback route
app.get('/', (req, res) => {

    // The req.query object has the query params that were sent to this route.
    const requestToken = req.query.code;
    
    axios({
      method: 'post',
      url: `https://api.clickup.com/api/v2/oauth/token?client_id=${clientID}&client_secret=${clientSecret}&code=${requestToken}`,

      // Set the content type header, so that we get the response in JSON
      headers: {
           accept: 'application/json',
      }
    }).then((response) => {
      access_token = response.data.access_token
      console.log("access_token",access_token);
      var avc ={"access_token":access_token,"name":"123654"}
     
      var fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
      console.log("fulurl",fullUrl);
      // res.redirect('http://localhost:3000/success');
      res.redirect('https://clickup-demo.herokuapp.com/success');
    }).catch(()=>{
      // res.redirect('http://localhost:3000/success');
      res.redirect('https://clickup-demo.herokuapp.com/success');
      console.log("Test")
    });
});
app.get('/success', function(req, res) {
  axios({
    method: 'get',
    url: `https://api.clickup.com/api/v2/task/4d1tza/?team_id=8475215&include_subtasks=true`,
    headers: {
      Authorization: access_token
    }
  }).then((response) => {
      var checklists = response.data.subtasks;
      const taskName = response.data.name;
      setInterval(() => {
        checklists.map((list)=> {
          var time1 = new Date(parseInt(list.due_date));
          var timeToday = new Date();
          if(time1 > timeToday){
            var difference = time1 - timeToday;
            let min = Math.floor((difference/1000/60));
            if(min <= 5){
              pavlok.vibrate({"intensity": 200,"message":list.name});
            }
          }
        })
      },5000*60);
      var newArr=[];
      var forCalender =[];
      for(let i = 0; i<checklists.length; i++){
        var fulldate = new Date(parseInt(checklists[i].due_date));
        // for calendar 
        forCalender.push({
          "title":checklists[i].name,
          "start":fulldate
        });
        

        var month = fulldate.getMonth() + 1;
        var day = fulldate.getDate();
        var year = fulldate.getFullYear();
        var minutes = fulldate.getMinutes()
        var hours = fulldate.getHours();
        if(hours < 10){
          hours = '0'+hours;
        }
        if(minutes < 10){
          minutes = minutes+'0';
        }
        var time = hours+":"+minutes
        newArr.push({
          name: checklists[i].name,
          date: year+"/"+month+"/"+day,
          time: time
        });
      }
      console.log("forCalender",forCalender);
      res.render('pages/home',{checklists:newArr,taskName:taskName,forCalender:JSON.stringify(forCalender),moment:moment});
  }).catch(function (response) {
    //handle error
    res.render('pages/success',{moment:moment});
    console.log(response.data);
});
});


app.get('/login', function(req, res) {
  res.render('pages/index',{client_id: clientID});
  pavlok.init(clientIDpavlok, clientSecretpavlok, { "port": 8080 }); // runs on port 8080
  pavlok.login(function (result, code) {
      if (result) {
          pavlokCode = code;
      }
  });
});


const PORT = process.env.PORT || 8000;
app.listen(process.env.PORT || 8000 , "0.0.0.0", () => {
  console.log('App listening on port ' + PORT)
});