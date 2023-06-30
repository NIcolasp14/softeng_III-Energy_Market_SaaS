var express=require("express");
var router=express.Router();
const admin = require('firebase-admin');

// When you get a get request (after login)
router.get('/', (req,res)=>{
  // Get session cookie and userid
  const sessionCookie = req.cookies.session || "";
  const userid = req.cookies.userid;

  // Authenticate (make sure session is valid)
  admin
    .auth()
    .verifySessionCookie(sessionCookie, true /** checkRevoked */)
    .then(() => {
      
      // Get some necessary data from firestore database
      admin.firestore().collection('users').doc(userid).get().then((snapshot) => {
        const email = snapshot.data().email;
        const expirationDate = snapshot.data().expirationDate;

        // Check if the user has expired and render dashboard page
        const currentDate = new Date();
        const currentTimestamp = currentDate.getTime();
        var diff = (expirationDate - currentTimestamp)/(1000*60*60*24); //Difference in days
        var daysleft = diff.toFixed(1); //Days left in integer
        var expired=true;
        //If diff>0 still has some time left.
        if (diff > 0) {expired = false}
        res.render("dashboard.ejs", {email: email, expired: expired, daysleft:daysleft});
      })
    })
    .catch((error) => {
      console.log(error)
      res.redirect("/");
    });
  });

module.exports=router;