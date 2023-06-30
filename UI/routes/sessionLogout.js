var express=require("express");
var router=express.Router();
const admin = require('firebase-admin');

router.get("/",(req,res) => {
    res.clearCookie("session");
    res.clearCookie("data");
    res.clearCookie("userid")
    res.redirect("/");
});

module.exports=router;