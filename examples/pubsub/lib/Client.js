var IdMap          = require('./IdMap');
var Channel        = require('./Channel');
var ChannelFactory = require('./ChannelFactory');

/**
 * Instantiates a new Client given a socket.
 * 
 * @param socket.io socket
 */
function Client(socket)
{
  this.socket = socket;
  this.tokens = new IdMap();
}

Client.prototype = 
{
  
  /**
   * @return The id property of the Client inherited from the socket. This is 
   * used to store Clients in an IdMap.
   */
  get id() 
  {
    return this.socket.id;
  },
  
  /**
   * Emits the event and message to the Client.
   *
   * @param string event
   *   The type of event to emit.
   * @param any message
   *   The message to emit.
   */
  emit: function(event, message) 
  {
    this.socket.emit( event, message );
  },
  
  /**
   * Joins the given Channel with the given join token. If the Client is 
   * already subscribed to the Channel then this method has no effect.
   *
   * @param Channel channel
   *   The Channel to join if not already joined.
   * @param any token
   *   The token used to join the channel.
   */
  join: function(channel, token) 
  {
    if (this.tokens.add( channel, token ))
    {
      channel.join( this, token );
    }
  },
  
  /**
   * Leaves the given Channel. The token used to join the Channel is sent to
   * all of the clients in the Channel with a leave event if configured. If the
   * Client isn't subscribed to the Channel then this method has no effect.
   *
   * @param Channel channel
   *   The Channel to leave if subscribed.
   */
  leave: function(channel) 
  {
    if (this.tokens.has( channel ))
    {
      var token = this.tokens.take( channel );
      
      channel.leave( this, token );  
    }
  },
  
  /**
   * Determines whether this Client is subscribed to the given Channel.
   *
   * @param Channel channel
   *   The Channel to check for subscription.
   * @return True if the Client is subscribed to the given Channel.
   */
  subscribed: function(channel)
  {
    return this.tokens.has( channel );
  },
  
  /**
   * Destroys this Client by leaving all channels they're subscribed to.
   */
  destroy: function()
  {  
    var client = this;

    this.tokens.each(null, this, function(channelId, token)
    {
      ChannelFactory.get( channelId, false ).then(
        function onExistingChannel(channel)
        {
          channel.leave( client, token );
        }
      );
    });
  }
  
};

// Export the Client class.
module.exports = Client;