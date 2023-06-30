const app = require('./index.js');
const https = require('https');
var fs = require('fs');
const path = require('path');

const port = Number(process.env.PORT || 4000);
//listen on port 4000

app.listen(port, () => console.log(` Secure Server running on port ${port}!`))
