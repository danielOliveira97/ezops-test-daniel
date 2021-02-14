var express = require('express');
var bodyParser = require('body-parser')
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var mongoose = require('mongoose');

app.use(express.static(__dirname));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}))

var Message = mongoose.model('Message', {
  name: String,
  message: String
})

var DB_USER = process.env.DB_USER
var DB_NAME = process.env.DB_NAME
var DB_PASS = process.env.DB_PASS
var DB_HOST = process.env.DB_HOST

var dbUrl = `mongodb+srv://${DB_USER}:${DB_PASS}@${DB_HOST}/${DB_NAME}?retryWrites=true&w=majority`

app.get('/messages', (req, res) => {
  Message.find({}, (err, messages) => {
    res.send(messages);
  })
})


app.get('/messages/:user', (req, res) => {
  var user = req.params.user
  Message.find({
    name: user
  }, (err, messages) => {
    res.send(messages);
  })
})


app.post('/messages', async (req, res) => {
  try {
    var message = new Message(req.body);

    var savedMessage = await message.save()
    console.log('saved');

    var censored = await Message.findOne({
      message: 'badword'
    });
    if (censored)
      await Message.remove({
        _id: censored.id
      })
    else
      io.emit('message', req.body);
    res.sendStatus(200);
  } catch (error) {
    res.sendStatus(500);
    return console.log('error', error);
  } finally {
    console.log('Message Posted')
  }

})

io.on('connection', () => {
  console.log('a user is connected')
})

mongoose.connect(dbUrl, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}, (err) => {
  console.log('mongodb connected', err);
})

var server = http.listen(3000, () => {
  console.log('server is running on port', server.address().port);
});
