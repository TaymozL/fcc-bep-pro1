var exp = require("express");
var app = exp();
app.get('/api/whoami',function(req,res){
    var userAgent = req.headers['user-agent']
    var swIndex = [userAgent.match(/\(/).index,userAgent.match(/\)/).index];
    var sw = userAgent.slice(swIndex[0]+1,swIndex[1]);
    console.log(req.headers);
    var resJSON = {
        ipadress:req.ip,
        language:req.headers['accept-language'].split(',')[0],
        software:sw
    }
    if(req.headers['x-forwarded-for']){
        resJSON.ipadress = req.headers['x-forwarded-for'];
    }
    res.jsonp(resJSON);
})

app.listen(8080);