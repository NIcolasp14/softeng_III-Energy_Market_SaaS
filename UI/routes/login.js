var express=require("express");
var router=express.Router();

router.get('/', (req,res)=>{
    //Load login page
    res.render("login.ejs");
  });

module.exports=router;