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
          <img
            alt='Build Status'
            src='https://api.travis-ci.org/twitch-sm4shbot/sm4shbot.com.svg'
          />&nbsp;
          <img
            alt='npm version'
            src='https://badge.fury.io/js/sm4shbot.com.svg'
          />&nbsp;
          <img
            alt='Dependencies'
            src='https://david-dm.org/twitch-sm4shbot/sm4shbot.com.svg'
          />
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
          <h4>{strings.donate.title}</h4>
          <p>{strings.donate.description}</p>
          <p>
            <form action="https://www.paypal.com/cgi-bin/webscr" method="post" target="_top">
              <input name="cmd" type="hidden" value="_s-xclick"/>
              <input name="encrypted" type="hidden" value="-----BEGIN PKCS7-----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-----END PKCS7-----"/>
              <input alt="PayPal - The safer, easier way to pay online!" border="0" name="submit" src="https://www.paypalobjects.com/en_US/i/btn/btn_donateCC_LG.gif" type="image"/>
              <img alt="" border="0" height="1" src="https://www.paypalobjects.com/en_US/i/scr/pixel.gif" width="1"/>
            </form>
          </p>
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
