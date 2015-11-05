'use strict'

const React = require('react')

module.exports = React.createClass({
  propTypes: {
    channels: React.PropTypes.array
  , strings: React.PropTypes.object
  }
, getInitialState: function getInitialState() {
    return {}
  }
, render: function render() {
    const strings = this.props.strings

    const channels = this.props.channels.reduce(function(result, channel) {
      if (channel.active) {
        const currentMatch = channel.currentMatch
        const matchStatus = currentMatch
          ? `${currentMatch.wins} - ${currentMatch.losses}`
          : 'Waiting for challenger.'
        const record = channel.matches.reduce(function(result, match) {
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
        }, {wins: 0, losses: 0})

        result.push(
          <li key={channel.name}>
            <a
              href={`http://twitch.tv/${channel.name}`}
            >{channel.name}</a>
            {` | ${strings.record}: `}
            <b>{`${record.wins} - ${record.losses}`}</b>
            {` | ${strings.currentMatch}: `}
            <b>{matchStatus}</b>
          </li>
        )
      }

      return result
    }, [])

    return (
      <section className='container flow-text'>
        <section>
          <h1>{strings.title}</h1>
          <p>{strings.description}</p>
        </section>
        <section>
          <h4>{strings.gettingStarted.title}</h4>
          <p>
            {`${strings.gettingStarted.descriptionBefore} `}
            <a
              href='http://twitch.tv/twitch_sm4shbot'
              target='_blank'
            >@twitch_sm4shbot</a>
            {` ${strings.gettingStarted.descriptionMiddle} `}
            <a href='/login'>{strings.gettingStarted.signin}</a>
            {` ${strings.gettingStarted.descriptionAfter}`}
          </p>
          <p>
            {`${strings.gettingStarted.shareBefore} `}
            <b>{strings.gettingStarted.shareLink}</b>
            {` ${strings.gettingStarted.shareAfter}`}
          </p>
          <p><i>{strings.gettingStarted.shareNote}</i></p>
          <p>
            {`${strings.gettingStarted.docsBefore} `}
            <a
              href='https://github.com/twitch-sm4shbot/twitch-sm4shbot'
              target='_blank'
            >
              {strings.gettingStarted.docsLink}
            </a>
            {` ${strings.gettingStarted.docsAfter}`}
          </p>
        </section>
        <section>
          <h4>{strings.contact.title}</h4>
          <ul>
            <li>
              Twitter: &nbsp;
              <a
                href='https://twitter.com/sm4shbot'
                target='_blank'
              >@sm4shbot</a>
            </li>
            <li>
              Reddit: &nbsp;
              <a
                href='https://reddit.com/r/sm4shbot'
                target='_blank'
                >/r/sm4shbot</a>
            </li>
            <li>
              E-Mail: &nbsp;
              <a
                href='mailto:help@sm4shbot.com'
                target='_blank'
              >help@sm4shbot.com</a>
            </li>
            <li>
              Github: &nbsp;
              <a
                href='https://github.com/twitch-sm4shbot/support'
                target='_blank'
              >twitch-sm4shbot/support</a>
            </li>
          </ul>
        </section>
        <section>
          <h4>{strings.liveChannels.title}</h4>
          <p>
            {strings.liveChannels.description}
          </p>
          <ul>{channels}</ul>
        </section>
        <section
          style={{
            marginTop: '3em'
          , marginBottom: '1em'
          }}
        >
          <a
            href='http://suitupalex.com'
            style={{
              fontSize: '0.8em'
            }}
            target='_blank'
          >
            Powered by The Electric Gentleman
          </a>
        </section>
      </section>
    )
  }
})
