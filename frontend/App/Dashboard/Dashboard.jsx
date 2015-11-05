'use strict'

const moment = require('moment')
const React = require('react')

module.exports = React.createClass({
  propTypes: {
    channel: React.PropTypes.object
  , emit: React.PropTypes.func
  , strings: React.PropTypes.object
  , user: React.PropTypes.object
  }
, getInitialState: function getInitialState() {
    return {}
  }
, queueMapper: function queueMapper(item) {
    const props = this.props
    const challenger = item[1]

    function removeChallenger() {
      props.emit('remove', {
        channel: props.channel.name
      , username: challenger.username
      })
    }

    return (
      <tr>
        <td>{challenger.username}</td>
        <td>{challenger.nnid}</td>
        <td>{challenger.ingameName}</td>
        <td
          style={{textAlign: 'right'}}
        >
          <button
            className='btn-floating btn-medium waves-effect waves-light red'
            onClick={removeChallenger}
          >
            <i className='material-icons'>delete</i>
          </button>
        </td>
      </tr>
    )
  }
, matchReducer: function matchReducer(result, match) {
    if (match.isForfeited) {
      return result
    }

    const firstTo = match.firstTo

    if (firstTo === match.wins) {
      result.wins++
    } else if (firstTo === match.losses) {
      result.losses++
    }

    return result
  }
, saveSettings: function saveSettings(event) {
    event.preventDefault()

    const channel = this.props.channel

    const form = event.target
    const firstToViewer = form.querySelector('#firstToViewer')
    const firstToSub = form.querySelector('#firstToSub')
    const limit = form.querySelector('#limit')

    this.emit('set', {
      variable: 'firstToViewer'
    , value: firstToViewer.value || channel.firstTo
    })

    this.emit('set', {
      variable: 'firstToSub'
    , value: firstToSub.value || channel.firstToSub || channel.firstTo
    })

    this.emit('set', {
      variable: 'limit'
    , value: limit.value || channel.limit
    })

    firstToViewer.value = null
    firstToSub.value = null
    limit.value = null
  }
, emit: function emit(event, data) {
    data = data || {}
    data.channel = this.props.channel.name
    this.props.emit(event, data)
  }
, emitOn: function emitOn() {
    this.emit('on')
  }
, emitOff: function emitOff() {
    this.emit('off')
  }
, emitOpen: function emitOpen() {
    this.emit('open')
  }
, emitOpenSubs: function emitOpenSubs() {
    this.emit('open', {subs: true})
  }
, emitClose: function emitClose() {
    this.emit('close')
  }
, emitStart: function emitStart() {
    this.emit('start')
  }
, emitGameWin: function emitGameWin() {
    this.emit('win')
  }
, emitGameLoss: function emitGameLoss() {
    this.emit('loss')
  }
, emitForfeit: function emitForfeit() {
    this.emit('forfeit')
  }
, emitAdd: function emitAdd(event) {
    event.preventDefault()

    const form = event.target
    const username = form.querySelector('#addUsername')
    const nnid = form.querySelector('#addNnid')
    const ingameName = form.querySelector('#addIngameName')

    this.emit('add', {
      username: username.value
    , nnid: nnid.value
    , ingameName: ingameName.value
    })

    username.value = null
    nnid.value = null
    ingameName.value = null
  }
, render: function render() {
    const strings = this.props.strings
    const user = this.props.user
    const channel = this.props.channel

    if (!user || !channel) {
      return (
        <section
          className='container flow-text'
          style={{paddingTop: '10em'}}
        >
          <div className='progress'>
            <div className='indeterminate'></div>
          </div>   
        </section>
      )
    }
    
    const trusted =
       channel.name === user.username
    || channel.trusted[user.username] === 'admin'

    const record = channel.matches.reduce(
      this.matchReducer
    , {wins: 0, losses: 0}
    )

    if (!channel.active) {
      return (
        <section className='container flow-text'>
          <div className='row'>
            <section className='col s12'>
              <h1>{strings.title}</h1>
              <img
                src={user.avatar}
                style={{
                  marginRight: '0.5em'
                , verticalAlign: 'middle'
                , borderRadius: '50%'
                , width: '3em'
                , height: '3em'
                }}
              />
              <b>{`@${user.username}`}</b>
              {` ${strings.on} `}
              <b>{`#${channel.name} (${record.wins} - ${record.losses})`}</b>
              <button
                className='btn waves-effect waves-light green accent-3'
                onClick={this.emitOn}
                style={{
                  marginLeft: '0.5em'
                , marginRight: '0.5em'
                , display: !trusted ? 'none' : undefined
                }}
              >{strings.activate}</button>
            </section>
          </div>
        </section>
      )
    }

    const currentMatch = channel.currentMatch
    var currentMatchInfo
    if (currentMatch) {
      const challenger = currentMatch.challenger
      const duration = moment.duration(
        new Date().valueOf() - currentMatch.createdAt
      )
      const minutes = duration.minutes()
      const seconds = duration.seconds()
      const secondsFormatted = seconds < 10 ? `0${seconds}` : seconds
      const subscriber = challenger.isSubscriber
        ? (<b className='green-text'>{strings.currentMatch.subscriber}<br/></b>)
        : undefined

      currentMatchInfo = (
        <article>
          <p>
            {subscriber}
            {`${strings.currentMatch.username}: `}
            <b>{`@${challenger.username}`}</b>
            <br/>
            {`${strings.currentMatch.nnid}: `}
            <b>{challenger.nnid}</b>
            <br/>
            {`${strings.currentMatch.ingameName}: `}
            <b>{challenger.ingameName}</b>
            <br/>
            {`${strings.currentMatch.record}: `}
            <b>{`${currentMatch.wins} - ${currentMatch.losses}`}</b>
            <br/>
            {`${strings.currentMatch.firstTo}: `}
            <b>{currentMatch.firstTo}</b>
            <br/>
            {`${strings.currentMatch.time}: `}
            <b>{`${minutes}:${secondsFormatted}`}</b>
          </p>
          <p>
            <button
              className='btn waves-effect waves-light green accent-3'
              onClick={this.emitGameWin}
              style={{marginRight: '0.5em'}}
            >{strings.currentMatch.win}</button>
            <button
              className='btn waves-effect waves-light red accent-3'
              onClick={this.emitGameLoss}
              style={{marginRight: '0.5em'}}
            >{strings.currentMatch.loss}</button>
            <button
              className='btn waves-effect waves-light orange accent-3'
              onClick={this.emitForfeit}
            >{strings.currentMatch.forfeit}</button>
          </p>
        </article>
      )
    } else {
      currentMatchInfo = (
        <p>
          <i>{strings.currentMatch.waiting}</i>
        </p>
      )
    }

    const queue = channel.queue
    var onDeckInfo
    var challengerListInfo = []
    if (queue.length) {
      const onDeckChallenger = queue[0][1]
      const startGame = !currentMatch
        ? <button
            className='btn waves-effect waves-light green accent-3'
            onClick={this.emitStart}
            style={{
              marginRight: '0.5em'
            , display: !trusted ? 'none' : undefined
            }}
          >{strings.onDeck.start}</button>
        : undefined

      onDeckInfo = (
        <p>
          {`${strings.onDeck.username}: `}
          <b>{`@${onDeckChallenger.username}`}</b>
          <br/>
          {`${strings.onDeck.nnid}: `}
          <b>{`${onDeckChallenger.nnid}`}</b>
          <br/>
          {`${strings.onDeck.ingameName}: `}
          <b>{`${onDeckChallenger.ingameName}`}</b>
          <br/><br/>
          {startGame}
        </p>
      )

      challengerListInfo = queue.map(this.queueMapper)
    } else {
      onDeckInfo = (
        <p>
          <i>{strings.onDeck.empty}</i>
        </p>
      )
    }

    var listState
    if (trusted) {
      if (!channel.open) {
        listState = (
          <p>
            <button
              className='btn waves-effect waves-light green accent-3'
              onClick={this.emitOpen}
              style={{
                marginRight: '0.5em'
              , display: !trusted ? 'none' : undefined
              }}
            >{strings.challengerList.open}</button>
            <button
              className='btn waves-effect waves-light orange accent-3'
              onClick={this.emitOpenSubs}
              style={{
                display: !trusted ? 'none' : undefined
              }}
            >{strings.challengerList.openSubs}</button>
          </p>
        )
      } else if (channel.subsOnly) {
        listState = (
          <p>
            <button
              className='btn waves-effect waves-light green accent-3'
              onClick={this.emitOpen}
              style={{
                marginRight: '0.5em'
              , display: !trusted ? 'none' : undefined
              }}
            >{strings.challengerList.everyone}</button>
            <button
              className='btn waves-effect waves-light red accent-3'
              onClick={this.emitClose}
              style={{
                display: !trusted ? 'none' : undefined
              }}
            >{strings.challengerList.close}</button>
          </p>
        )
      } else {
        listState = (
          <p>
            <button
              className='btn waves-effect waves-light orange accent-3'
              onClick={this.emitOpenSubs}
              style={{
                marginRight: '0.5em'
              , display: !trusted ? 'none' : undefined
              }}
            >{strings.challengerList.subs}</button>
            <button
              className='btn waves-effect waves-light red accent-3'
              onClick={this.emitClose}
              style={{
                display: !trusted ? 'none' : undefined
              }}
            >{strings.challengerList.close}</button>
          </p>
        )
      }
    }

    return (
      <section className='container flow-text'>
        <div className='row'>
          <section className='col s12'>
            <h1>{strings.title}</h1>
            <img
              src={user.avatar}
              style={{
                marginRight: '0.5em'
              , verticalAlign: 'middle'
              , borderRadius: '50%'
              , width: '3em'
              , height: '3em'
              }}
            />
            <b>{`@${user.username}`}</b>
            {` ${strings.on} `}
            <b>{`#${channel.name} (${record.wins} - ${record.losses})`}</b>
            <button
              className='btn waves-effect waves-light red accent-3'
              onClick={this.emitOff}
              style={{
                marginLeft: '0.5em'
              , marginRight: '0.5em'
              , display: !trusted ? 'none' : undefined
              }}
            >{strings.deactivate}</button>
          </section>
        </div>
        <div className='row'>
          <section
            className='col m12 l8'
          >
            <h4>{strings.currentMatch.title}</h4>
            {currentMatchInfo}
          </section>
          <section className='col m12 l4'>
            <h4>{strings.onDeck.title}</h4>
            {onDeckInfo}
          </section>
        </div>
        <div
          className='row'
          style={{
            display: !trusted ? 'none' : undefined
          }}
        >
          <section
            className='col s12'
          >
            <h4>{strings.addChallenger.title}</h4>
            <form onSubmit={this.emitAdd}>
              <div className='row'>
                <div className='col s6 m4 input-field'>
                  <input
                    className='validate'
                    id='addUsername'
                    required
                    type='text'
                  />
                  <label
                    htmlFor='addUsername'
                  >{strings.addChallenger.username}</label>
                </div>
                <div className='col s6 m3 input-field'>
                  <input
                    className='validate'
                    id='addNnid'
                    required
                    type='text'
                  />
                  <label
                    htmlFor='addNnid'
                  >{strings.addChallenger.nnid}</label>
                </div>
                <div className='col s8 m4 input-field'>
                  <input
                    className='validate'
                    id='addIngameName'
                    required
                    type='text'
                  />
                  <label
                    htmlFor='addIngameName'
                  >{strings.addChallenger.ingameName}</label>
                </div>
                <div className='col s4 m1' style={{textAlign: 'left'}}>
                  <button
                    className={
                      `btn-floating btn-medium waves-effect waves-light
                      green accent-3`
                    }
                    style={{marginTop: '0.75em'}}
                  >
                    <i className='material-icons'>add</i>
                  </button>
                </div>
              </div>
            </form>
          </section>
        </div>
        <div
          className='row'
          style={{
            display: !trusted ? 'none' : undefined
          }}
        >
          <section
            className='col s12'
          >
            <h4>{strings.settings.title}</h4>
            <form onSubmit={this.saveSettings}>
              <div className='row'>
                <div className='col s4 m2 input-field'>
                  <input
                    className='validate'
                    id='firstToViewer'
                    placeholder={channel.firstTo}
                    type='number'
                  />
                  <label className='active' htmlFor='firstToViewer'>
                    {strings.settings.firstToViewer}
                  </label>
                </div>
                <div className='col s4 m2 input-field'>
                  <input
                    className='validate'
                    id='firstToSub'
                    placeholder={channel.firstToSub || channel.firstTo}
                    type='number'
                  />
                  <label className='active' htmlFor='firstToSub'>
                    {strings.settings.firstToSub}
                  </label>
                </div>
                <div className='col s4 m2 input-field'>
                  <input
                    className='validate'
                    id='limit'
                    placeholder={channel.limit}
                    type='number'
                  />
                  <label className='active' htmlFor='limit'>
                    {strings.settings.limit}
                  </label>
                </div>
                <div className='col s4 m1' style={{textAlign: 'left'}}>
                  <button
                    className={
                      `btn-floating btn-medium waves-effect waves-light
                      green accent-3`
                    }
                    style={{marginTop: '0.75em'}}
                  >
                    <i className='material-icons'>save</i>
                  </button>
                </div>
              </div>
            </form>
          </section>
        </div>
        <div className='row'>
          <section className='col s12'>
            <h4>{
              `${strings.challengerList.title}
              (${queue.length}/${channel.limit})`
            }</h4>
            {listState}
            <table>
              <thead>
                <tr>
                  <th>{strings.challengerList.username}</th>
                  <th>{strings.challengerList.nnid}</th>
                  <th>{strings.challengerList.ingameName}</th>
                </tr>
              </thead>
              <tbody>{challengerListInfo}</tbody>
            </table>
          </section>
        </div>
      </section>
    )
  }
})
