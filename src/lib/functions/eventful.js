
function addEventFunction(target, functionName, events, secret)
{
  var on = secret ? '$on' : 'on';
  var off = secret ? '$off' : 'off';

  addMethod( target, functionName, function(callback, context)
  {
    var subject = this;
    var unlistened = false;

    function listener()
    {
      var result = callback.apply( context || subject, arguments );

      if ( result === false )
      {
        unlistener();
      }
    };

    function unlistener()
    {
      if ( !unlistened )
      {
        subject[ off ]( events, listener );
        unlistened = true;
      }
    }

    subject[ on ]( events, listener );

    return unlistener;
  });
}

/**
 * Adds functions to the given object (or prototype) so you can listen for any
 * number of events on the given object, optionally once. Listeners can be
 * removed later.
 *
 * The following methods will be added to the given target:
 *
 * ```
 * target.on( events, callback, [context] )
 * target.once( events, callback, [context] )
 * target.after( events, callback, [context] )
 * target.off( events, callback )
 * target.trigger( events, [a, b, c...] )
 * ```
 *
 * Where...
 * - `events` is a string of space delimited events.
 * - `callback` is a function to invoke when the event is triggered.
 * - `context` is an object that should be the `this` when the callback is
 *   invoked. If no context is given the default value is the object which has
 *   the trigger function that was invoked.
 *
 * @memberof Rekord
 * @param {Object} [target] -
 *    The object to add `on`, `once`, `off`, and `trigger` functions to.
 * @param {Boolean} [secret=false] -
 *    If true - the functions will be prefixed with `$`.
 */
function eventize(target, secret)
{

  var CALLBACK_FUNCTION = 0;
  var CALLBACK_CONTEXT = 1;
  var CALLBACK_GROUP = 2;

  var triggerId = 0;

  /**
   * A mixin which adds `on`, `once`, `after`, and `trigger` functions to
   * another object.
   *
   * @class Eventful
   * @memberof Rekord
   * @see Rekord.eventize
   */

   /**
    * A mixin which adds `$on`, `$once`, `$after`, and `$trigger` functions to
    * another object.
    *
    * @class Eventful$
    * @memberof Rekord
    * @see Rekord.eventize
    */

  // Adds a listener to $this
  function onListeners($this, property, events, callback, context)
  {
    if ( !isFunction( callback ) )
    {
      return noop;
    }

    var events = toArray( events, ' ' );
    var listeners = $this[ property ];

    if ( !listeners )
    {
      listeners = $this[ property ] = {};
    }

    for (var i = 0; i < events.length; i++)
    {
      var eventName = events[ i ];
      var eventListeners = listeners[ eventName ];

      if ( !eventListeners )
      {
        eventListeners = listeners[ eventName ] = [];
      }

      eventListeners.push( [ callback, context || $this, 0 ] );
    }

    return function ignore()
    {
      for (var i = 0; i < events.length; i++)
      {
        offListeners( listeners, events[ i ], callback );
      }
    };
  };

  /**
   * Listens for every occurrence of the given events and invokes the callback
   * each time any of them are triggered.
   *
   * @method on
   * @memberof Rekord.Eventful#
   * @param {String|Array} events -
   *    The event or events to listen to.
   * @param {Function} callback -
   *    The function to invoke when any of the events are invoked.
   * @param {Object} [context] -
   *    The value of `this` when the callback is invoked. If not specified, the
   *    reference of the object this function exists on will be `this`.
   * @return {Function} -
   *    A function to invoke to stop listening to all of the events given.
   */

  /**
   * Listens for every occurrence of the given events and invokes the callback
   * each time any of them are triggered.
   *
   * @method $on
   * @memberof Rekord.Eventful$#
   * @param {String|Array} events -
   *    The event or events to listen to.
   * @param {Function} callback -
   *    The function to invoke when any of the events are invoked.
   * @param {Object} [context] -
   *    The value of `this` when the callback is invoked. If not specified, the
   *    reference of the object this function exists on will be `this`.
   * @return {Function} -
   *    A function to invoke to stop listening to all of the events given.
   */

  function on(events, callback, context)
  {
    return onListeners( this, '$$on', events, callback, context );
  }

  /**
   * Listens for the first of the given events to be triggered and invokes the
   * callback once.
   *
   * @method once
   * @memberof Rekord.Eventful#
   * @param {String|Array} events -
   *    The event or events to listen to.
   * @param {Function} callback -
   *    The function to invoke when any of the events are invoked.
   * @param {Object} [context] -
   *    The value of `this` when the callback is invoked. If not specified, the
   *    reference of the object this function exists on will be `this`.
   * @return {Function} -
   *    A function to invoke to stop listening to all of the events given.
   */

  /**
   * Listens for the first of the given events to be triggered and invokes the
   * callback once.
   *
   * @method $once
   * @memberof Rekord.Eventful$#
   * @param {String|Array} events -
   *    The event or events to listen to.
   * @param {Function} callback -
   *    The function to invoke when any of the events are invoked.
   * @param {Object} [context] -
   *    The value of `this` when the callback is invoked. If not specified, the
   *    reference of the object this function exists on will be `this`.
   * @return {Function} -
   *    A function to invoke to stop listening to all of the events given.
   */

  function once(events, callback, context)
  {
    return onListeners( this, '$$once', events, callback, context );
  }

  function after(events, callback, context)
  {
    return onListeners( this, '$$after', events, callback, context );
  }

  // Removes a listener from an array of listeners.
  function offListeners(listeners, event, callback)
  {
    if (listeners && event in listeners)
    {
      var eventListeners = listeners[ event ];

      for (var k = eventListeners.length - 1; k >= 0; k--)
      {
        if (eventListeners[ k ][ CALLBACK_FUNCTION ] === callback)
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
      var triggerGroup = ++triggerId;

      for (var i = 0; i < eventListeners.length; i++)
      {
        var callback = eventListeners[ i ];

        if ( callback )
        {
          if ( callback[ CALLBACK_GROUP ] !== triggerGroup )
          {
            callback[ CALLBACK_GROUP ] = triggerGroup;
            callback[ CALLBACK_FUNCTION ].apply( callback[ CALLBACK_CONTEXT ], args );

            if ( callback !== eventListeners[ i ] )
            {
              i = -1;
            }
          }
        }
      }

      if ( clear )
      {
        delete listeners[ event ];
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
    addMethod( target, '$on', on );
    addMethod( target, '$once', once );
    addMethod( target, '$after', after );
    addMethod( target, '$off', off );
    addMethod( target, '$trigger', trigger );
  }
  else
  {
    addMethod( target, 'on', on );
    addMethod( target, 'once', once );
    addMethod( target, 'after', after );
    addMethod( target, 'off', off );
    addMethod( target, 'trigger', trigger );
  }
};
