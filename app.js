'use strict';
let alexaVerifier = require('alexa-verifier');
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var users = require('./routes/users');
 var request = require("request");
var app = express();
//
var to_search="";
 var final_result;
var json_final="";




// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
//app.use(bodyParser.json());
app.use(bodyParser.json({
    verify: function getRawBody(req, res, buf) {
        req.rawBody = buf.toString();
    }
}));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);
function requestVerifier(req, res, next) {
    alexaVerifier(
        req.headers.signaturecertchainurl,
        req.headers.signature,
        req.rawBody,
        function verificationCallback(err) {
            if (err) {
                res.status(401).json({ message: 'Verification Failure', error: err });
            } else {
                next();
            }
        }
    );
}
  
// catch 404 and forward to error handler

app.post('/skill',  function(req, res) {
 
   var temp;
    if (req.body.request.type === 'LaunchRequest') { 
        res.json({
      "version": "1.0",
      "response": {
        "shouldEndSession": false,
        "outputSpeech": {
          "type": "SSML",
          "ssml": "<speak>Welcome to What's on, here you can ask schedule for each channel. only in the United states/speak>"
          
        }
      }
    }); 
    }
  else if (req.body.request.type === 'IntentRequest' &&
           req.body.request.intent.name === 'AMAZON.CancelIntent') 
  { 
      
  res.json({
      "version": "1.0",
      "response": {
        "shouldEndSession": true,
        "outputSpeech": {
          "type": "SSML",
          "ssml": "<speak>hmm see you soon</speak>"
          
        }
      }
    });
      
  
      
  }
    else if (req.body.request.type === 'IntentRequest' &&
           req.body.request.intent.name === 'AMAZON.StopIntent') 
  { 
      
  res.json({
      "version": "1.0",
      "response": {
        "shouldEndSession": true,
        "outputSpeech": {
          "type": "SSML",
          "ssml": "<speak>hmm see you soon</speak>"
          
        }
      }
    });
      
  
      
  }
    else if (req.body.request.type === 'IntentRequest' &&
           req.body.request.intent.name === 'AMAZON.HelpIntent') 
  { 
      
  res.json({
      "version": "1.0",
      "response": {
        "shouldEndSession": false,
        "outputSpeech": {
          "type": "SSML",
          "ssml": "<speak>You can ask me for example: CNN today"+"<break time=\"1s\"/>"
            +"Playing on Discovery"+
            +"</speak>"
          
        }
      }
    });
      
  
      
  }
  else if (req.body.request.type === 'IntentRequest' &&
           req.body.request.intent.name === 'getshows') {
      if (
       
        !req.body.request.intent.slots.channel.value
         
         ) {
        
      res.json({
      "version": "1.0",
      "response": {
        "shouldEndSession": false,
        "outputSpeech": {
          "type": "SSML",
          "ssml": "<speak>Please say again including the channel name</speak>"
          
        }
      }
    });
      
    }
      else
      {
         var splitted_string=req.body.request.timestamp.split("T");
         var request_date=splitted_string[0];
           if(req.body.request.intent.slots.time.value)
                                        {//   19:35:27Z
                                           var request_time_now=splitted_string[1];
                                            request_time_now=request_time_now.split(":");
                                            request_time_now=request_time_now[0];
                                            var time_request=req.body.request.intent.slots.time.value;
          time_request=time_request.toLowerCase();
                                        }
          
          
          var request_channel=req.body.request.intent.slots.channel.value;
          request_channel=request_channel.toLowerCase();
          var final_time="";
        
          var result="";
          request({
        url: "http://api.tvmaze.com/schedule?country=US&date="+request_date,
        json: true
    }, function (error, response, body) {
       

        if (!error && response.statusCode === 200) {
              
            if(body.length!=0)
                {
                    for(var a=0;a<body.length;a++)
                        {
                            if(body[a].show.network.name.toLowerCase()==request_channel)
                                {
                                    final_time="";
                                  
                                //  temp_time=temp_time[1].split(":");
                             
                                  final_time=  body[a].airtime;
                                    if(time_request=="now")
                                        {
                                            var temp_time=final_time.split(":");
                                            if(temp_time[0]==request_time_now)
                                                {
                                                    final_time=tConvert(final_time);
                                                 result+=body[a].show.name+" at "+final_time
                             +"<break time=\"1s\"/>";
                                                }
                                           
                                        }
                              else{
                                   // var temp_time=body[a].airstamp.split("T");
                                     
                                //final_time=temp_time[0]+":"+temp_time[1];
                                    final_time=tConvert(final_time);
                                   
                                    
                        
                                
                            result+=body[a].show.name+" at "+final_time
                             +"<break time=\"1s\"/>";
                              }
                                
                          
                         
                                }
                            
                        }
                    
                    
                }
            
            if(result.length!=0){
            
            res.json({
      "version": "1.0",
      "response": {
        "shouldEndSession": true,
        "outputSpeech": {
          "type": "SSML",
          "ssml": "<speak>"+"Now Playing on "+request_channel+" : "+result+
            " According to Eastern time zone</speak>"
        }
      }
    });
            result="";
            }
            else{
                
                  res.json({
      "version": "1.0",
      "response": {
        "shouldEndSession": true,
        "outputSpeech": {
          "type": "SSML",
          "ssml": "<speak>"+"Sorry there is no schedule or no channel with this name"+
            "</speak>"
        }
      }
    });
                
                
            }
          
            
          
            
             
        }
    });
    
          
          
          
          
          
          
      }
  }
      
      

  
     
     
  
    
    
    
    
});






app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});







// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

function tConvert (time) {
  // Check correct time format and split into components
  time = time.toString ().match (/^([01]\d|2[0-3])(:)([0-5]\d)(:[0-5]\d)?$/) || [time];

  if (time.length > 1) { // If time format correct
    time = time.slice (1);  // Remove full string match value
    time[5] = +time[0] < 12 ? 'AM' : 'PM'; // Set AM/PM
    time[0] = +time[0] % 12 || 12; // Adjust hours
  }
  return time.join (''); // return adjusted time or original string
}


module.exports = app;
