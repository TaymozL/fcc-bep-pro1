var exp = require("express");
var app = exp();
var url = require('urlencode');
app.get('/*',function(req,res){
    var resJSON = {
        unix : null,
        natural : null
    }
    var path = req.path.slice(1);
    if(+path){
        path = (+path)*1000;
    }else{
        path = url.decode(path);
    }
    console.log(path);
    var resDate = new Date(path);
    if (resDate.toDateString() !== 'Invalid Date'){
        var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        resJSON.natural = months[+resDate.getMonth()]+' '+resDate.getDate()+', '+resDate.getFullYear();
        resJSON.unix = Math.floor(resDate.getTime()/1000);
    }else{
        console.log('invalide date');
    }
    res.json(resJSON);
})

app.listen(8080);