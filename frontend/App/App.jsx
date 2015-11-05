'use strict'

const debug = require('debug')
const io = require('socket.io-client')
const React = require('react')
const Landing = require('./Landing/Landing.jsx')
const Dashboard = require('./Dashboard/Dashboard.jsx')

const log = {
  info: debug('sb:info')
}

const LOCALES = require('./localization/locales.json')
const STRINGS = {
  'en-US': require('./localization/en/us.json')
}

module.exports = React.createClass({
  propTypes: {
    settingsPrefix: React.PropTypes.string
  , socketUrl: React.PropTypes.string
  }
, getInitialState: function getInitialState() {
    window.app = this

    var socket = {}
    if (typeof this.props.socketUrl === 'string') {
      socket = io(this.props.socketUrl)

      socket.on('connect', this.handleSocketConnect)
      socket.on('disconnect', this.handleSocketDisconnect)
      socket.on('update', this.handleSocketUpdate)
      socket.on('login', this.handleSocketLogin)
    }

    const locale = LOCALES.english.us
    const path = window.location.pathname.slice(1)

    return {
      currentView: path || 'landing'
    , locale: locale
    , socket: socket
    , strings: STRINGS[locale]
    , channels: []
    , user: {}
    }
  }
, emit: function emit(event, data) {
    this.state.socket.emit(event, data)
  }
, handleSocketConnect: function handleSocketConnect() {
    log.info('socket connected')
  }
, handleSocketDisconnect: function handleSocketDisconnect() {
    log.info('socket disconnected')
  }
, handleSocketUpdate: function handleSocketUpdate(channels) {
    this.setState({
      channels: channels
    })

    log.info('socket update', channels)
  }
  , handleSocketLogin: function handleSocketLogin(user) {
    this.setState({
      user: user
    })

    log.info('socket login', user)
  }
, render: function render() {
    const state = this.state
    const channels = state.channels
    const strings = state.strings
    const user = state.user

    var page

    switch (state.currentView) {
      case 'landing':
        page = (
          <Landing
            channels={channels}
            strings={strings.landing}
          />
        )
      break
      default:
        let channel
        const length = channels.length
        const username = state.currentView || user.username
        for (let i = 0; i < length; i++) {
          if (channels[i].name === username) {
            channel = channels[i]
            break
          }
        }

        page = (
          <Dashboard
            channel={channel}
            emit={this.emit}
            strings={strings.dashboard}
            user={user}
          />
        )
    }

    return (
      <div>{page}</div>
    )
  }
})
