var express=require("express");
var router=express.Router();
const admin = require('firebase-admin');

router.get('/', (req,res)=>{
  const sessionCookie = req.cookies.session || "";
  const userid = req.cookies.userid;

  admin
    .auth()
    .verifySessionCookie(sessionCookie, true /** checkRevoked */)
    .then(() => {

      // Get some necessart data from firestore database
      admin.firestore().collection('users').doc(userid).get().then((snapshot) => {
        const email = snapshot.data().email;
        const expirationDate = snapshot.data().expirationDate;
        const firstName = snapshot.data().firstName;
        const lastName = snapshot.data().lastName;
        const displayName = snapshot.data().displayName;
        const lastlogin = snapshot.data().expirationDate.lastlogin;

        // Check if expired
        const currentDate = new Date();
        const currentTimestamp = currentDate.getTime();
        var diff = (expirationDate - currentTimestamp)/(1000*60*60*24); //Difference in days
        var daysleft = diff.toFixed(1); //Days left in integer
        var expired=true;
        //If diff>0 still has some time left.
        if (diff > 0) {expired = false}

        res.render("profile.ejs", {email: email, expired: expired, daysleft:daysleft, lastName:lastName, firstName: firstName, displayName: displayName, lastlogin: lastlogin, userid: userid});
      })
    })
    .catch((error) => {
      res.redirect("/");
    });
  });

router.post('/', (req,res) => {
    const sessionCookie = req.cookies.session || "";
    
    admin
        .auth()
        .verifySessionCookie(sessionCookie, true /** checkRevoked */)
        .then(() => {
            res.end(JSON.stringify({ status: "success"}));
        })
        .catch((error) => {
          console.log(error)
            res.redirect("/");
        });
})

module.exports=router;