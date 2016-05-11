var ep = require("express");
var BEapp = ep();
var routers = [];
BEapp.set('port', (process.env.PORT || 5000));
for(var i=1; i<6; i++){
    routers[i] = require("./pro"+i+"/server.js");
    BEapp.use("/pro"+i,routers[i]);
}
// BEapp.use("/pro1",require("./testrouter.js"));
// BEapp.listen(8080);
BEapp.listen(BEapp.get('port'), function() {
  console.log('Node app is running on port', BEapp.get('port'));
});