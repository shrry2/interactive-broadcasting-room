const app = require('express')();
const bodyParser = require('body-parser');
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const cors = require('cors');

app.use(cors());
app.use(bodyParser.urlencoded({
    extended: true,
}));
app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;

let connections = [];

let adminIds = [];
let blockedIds = [];

const PSK = 'letmein';

const generateError = (message) => ({
  result: 'error',
  message,
});

app.get('/', (req, res) => {
  res.send('This is API only server. Please access https://takaki.takeu.ch/radio/hub/ to participate.');
});

app.post('/authorize', (req, res) => {
  if (req.body.key && req.body.key === PSK && req.body.socketId) {
    adminIds.push(req.body.socketId);
    return res.json({ result: 'ok' });
  }
  res.status(400);
  return res.json(generateError('キーまたはリクエストが不正です'));
});

app.get('/is_authorized', (req, res) => {
  if (!req.query.socketId) {
    res.status(400);
    return res.json(generateError('Socket ID が指定されていません'));
  }
  return res.json({ admin: adminIds.includes(req.query.socketId) });
});

const authRequired = (req, res, next) => {
  logConnections();
  if (!req.query.socketId || !adminIds.includes(req.query.socketId)) {
    res.status(400);
    return res.json(generateError('認証されていません'));
  }
  next();
};

const logConnections = () => {
  console.log('Connections: ' + connections.map((conn) => conn.id));
  console.log('Admin connections: ' + adminIds);
  console.log('Blocked connections: ' + blockedIds);
};

io.on('connection', (socket) => {
  console.log('a user connected: ' + socket.id);
  connections.push(socket);
  logConnections();

  socket.on('disconnect', (reason) => {
    console.log('a user disconnected: ' + socket.id + ' because ' + reason);
    connections = connections.filter((conn) => conn.id !== socket.id);
    blockedSockets = blockedIds.filter((id) => id !== socket.id);
    adminIds = adminIds.filter((id) => id !== socket.id);
    logConnections();
  });

  socket.on('PLAY_SE', (data) => {
    console.log('play sound: ' + data.sound + ' - ' + socket.id);
    if (blockedIds.includes(socket.id)) {
      // blocked ID
    }
    connections.filter((conn) => adminIds.includes(conn.id)).forEach((c) => {
      c.emit('REQUEST_RECEIVED', {
        action: 'PLAY_SE',
        fileName: data.sound,
        listenerName: data.radioName,
      });
    });
    setTimeout(() => {
      socket.emit('REQUEST_RESULT', {
        result: 'ok',
      });
    }, 1000);
  });
});

http.listen(PORT, () => {
  console.log(`listening on port ${PORT}`);
});
