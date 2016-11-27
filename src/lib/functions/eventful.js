
function addEventFunction(target, functionName, events, secret)
{
  var on = secret ? '$on' : 'on';
  var off = secret ? '$off' : 'off';

  var eventFunction = function(callback, context)
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
    }

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
  };

  if (target.$methods)
  {
    Class.method( target, functionName, eventFunction );
  }
  else
  {
    Class.prop( target, functionName, eventFunction );
  }
}

function EventNode(before, callback, context, type, group)
{
  this.next = before ? before : this;
  this.prev = before ? before.prev : this;

  if ( before )
  {
    before.prev.next = this;
    before.prev = this;
  }

  this.callback = callback;
  this.context = context;
  this.type = type;
  this.group = group || 0;
}

EventNode.Types =
{
  Persistent: 1,
  Once: 2,
  After: 4
};

Class.create( EventNode,
{
  remove: function()
  {
    var next = this.next;
    var prev = this.prev;

    if ( next !== this )
    {
      prev.next = next;
      next.prev = prev;
      this.next = this.prev = this;
    }
  },

  hasType: function(type)
  {
    return (this.type & type) !== 0;
  },

  trigger: function(group, args, after)
  {
    var type = this.type;
    var isAfter = this.hasType( EventNode.Types.After );

    if ( this.group !== group )
    {
      if ( (after && isAfter) || !isAfter )
      {
        this.group = group;
        this.callback.apply( this.context, args );
      }

      if ( this.hasType( EventNode.Types.Once ) )
      {
        this.remove();
      }
    }
  }
});

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
function addEventful(target, secret)
{

  var triggerId = 0;

  /**
   * A mixin which adds `on`, `once`, `after`, and `trigger` functions to
   * another object.
   *
   * @class Eventful
   * @memberof Rekord
   * @see Rekord.addEventful
   */

   /**
    * A mixin which adds `$on`, `$once`, `$after`, and `$trigger` functions to
    * another object.
    *
    * @class Eventful$
    * @memberof Rekord
    * @see Rekord.addEventful
    */

  // Adds a listener to $this
  function onListeners($this, eventsInput, callback, context, type)
  {
    if ( !isFunction( callback ) )
    {
      return noop;
    }

    var callbackContext = context || $this;
    var events = toArray( eventsInput, ' ' );
    var listeners = $this.$$on;

    if ( !listeners )
    {
      Class.prop( $this, '$$on', listeners = {} );
    }

    var nodes = [];

    for (var i = 0; i < events.length; i++)
    {
      var eventName = events[ i ];
      var eventListeners = listeners[ eventName ];

      if ( !eventListeners )
      {
        eventListeners = listeners[ eventName ] = new EventNode();
      }

      nodes.push( new EventNode( eventListeners, callback, callbackContext, type, triggerId ) );
    }

    return function ignore()
    {
      for (var i = 0; i < nodes.length; i++)
      {
        nodes[ i ].remove();
      }

      nodes.length = 0;
    };
  }

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
    return onListeners( this, events, callback, context, EventNode.Types.Persistent );
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
    return onListeners( this, events, callback, context, EventNode.Types.Once );
  }

  function after(events, callback, context)
  {
    return onListeners( this, events, callback, context, EventNode.Types.After );
  }

  // Removes a listener from an array of listeners.
  function offListeners(listeners, event, callback)
  {
    if (listeners && event in listeners)
    {
      var eventListeners = listeners[ event ];
      var next, node = eventListeners.next;

      while (node !== eventListeners)
      {
        next = node.next;

        if (node.callback === callback)
        {
          node.remove();
        }

        node = next;
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
   * @for addEventful
   * @param {String|Array|Object} [eventsInput]
   * @param {Function} [callback]
   * @chainable
   */
  function off(eventsInput, callback)
  {
    // Remove ALL listeners
    if ( !isDefined( eventsInput ) )
    {
      deleteProperty( this, '$$on' );
    }
    else
    {
      var events = toArray( eventsInput, ' ' );

      // Remove listeners for given events
      if ( !isFunction( callback ) )
      {
        for (var i = 0; i < events.length; i++)
        {
          deleteProperty( this.$$on, events[i] );
        }
      }
      // Remove specific listener
      else
      {
        for (var i = 0; i < events.length; i++)
        {
          offListeners( this.$$on, events[i], callback );
        }
      }
    }

    return this;
  }

  // Triggers listeneers for the given event
  function triggerListeners(listeners, event, args)
  {
    if (listeners && event in listeners)
    {
      var eventListeners = listeners[ event ];
      var triggerGroup = ++triggerId;
      var next, node = eventListeners.next;

      while (node !== eventListeners)
      {
        next = node.next;
        node.trigger( triggerGroup, args, false );
        node = next;
      }

      node = eventListeners.next;

      while (node !== eventListeners)
      {
        next = node.next;
        node.trigger( triggerGroup, args, true );
        node = next;
      }
    }
  }

  /**
   * Triggers a single event optionally passing an argument to any listeners.
   *
   * @method trigger
   * @for addEventful
   * @param {String} eventsInput
   * @param {Array} args
   * @chainable
   */
  function trigger(eventsInput, args)
  {
    try
    {
      var events = toArray( eventsInput, ' ' );

      for (var i = 0; i < events.length; i++)
      {
        triggerListeners( this.$$on, events[ i ], args );
      }
    }
    catch (ex)
    {
      Rekord.trigger( Rekord.Events.Error, [ex] );
    }

    return this;
  }

  var methods = null;

  if ( secret )
  {
    methods = {
      $on: on,
      $once: once,
      $after: after,
      $off: off,
      $trigger: trigger
    };
  }
  else
  {
    methods = {
      on: on,
      once: once,
      after: after,
      off: off,
      trigger: trigger
    };
  }

  if ( target.$methods )
  {
    Class.methods( target, methods );
  }
  else
  {
    Class.props( target, methods );
  }
}
