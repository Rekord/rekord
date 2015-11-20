var config        = require('../config');
var IdMap         = require('./IdMap');
var CircularArray = require('./CircularArray');

/**
 * Instantiates a new Channel given it's ID.
 * 
 * @param any id
 *   The ID of the Channel.
 */
function Channel(id)
{
  this.id = id;
  this.clients = new IdMap();
  this.publishes = new CircularArray( config.sendLastPublishesOnJoin );
}

Channel.prototype = 
{

  /**
   * @return The number of clients in this Channel.
   */
  get size()
  {
    return this.clients.size;
  },
  
  /**
   * Sends the given event and message to the clients in this Channel,
   * optionally skipping a client with the given skip ID.
   *
   * @param string event
   *   The event type to emit.
   * @param any message
   *   The message to send to the clients in this Channel.
   * @param string skip
   *   The id of the client to skip over if any.
   */
  emit: function(event, message, skip)
  {
    this.clients.each( skip, this, function(clientId, client) 
    {
      client.emit( event, message );
    });
  },
  
  /**
   * Adds the client to this Channel if it doesn't already exist in it.
   * 
   * @param Client client
   *   The Client to add to this channel.
   * @param any token
   *   The join token the Client sent over that will be sent out to 
   *   other clients in the Channel if configured.
   */
  join: function(client, token)
  {
    if (this.clients.add(client))
    {
      this.emit( 'join', { id: this.id, token: token }, client.id );
      
      if (config.sendExistingClientsOnJoin)
      {
        this.clients.each( client.id, this, function(clientId, otherClient)
        {
          client.emit( 'join', otherClient.tokens.at( this.id ) );
        });        
      }
      
      this.publishes.forEach(function(data) 
      {
        client.emit( 'publish', data );
      });
    }
  },
  
  /**
   * Removes the client from this Channel if it's in it and notifies other
   * clients in the Channel if configured.
   *
   * @param Client client
   *   The Client to remove from this channel.
   * @param any token
   *   The join token the Client sent over when they joined.
   */
  leave: function(client, token)
  {
    if (this.clients.remove(client))
    {  
      this.emit( 'leave', { id: this.id, token: token } );
    }
  },
  
  /**
   * Returns whether the given Client is in this channel.
   *
   * @param Client client
   *   The Client to check for subscription.
   * @return True if the client is subscribed to this Channel.
   */
  has: function(client)
  {
    return this.clients.has( client );
  },
  
  /**
   * Publishes the message to the channel. If this channel is keeping track of 
   * the last N publishes it will remember it and send it out to new joins.
   *
   * @param Client client
   *   The client who published the message.
   * @param any message
   *   The message to publish to the channel.
   */
  publish: function(client, message)
  {
    this.emit( 'publish', message, config.echoPublish ? false : client.id );
    
    this.publishes.add( message );
  }
	
};

// Export the Channel class.
module.exports = Channel;