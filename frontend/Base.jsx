'use strict'

const React = require('react')
const ReactDOM = require('react-dom')

const App = require('./App/App.jsx')

ReactDOM.render(
  <App settingsPrefix='sb_' socketUrl={process.env.SOCKET_URL}/>
, document.body.querySelector('#app')
)
