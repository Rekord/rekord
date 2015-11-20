var Promise = require('./lib/Promise');

module.exports = 
{
  /**
   * The port the application listens on.
   */
  port: 3000,
  
  /**
   * Whether or not to send a publish message back to the client who sent it.
   */
  echoPublish: false,
  
  /**
   * If this server should notify clients when other clients have joined or left
   * a channel. The client's token it used to subscribe is sent along with these
   * notifications so the client can identify them. If this is set to false
   * then tokens are ignored altogether in the system. TODO
   */
  sendJoinLeaveEvents: true,
  
  /**
   * Determines whether the client is notified with detailed information when they
   * try to performan an invalid action (invalid channel ID, join token, etc). For
   * production this should be false to keep hackers away from knowing how to take
   * advantage of the system. If false they will simply return a generic 
   * "System Error" message. TODO
   */
  detailedErrorMessage: true,
  
  /**
   * The maximum number of channels that can be created. TODO
   */
  maxChannels: -1,
  
  /**
   * The maximum number of clients that may connect. TODO
   */
  maxClients: -1,
  
  /**
   * If a client has sent an invalid channel ID, join token, or publish data
   * this determines whether the client is marked untrused and is no longer
   * sent any messages. TODO
   */
  ignoreInvalidClients: true,
  
  /**
   * The number of previous publishes to keep and send to a client when they join.
   */
  sendLastPublishesOnJoin: 0,
  
  /**
   * Whether or not to send all of the join tokens of current clients to the 
   * new client when they first join the channel.
   */
  sendExistingClientsOnJoin: true,
  
  /**
   * Requires that a client must be subscribed to a channel before they can publish in it.
   */
  requireSubscription: true,
  
  /**
   * Logs events (comment out console.log to disable)
   */
  debug: function()
  {
    console.log.apply( console, arguments );
  },
  
  /****************************************************************************
   *                C H A N N E L    I D    V A L I D A T I O N
   ****************************************************************************/
  
  /**
   * The data types that are valid channel IDs.
   * If the id is found not to be valid, a channel will not be created.
   */
  validIds: 
  {
    'number':     true,
    'string':     true,
    'boolean':    true,
    'object':     false,
    'undefined':  false
  },
  
  /**
   * A function which does further validation on a channel ID.
   * If the id is found not to be valid, a channel will not be created.
   */
  validateId: function(id)
  {
    var promise = new Promise( this );

    if ( this.validIds[ typeof id ] )
    {
      promise.$success(); 
    }
    else
    {
      promise.$failure();
    }

    return promise;
  },
  
  /****************************************************************************
   *             C L I E N T    T O K E N    V A L I D A T I O N
   ****************************************************************************/
  
  /**
   * The data types that are valid client tokens.
   * If a token is found to be not valid, the user does not join the channel.
   */
  validTokens:
  {
    'number':     true,
    'string':     true,
    'boolean':    true,
    'undefined':  true,
    'object':     false
  },
  
  /**
   * A function which does further validation on a client token.
   * If a token is found to be not valid, the user does not join the channel.  
   */
  validateToken: function(token)
  {
    var promise = new Promise( this );

    if ( this.validTokens[ typeof token ] )
    {
      promise.$success(); 
    }
    else
    {
      promise.$failure();
    }

    return promise;
  },
  
  /****************************************************************************
   *                 P U B L I S H    V A L I D A T I O N
   ****************************************************************************/
  
  /**
   * The data types that are valid to publish to other clients.
   */
  validPublish:
  {
    'number':     true,
    'string':     true,
    'boolean':    true,
    'undefined':  true,
    'object':     true
  },
  
  /**
   * A function which validates if a message by a client can be published on a channel.
   */
  validatePublish: function(message, client, channel)
  {
    var promise = new Promise( this );

    if ( this.validPublish[ typeof message ] )
    {
      promise.$success(); 
    }
    else
    {
      promise.$failure();
    }

    return promise;
  }
  
};
