
require('dotenv').load();
var cx=process.env.CX;
var key = process.env.KEY;
console.log(key+cx);
var urlPre = 'https://www.googleapis.com/customsearch/v1?q=';
var bl = require("bl");
var https = require("https");
var ep = require("express");
var mg = require("mongodb").MongoClient;
var dburl = process.env.MONGODB_URI;
function insertQ(q){
  mg.connect(dburl,function(er,db){
    if (er) throw er;
    var dt = new Date().toISOString();
    var clt = db.collection('imgSrchQs');
    clt.insert({term:q,when:dt},function(er,data){
      if(er) throw er;
      db.close();
    });
  });
}
function findQs(cb){
  mg.connect(dburl,function(er,db){
    if (er) throw er;
    var clt = db.collection('imgSrchQs');
    clt.find({},{_id:0}).sort({when:-1}).limit(10).toArray(function(er,docs){
      if(er) throw er;
      cb(docs);
      db.close();
    });
  });
}
function reqImageFromGoogle(url,cb){
  https.get(url,(res) => {
    console.log('statusCode: ', res.statusCode);
    // console.log('headers: ', res.headers);
    res.pipe(bl(function(er,data){
        if (er) throw er;
        var resJson = JSON.parse(data.toString());
        var res = [];
        if(resJson.items){
          var searhRes = JSON.parse(data.toString()).items;
          //console.log(searhRes);
          for(var j = 0; j<searhRes.length;j++){
            res[j] = {
              url:searhRes[j].link,
              snippet:searhRes[j].snippet,
              context:searhRes[j].image.contextLink,
              thumbnail : searhRes[j].image.thumbnailLink
            }
          }
        }else if(resJson.spelling){
          res = {correctedQ : resJson.spelling.correctedQuery};
        }

        cb(res);
    }));
  }).on('error', (e) => {
    console.error(e);
  });
}
function reqTextFromGoogle(url,cb){
  https.get(url,(res) => {
    console.log('statusCode: ', res.statusCode);
    // console.log('headers: ', res.headers);
    res.pipe(bl(function(er,data){
        if (er) throw er;
        var resJson = JSON.parse(data.toString());
        var res = [];
        if(resJson.items){
          var searhRes = JSON.parse(data.toString()).items;
          // console.log(searhRes);
          for(var j = 0; j<searhRes.length;j++){
            res[j] = {
              url:searhRes[j].link,
              
              title:searhRes[j].title,
              snippet:searhRes[j].snippet
              // context:searhRes[j].image.contextLink,
              // thumbnail : searhRes[j].image.thumbnailLink
            }
          }
        }else if(resJson.spelling){
          res = {correctedQ : resJson.spelling.correctedQuery};
        }

        cb(res);
    }));
  }).on('error', (e) => {
    console.error(e);
  });
}
var app = ep.Router();
app.get('/imgsearch/latest',function(req,res){
    function cbLatestRes(rJson){
      res.jsonp(rJson);
    }
    findQs(cbLatestRes);
});
app.get('/imgsearch/:qString',function(req,res){
  var num = +(req.query.offset)||1;
  if((typeof num == 'number')){
    var qstr = req.params.qString;
    insertQ(qstr);
    var url = urlPre+qstr+'&cx='+cx+'&start='+num+'&searchType=image&key='+key;
    console.log("url : "+url);
    function cbAppRes(rJson){
      res.jsonp(rJson);
    }
    reqImageFromGoogle(url,cbAppRes);
  }else{
    res.end('wrong params');
  }

});

app.get('/textsearch/:qString',function(req,res){
  var num = +(req.query.offset)||1;
  if((typeof num == 'number')){
    var qstr = req.params.qString;
    insertQ(qstr);
    var url = urlPre+qstr+'&cx='+cx+'&start='+num+'&key='+key;
    console.log("url : "+url);
    function cbAppRes(rJson){
      res.jsonp(rJson);
    }
    reqTextFromGoogle(url,cbAppRes);
  }else{
    res.end('wrong params');
  }

});
// app.listen(8080);
module.exports=app;