const app = require('./index')

//initialize port
const port = Number(5500);

//open server
var server = app.listen(port, () => {
    console.log(`Accounts Service running on port ${port}!`);
});

//socket creation
var io = require('socket.io')(server);

app.set('socketio',io);