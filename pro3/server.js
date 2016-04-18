var mg = require("mongodb").MongoClient;
var validUrl = require("valid-url");
var crypto = require("crypto");
function dbInsertNewUrl(url,cb){
    var res;

    mg.connect('mongodb://localhost:27017/fcc-bep3',function(er,db){
        if(er){
            throw er;
        }
        var urlL = db.collection('UrlList');
        var repu = urlL.find({url:url});
        var hash = crypto.createHash('sha256');
        var urlHash = hash.update(url).digest('base64').slice(0,6);
        repu.count(function(er,count){
            // var hash = crypto.createHash('sha256');
            // var urlHash = hash.update(url).digest('base64').slice(0,6);
            //console.log('urlHash1 :'+urlHash);
            function cbFindNext(er,ct){
                console.log('urlHash :'+urlHash);
                if(er) throw er;
                if(ct>0){
                    var hash = crypto.createHash('sha256');
                    urlHash = hash.update(url+urlHash).digest('base64').slice(0,6);
                    urlL.count({urlIndex:urlHash},cbFindNext);
                }else{
                    urlL.insert({url:url,urlIndex:urlHash},function(er,data){
                        if(er){
                            throw er;
                        }
                        //console.log(data);
                        db.close();
                        res = urlHash;
                        cb(res);
                    })
                }
            }
            if(count){
                //console.log('1');    
                repu.toArray(function(er,docs){
                    if(er) throw er;
                    console.log(docs);
                    res = docs[0].urlIndex;
                    db.close();
                    cb(res);
                });
                
            }else{
                //console.log('0');  
                urlL.count({urlIndex:urlHash},cbFindNext);
            }
            
        
        
        });
    
    });
    // return res;
}
function dbFind(q,cb){
    mg.connect('mongodb://localhost:27017/fcc-bep3',function(er,db){
        if(er){
            throw er;
        }
        var urlL = db.collection('UrlList');
        urlL.find({urlIndex:q}).toArray(function(er,docs){
            if(er) throw er;
            if(docs.length){
                cb(true,docs[0].url);
            }else{
                cb(false,"Short Url Unexist");
            }
            db.close();
        });
    });
}
var ep = require('express');
var app = ep();

app.get('/new/*',function (req,res){
    var urlQ = req.path.slice(5);
    if(validUrl.isUri(urlQ)){
        dbInsertNewUrl(urlQ,function(shortUrl){
            var appUrl = "https://fcc-bep1-taymozl-1.c9users.io/";
            res.jsonp({
                origin_url:urlQ,
                short_url:appUrl+shortUrl
            })
        })
    }else{
        res.end('invalid url');
    }
});

app.get('/*',function(req, res) {
    var p = req.path.slice(1);
    if(p.length == 6 && p.match(/[a-zA-Z0-9]{6}/)){
        dbFind(p,function(exist,url){
            if(exist){
                res.redirect(url);
            }else{
                res.end(url);
            }
        });
    }else{
        res.end('Invalid Short URL');
    }
});
app.listen(8080);

// process.exit();