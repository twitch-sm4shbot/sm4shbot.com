'use strict'

const REDIS_HOST = process.env.SB_REDIS_HOST || 'localhost'
const REDIS_PORT = process.env.SB_REDIS_PORT || 6379
const SESSION_SECRET = process.env.SB_SESSION_SECRET
const BOT_SOCKET_URL = process.env.SB_BOT_SOCKET_URL
const CLIENT_ID = process.env.SB_CLIENT_ID
const CLIENT_SECRET = process.env.SB_CLIENT_SECRET
const CALLBACK_BASE_URL = process.env.SB_CALLBACK_BASE_URL
const PORT = process.env.SB_PORT

if (!REDIS_HOST) {
  throw new Error('Missing SB_REDIS_HOST.')
}

if (!REDIS_PORT) {
  throw new Error('Missing SB_REDIS_PORT.')
}

if (!SESSION_SECRET) {
  throw new Error('Missing SB_SESSION_SECRET.')
}

if (!BOT_SOCKET_URL) {
  throw new Error('Missing SB_BOT_SOCKET_URL.')
}

if (!CLIENT_ID) {
  throw new Error('Missing SB_CLIENT_ID.')
}

if (!CLIENT_SECRET) {
  throw new Error('Missing SB_CLIENT_SECRET.')
}

if (!CALLBACK_BASE_URL) {
  throw new Error('Missing SB_CALLBACK_BASE_URL.')
}

if (!PORT) {
  throw new Error('Missing SB_PORT.')
}

const debug = require('debug')
const path = require('path')

const log = {
  express: debug('sb:info:express')
, socket: debug('sb:info:socket')
}

const express = require('express')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const expressSession = require('express-session')
const RedisStore = require('connect-redis')(expressSession)
const session = require('express-session')({
  store: new RedisStore({
    host: REDIS_HOST
  , port: REDIS_PORT
  })
, secret: SESSION_SECRET
})
const passport = require('passport')
const TwitchStrategy = require('passport-twitch').Strategy
const app = express()
const http = require('http').createServer(app)
const io = require('socket.io')(http)
const ioSession = require('socket.io-express-session')
const botSocket = require('socket.io-client')(BOT_SOCKET_URL)

const SOCKET_EVENTS = [
  'on'
, 'off'
, 'set'
, 'open'
, 'close'
, 'clear'
, 'add'
, 'remove'
, 'start'
, 'forfeit'
, 'win'
, 'loss'
]

const PATH_FRONTEND = path.join(__dirname, '..', 'frontend')
const PATH_DIST = path.join(__dirname, '..', 'dist')
const PATH_BASE_JS = path.join(PATH_DIST, 'base.bundle.js')
const PATH_GA_JS = path.join(PATH_DIST, 'ga.js')

var channels = []

app.set('views', PATH_FRONTEND)
app.set('view engine', 'jade')

app.use(bodyParser.urlencoded({extended: true}))
app.use(cookieParser())
app.use(session)
app.use(passport.initialize())
app.use(passport.session())

passport.use(new TwitchStrategy(
  {
    clientID: CLIENT_ID
  , clientSecret: CLIENT_SECRET
  , callbackURL: `${CALLBACK_BASE_URL}/oauth`
  , scope: 'user_read'
  }
, function strategyCallback(accessToken, refreshToken, profile, done) {
    botSocket.emit('join', profile.username)
    return done(null, {
      username: profile.username
    , email: profile.email
    , id: profile.id
    , avatar: profile._json.logo
    })
  }
))

passport.serializeUser(function serializeUserCallback(user, done) {
  done(null, user)
})

passport.deserializeUser(function deserializeUserCallback(user, done) {
  done(null, user)
})

app.get('/base.js', function serveBaseJs(request, response) {
  response.sendFile(PATH_BASE_JS)
  log.express(`Served /base.js -> ${PATH_BASE_JS}`)
})

app.get('/login', passport.authenticate('twitch'))

app.get(
  '/oauth'
, passport.authenticate('twitch', {failureRedirect: '/'})
, function serveOauth(request, response) {
    var session
    var passport
    var user

    if (
       (session = request.session)
    && (passport = session.passport)
    && (user = passport.user)
    ) {
      return response.redirect(`/${user.username}`)
    }

    response.redirect('/')
  }
)

app.get('/ga.js', function serveGa(request, response) {
  response.sendFile(PATH_GA_JS)
})

app.get('/', function serveIndex(request, response) {
  response.render('base')
  log.express(`Served /* -> base.jade`)
})

app.get('*', function serveWildcard(request, response) {
  var session
  var passport

  if (
     (session = request.session)
  && (passport = session.passport)
  && (passport.user)
  ) {
    response.render('base')
    log.express(`Served /* -> base.jade`)
    return
  }

  response.redirect('/login')
})

io.use(ioSession(session, {autoSave: true}))

io.on('connection', function handleConnection(socket) {
  var session
  var passport
  var user

  if (
     (session = socket.handshake.session)
  && (passport = session.passport)
  && (user = passport.user)
  ) {
    socket.emit('login', user)

    SOCKET_EVENTS.forEach(function socketEventIterator(event) {
      socket.on(event, function handleSocketEvent(data) {
        const username = user.username

        const length = channels.length
        var channel
        for (let i = 0; i < length; i++) {
          if (channels[i].name === data.channel) {
            channel = channels[i]
            break
          }
        }

        if (
           channel
        && (channel.trusted[username] === 'admin' || channel.name === username)
        ) {
          botSocket.emit(event, data)
        }
      })
    })
  }
})

botSocket.on('connect', function handleBotConnect() {
  log.socket('Connected.')
})

botSocket.on('update', function handleBotUpdate(data) {
  log.socket('Received update:', JSON.stringify(data, false, 2))

  channels = data
  io.emit('update', data)
})

const server = http.listen(PORT, function listen() {
  const address = server.address()

  const host = address.address
  const port = address.port

  log.express(`Listening on ${host}:${port}`)
})
