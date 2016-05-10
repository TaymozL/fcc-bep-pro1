var ep = require("express");
var BEapp = ep();
var routers = [];
for(var i=1; i<6; i++){
    routers[i] = require("./pro"+i+"/server.js");
    BEapp.use("/pro"+i,routers[i]);
}
// BEapp.use("/pro1",require("./testrouter.js"));
BEapp.listen(8080);
