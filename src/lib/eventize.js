
/**
 * Adds functions to the given object (or prototype) so you can listen for any 
 * number of events on the given object, optionally once. Listeners can be 
 * removed later.
 *
 * The following methods will be added to the given target:
 *
 *     target.on( events, callback, [context] )
 *     target.once( events, callback, [context] )
 *     target.off( events, callback )
 *     target.trigger( events, [a, b, c...] )
 *
 * Where... 
 * - `events` is a string of space delimited events.
 * - `callback` is a function to invoke when the event is triggered.
 * - `context` is an object that should be the `this` when the callback is 
 *   invoked. If no context is given the default value is the object which has 
 *   the trigger function that was invoked.
 *
 * @method eventize
 * @for Core
 * @param {Object} target The object to add `on`, `once`, `off`, and `trigger` 
 *    functions to.
 */
function eventize(target, secret)
{
  /**
   * **See:** {{#crossLink "Core/eventize:method"}}{{/crossLink}}
   * 
   * @class eventize
   */

  // Adds a listener to $this
  function onListeners($this, property, events, callback, context)
  {
    if ( !isFunction( callback ) )
    {
      return;
    }

    var events = toArray( events, ' ' );
    
    if ( !isDefined( $this[ property ] ) )
    {
      $this[ property ] = {};
    }
    
    for (var i = 0; i < events.length; i++)
    {
      if ( !isDefined( $this[ property ][ events[i] ] ) )
      {
        $this[ property ][ events[i] ] = [];
      }
      
      $this[ property ][ events[i] ].push( [ callback, context || $this ] );
    }
  };
  
  /**
   * Listens for every occurrence of the given events and invokes the callback
   * each time any of them are triggered.
   * 
   * @method on
   * @for eventize
   * @param {String|Array|Object} events
   * @param {Function} callback
   * @param {Object} [context]
   * @chainable
   */
  function on(events, callback, context)
  {
    onListeners( this, '$$on', events, callback, context );

    return this;
  }
  
  /**
   * Listens for the next occurrence for each of the given events and invokes
   * the callback when any of the events are triggered.
   * 
   * @method once
   * @for eventize
   * @param {String|Array|Object} events
   * @param {Function} callback
   * @param {Object} [context]
   * @chainable
   */
  function once(events, callback, context)
  {
    onListeners( this, '$$once', events, callback, context );

    return this;
  }

  function after(events, callback, context)
  {
    onListeners( this, '$$after', events, callback, context );

    return this;
  }
  
  // Removes a listener from an array of listeners.
  function offListeners(listeners, event, callback)
  {
    if (listeners && event in listeners)
    {
      var eventListeners = listeners[ event ];
      
      for (var k = eventListeners.length - 1; k >= 0; k--)
      {
        if (eventListeners[ k ][0] === callback)
        {
          eventListeners.splice( k, 1 );
        }
      }  
    }
  }

  // Deletes a property from the given object if it exists
  function deleteProperty(obj, prop)
  {
    if ( obj && prop in obj )
    {
      delete obj[ prop ];
    }
  }
  
  /**
   * Stops listening for a given callback for a given set of events.
   *
   * **Examples:**
   *
   *     target.off();           // remove all listeners
   *     target.off('a b');      // remove all listeners on events a & b
   *     target.off(['a', 'b']); // remove all listeners on events a & b
   *     target.off('a', x);     // remove listener x from event a
   * 
   * @method off
   * @for eventize
   * @param {String|Array|Object} [events]
   * @param {Function} [callback]
   * @chainable
   */
  function off(events, callback)
  {
    // Remove ALL listeners
    if ( !isDefined( events ) )
    {
      deleteProperty( this, '$$on' );
      deleteProperty( this, '$$once' );
      deleteProperty( this, '$$after' );
    }
    else
    {
      var events = toArray( events, ' ' );

      // Remove listeners for given events
      if ( !isFunction( callback ) )
      {
        for (var i = 0; i < events.length; i++)
        {
          deleteProperty( this.$$on, events[i] );
          deleteProperty( this.$$once, events[i] );
          deleteProperty( this.$$after, events[i] );
        }
      }
      // Remove specific listener
      else
      {
        for (var i = 0; i < events.length; i++)
        {
          offListeners( this.$$on, events[i], callback );
          offListeners( this.$$once, events[i], callback );
          offListeners( this.$$after, events[i], callback );
        }
      }
    }

    return this;
  }

  // Triggers listeneers for the given event
  function triggerListeners(listeners, event, args, clear)
  {
    if (listeners && event in listeners)
    {
      var eventListeners = listeners[ event ];
      var max = eventListeners.length;
     
      for (var i = 0; i < max; i++)
      {
        var callback = eventListeners[ i ];

        if ( callback )
        {
          callback[0].apply( callback[1], args );  
        }
      }
      
      if ( clear )
      {
        if ( eventListeners.length !== max )
        {
          listeners[ event ] = eventListeners.slice( max );  
        }
        else
        {
          delete listeners[ event ];  
        }
      }
    }
  }
  
  /**
   * Triggers a single event optionally passing an argument to any listeners.
   * 
   * @method trigger
   * @for eventize
   * @param {String} event
   * @param {Array} args
   * @chainable
   */
  function trigger(events, args)
  {
    var events = toArray( events, ' ' );

    for (var i = 0; i < events.length; i++)
    {
      var e = events[ i ];

      triggerListeners( this.$$on, e, args, false );
      triggerListeners( this.$$once, e, args, true );
      triggerListeners( this.$$after, e, args, false )
    }

    return this;
  }

  if ( secret )
  {
    target.$on = on;
    target.$once = once;
    target.$after = after;
    target.$off = off;
    target.$trigger = trigger;
  }
  else
  {
    target.on = on;
    target.once = once;
    target.after = after;
    target.off = off;
    target.trigger = trigger;
  }
};