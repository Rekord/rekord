var app            = require('express')();
var http           = require('http').Server(app);
var io             = require('socket.io')(http);

var config         = require('./config');
var IdMap          = require('./lib/IdMap');
var Channel        = require('./lib/Channel');
var Client         = require('./lib/Client');
var ChannelFactory = require('./lib/ChannelFactory');

/**
 * Listen for new connections, and create a client when connected.
 */
io.on('connection', function(socket)
{
  var client = new Client( socket );
  
  config.debug( 'Client Connected', socket.id );
  
  /**
   * Handle when the client tries to subscribe to a channel.
   */
  socket.on('subscribe', function(msg) 
  {
    var token = msg.token;
    var channelId = msg.id;

    config.validateToken( token ).then(
      function onValidToken()
      {
        ChannelFactory.get( channelId, true ).then(
          function onChannel(channel)
          {
            client.join( channel, token );

            config.debug( 'Client', socket.id, 'subscribed to channel', channelId, 'with token', token );
          }
        );
      },
      function onInvalidToken()
      {
        config.debug( 'Client', socket.id, 'sent invalid token', token );
      }
    );
  });
  
  /**
   * Handle when the client tries to unsubscribe from a channel.
   */
  socket.on('unsubscribe', function(msg) 
  {
    var channelId = msg.id;
    
    ChannelFactory.get( channelId, false ).then(
      function onChannel(channel)
      {
        if (channel.has( client ) && client.subscribed( channel ))
        {
          client.leave( channel );
                  
          if (channel.size === 0)
          {
              ChannelFactory.remove( channel );
          }
        
          config.debug( 'Client', socket.id, 'unsubscribed from channel', channelId );
        }
        else
        {
          config.debug( 'Client', socket.id, 'does not participate in the channel', channelId, 'so they cannot unsubscribe' );
        }
      },
      function onInvalidChannel()
      {
        config.debug( 'Client', socket.id, 'cannot unsubscribe from the channel', channelId, ', it does not exist' );
      }
    );
    
  });
  
  /**
   * Handle when the client tries to publish to a channel.
   */
  socket.on('publish', function(msg) 
  {
    var data = msg.data;
    var channelId = msg.id;

    ChannelFactory.get( channelId, false ).then(
      function onChannel(channel)
      {
        // if you need to be subscribed to publish...
        if (!config.requireSubscription || client.subscribed( channel ))
        {
          config.validatePublish( data, client, channel ).then(
            function onValidPublish()
            {
              // if it's a valid publish
              channel.publish( client, 
              {
                id: channelId,
                data: data
              });
              
              config.debug( 'Client', socket.id, 'published to channel', channelId, ':', data );
            },
            function onInvalidPublish()
            {
              config.debug( 'Client', socket.id, 'sent an invalid publish to channel', channelId, ':', data );
            }
          );
        }
        else
        {
          config.debug( 'Client', socket.id, 'tried to publish to channel', channelId, 'but is not subscribed' );
        }
      },
      function onInvalidChannel()
      {
        config.debug( 'Client', socket.id, 'tried to publish to channel', channelId, 'which does not exist' );
      }
    );
  });
  
  /**
   * Handle when a client disconnects from the server.
   */
  socket.on('disconnect', function() 
  {
    client.destroy();
    
    config.debug( 'Client Disconnected', socket.id );
  });

});

http.listen( config.port );