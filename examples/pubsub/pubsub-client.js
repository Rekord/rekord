/**
 * Establishes a connection to the given HTTP URL to enable subscribing and publishing to channels.
 * 
 * @param string url
 *   The URL to connect to.
 */
function PubSub(url)
{
  this.channels = {};
  this.url = url;
  this.pending = [];
  this.listenToReady();
}


PubSub.prototype = 
{
 
  /**
   * Listens for when the document is ready.
   */
  listenToReady: function()
  {
    PubSub.ready( this.handleReady, this );
  },

  /**
   * Handles the document beind ready.
   */
  handleReady: function()
  {
    this.socket = io( this.url );
    this.socket.on('join', this.onMessage('onjoin', 'token'));
    this.socket.on('leave', this.onMessage('onleave', 'token'));
    this.socket.on('publish', this.onMessage('onpublish', 'data'));
    this.socket.on('error', this.onMessage('onerror', 'message'));

    this.listenToClose();

    for (var i = 0; i < this.pending.length; i++)
    {
      var p = this.pending[ i ];

      p.method.apply( p.context, p.arguments );
    }

    this.pending.length = 0;
  },

  /**
   * Listens for when the window closes. We need to close the socket connection!
   */
  listenToClose: function()
  {
    PubSub.on( window, 'beforeunload', this.handleClose, this );
  },

  /**
   * Handles the window closing.
   */
  handleClose: function()
  {
    this.socket.close();
  },

  /**
   * Determines whether the socket is ready, if it's not then the method is 
   * queued and true is returned. If the socket is ready then false is returned.
   */
  handlePending: function(that, method, args, dontQueue)
  {
    if ( this.socket ) 
    {
      return false;
    }

    this.pending.push(
    {
      context: that,
      method: method,
      arguments: Array.prototype.slice.call( args )
    });

    return true;
  },

  /**
   * Subscribe to the channel with the given ID while optionally sending over a token
   * which represents my subscription to the channel. This token can be sent to all
   * current and future subscribers to the channel as long as you're subscribed.
   *
   * @param any id
	 *   The ID of the channel to subscribe to.
   * @param any token
	 *   The token to send to subscribe to the channel. This token could be sent out
	 *   to other subscribers to the channel.
	 * @return The Channel subscribed to.
   */
  subscribe: function(id, token) 
  {
    // If this socket is ready, emit a subscribe. If it isn't ready, call this
    // function again once the socket is ready so we can emit a subscribe.
    if ( !this.handlePending( this, this.subscribe, arguments ) )
    {
      this.socket.emit('subscribe', 
      {
        id: id,
        token: token
      });
    }

    var channels = this.channels;

    if ( !(id in channels) )
    {
      channels[ id ] = new PubSubChannel( id, token, this );
    }
    
    return channels[ id ];
  },
  
  /**
   * Unsubscribes from all channels.
   */
  unsubscribe: function() 
  {
    // If the socket isn't ready, call this function once it is.
    if ( this.handlePending( this, this.unsubscribe, arguments ) )
    {
      return;
    }

    var channels = this.channels;

    for (var channelId in channels) 
    {
      channels[ channelId ].unsubscribe();

      delete channels[ channelId ];
    }
  },
  
  /**
   * Returns a function that listens for message emissions 
   * and notifies the proper channel with the correct data.
   *
   * @param string listener
   *     The function on the channel to invoke on emission.
   * @param string property
   *     The property on the received message to send to the channel's listening function.
   */
  onMessage: function(listener, property)
  {
    var channels = this.channels;
    
    return function(msg) 
    {
      if (msg.id && msg.id in channels) 
      {
        var channel = channels[ msg.id ];
        var callback = channel[ listener ];
        
        if (typeof callback === 'function')
        {
          callback.call( channel, msg[ property ] );
        }
      }
    };
  }
  
};

/**
 * Listens for a DOM event on the given element.
 */
PubSub.on = function(element, eventName, func, context)
{
  var onEvent = function() 
  {
    func.apply( context || this, arguments );
  };

  if ( element.addEventListener ) 
  {
    element.addEventListener( eventName, onEvent, false );
  }
  else if ( element.attachEvent ) 
  {
    element.attachEvent( 'on' + eventName, onEvent );
  }
  else
  {
    element[ 'on' + eventName ] = onEvent;
  }
};

/**
 * Listens for the document to be ready.
 */
PubSub.ready = function(func, funcContext)
{
  if ( document.readyState == 'complete' ) 
  {
    func.apply( funcContext || window );
  } 
  else 
  {
    PubSub.on( window, 'load', func, funcContext );
  }
};

/**
 *
 * @param any id
 * @param any token
 * @param PubSub pubsub
 */
function PubSubChannel(id, token, pubsub) 
{  
  this.id = id;
  this.token = token;
  this.pubsub = pubsub;
  this.onjoin = function(data) {};
  this.onleave = function(data) {};
  this.onpublish = function(data) {};
	this.onerror = function(message) {};
  this.subscribed = true;
}

PubSubChannel.prototype = 
{
   
  /**
   *
   * @param any data
   */
  publish: function(data) 
  {
    // If the socket isn't ready, call this function once it is.
    if ( this.pubsub.handlePending( this, this.publish, arguments ) )
    {
      return;
    }

    if (this.subscribed) 
    {
      this.pubsub.socket.emit('publish', 
      {
        id: this.id, 
        data: data
      });
    }
  },
  
  /**
   * 
   */
  unsubscribe: function() 
  {
    // If the socket isn't ready, call this function once it is.
    if ( this.pubsub.handlePending( this, this.unsubscribe, arguments ) )
    {
      return;
    }

    if ( !this.subscribed )
    {
      return;
    }

    this.subscribed = false;

    this.pubsub.socket.emit('unsubscribe', 
    {
      id: this.id
    });
    
    delete this.pubsub.channels[this.id];
  }
  
};