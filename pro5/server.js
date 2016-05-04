var ep = require("express");
var app = ep();
var multer  = require('multer');
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, process.cwd()+'/uploads')
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  }
})
 
var upload = multer({ storage: storage })
// var upload = multer({dest: process.cwd()+'/uploads'});
console.log('cwd : '+process.cwd());
app.use('/file',ep.static('/home/ubuntu/workspace/pro5/client'));

app.post('/file/upload',upload.single('0'),function(req,res){
    // console.log(req.file.size);
    // console.log(req.body);
    // upload(req,res,function(err){
    //     if (err) {
    //         res.end('error');
    //         throw err;
    //     }
    //     console.log(req.file.size);
    //     res.json({fileSize:req.file.size});
    //     return ;
    // });
    console.log(req.rawHeaders)
    console.log(req.file)
    console.log(typeof req.file)
    res.json({fileSize:req.file.size});
});
app.listen(8080);