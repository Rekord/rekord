(function(global, undefined)
{



function isDefined(x)
{
  return x !== undefined;
}

function isFunction(x)
{
  return !!(x && x.constructor && x.call && x.apply);
}

function isModelConstructor(x)
{
  return isFunction( x ) && x.prototype instanceof NeuroModel;
}

function isNeuro(x)
{
  return !!(x && x.Model && x.Database);
}

function isString(x)
{
  return typeof x === 'string';
}

function isNumber(x)
{
  return typeof x === 'number' && !isNaN(x);
}

function isDate(x)
{
  return x instanceof Date;
}

function isRegExp(x)
{
  return x instanceof RegExp;
}

function isArray(x)
{
  return x instanceof Array;
}

function isObject(x)
{
  return x !== null && typeof x === 'object';
}

function toArray(x, split)
{
  return x instanceof Array ? x : x.split( split );
}

function isTruthy(x)
{
  return !!x;
}

function isValue(x)
{
  return x !== undefined && x !== null;
}

function indexOf(arr, x, comparator)
{
  var cmp = comparator || equalsStrict;

  for (var i = 0, n = arr.length; i < n; i++)
  {
    if ( cmp( arr[i], x ) )
    {
      return i;
    }
  }

  return false;
}

function S4() 
{
  return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
}

function uuid() 
{
    return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
}

function extend(parent, child, override)
{
  child.prototype = parent;

  for (var prop in override)
  {
    child.prototype[ prop ] = override[ prop ];
  }
}

function propsMatch(test, testFields, expected, expectedFields)
{
  if ( isString( testFields ) ) // && isString( expectedFields )
  {
    return test[ testFields ] === expected[ expectedFields ];
  }
  else // if ( isArray( testFields ) && isArray( expectedFields ) )
  {
    for (var i = 0; i < testFields.length; i++)
    {
      var testProp = testFields[ i ];
      var expectedProp = expectedFields[ i ];

      if ( !equals( test[ testProp ], expected[ expectedProp ] ) )
      {
        return false;
      }
    }

    return true;
  }

  return false;
}

function transfer(from, to)
{
  for (var prop in from)
  {
    to[ prop ] = from[ prop ];
  }

  return to;
}

function swap(a, i, k)
{
  var t = a[ i ];
  a[ i ] = a[ k ];
  a[ k ] = t;
}

function evaluate(x)
{
  if ( !isValue( x ) )
  {
    return x;
  }

  if ( isNeuro( x ) )
  {
    return new x.Model();
  }
  if ( isModelConstructor( x ) )
  {
    return new x();
  }
  if ( isFunction( x ) )
  {
    return x();
  }

  return copy( x );
}

function grab(obj, props, copyValues)
{
  var grabbed = {};

  for (var i = 0; i < props.length; i++) 
  {
    var p = props[ i ];

    if ( p in obj ) 
    {
      grabbed[ p ] = copyValues ? copy( obj[ p ] ) : obj[ p ];
    }
  }

  return grabbed;
}

function pull(obj, props, copyValues)
{
  if ( isString( props ) )
  {
    var pulledValue = obj[ props ];

    return copyValues ? copy( pulledValue ) : pulledValue;
  }
  else // isArray( props )
  {
    var pulled = [];

    for (var i = 0; i < props.length; i++) 
    {
      var p = props[ i ];
      var pulledValue = obj[ p ];

      pulled.push( copyValues ? copy( pulledValue ) : pulledValue );
    }

    return pulled;
  }
}

function clean(x)
{
  for (var prop in x)
  {
    if ( prop.charAt(0) === '$' )
    {
      delete x[ prop ];
    }
  }

  return x;
}

function copy(x, copyHidden)
{
  if (x === void 0)
  {
    return x;
  }
  if (isArray(x)) 
  {
    var c = [];

    for (var i = 0; i < x.length; i++) 
    {
      c.push( copy(x[i]) );
    }
    return x;
  }
  if (isFunction(x) || typeof x !== 'object' || x === null)
  {
    return x;
  }
  if (isDate(x))
  {
    return new Date( x.getTime() );
  }
  if (isRegExp(x))
  {
    return new RegExp( x.source, x.toString().match(/[^\/]*$/)[0] );
  }

  var c = {};

  for (var prop in x) 
  {
    if (copyHidden || prop.charAt(0) !== '$')
    {
      c[ prop ] = copy( x[prop] );
    }
  }

  return c;
}

function diff(curr, old, props, comparator)
{
  var d = {};

  for (var i = 0; i < props.length; i++)
  {
    var p = props[ i ];

    if (!comparator( curr[ p ], old[ p ] ) )
    {
      d[ p ] = copy( curr[ p ] );
    }
  }

  return d;
}

function isEmpty(x)
{
  if (x === null || x === void 0 || x === 0) 
  {
    return true;
  }
  if (isArray(x) || isString(x)) 
  {
    return x.length === 0;
  }
  if (isDate(x)) 
  {
    return x.getTime() === 0 || isNaN( x.getTime() );
  }
  if (isObject(x)) 
  {
    for (var prop in x) 
    {
      return false;
    }
    return true;
  }

  return false;
}

function equalsStrict(a, b)
{
  return a === b;
}

function equals(a, b)
{
  if (a === b) return true;
  if (a === null || b === null) return false;
  if (a !== a && b !== b) return true; // NaN === NaN

  var at = typeof a;
  var bt = typeof b;
  if (at !== bt) return false;

  var aa = isArray(a);
  var ba = isArray(b);
  if (aa !== ba) return false;

  if (aa) {
    if (a.length !== b.length) return false;
    for (var i = 0; i < a.length; i++) {
      if (!equals(a[i], b[i])) {
        return false;
      }
    }
    return true;
  }

  if (isDate(a)) {
    return isDate(b) && equals( a.getTime(), b.getTime() );
  }
  if (isRegExp(a)) {
    return isRegExp(b) && a.toString() === b.toString();
  }

  if (at === 'object') {
    for (var p in a) {
      if (p.charAt(0) !== '$' || !isFunction(a[p])) {
        if (!(p in b) || !equals(a[p], b[p])) {
          return false;
        }
      }
    }
    for (var p in b) {
      if (p.charAt(0) !== '$' || !isFunction(b[p])) {
        if (!(p in a)) {
          return false;
        }
      }
    }
    return true;
  }

  return false;
}

function compareNumbers(a, b) 
{
  return (a === b ? 0 : (a < b ? -1 : 1));
}

function compare(a, b)
{
  if (a == b) 
  {
    return 0;
  }
  if (isDate(a)) 
  {
    a = a.getTime();
  }
  if (isDate(b)) 
  {
    b = b.getTime();
  }
  if (isNumber(a) && isNumber(b)) 
  {
    return compareNumbers(a, b);
  }
  if (isArray(a) && isArray(b)) 
  {
    return compareNumbers(a.length, b.length);
  }
  
  return (a + '').localeCompare(b + '');
}

function createComparator(comparator)
{
  if ( isFunction( comparator ) )
  {
    return comparator;
  }
  else if ( isString( comparator ) )
  {
    if ( comparator.charAt(0) === '-' )
    {
      comparator = comparator.substring( 1 );

      return function compareObjects(a, b)
      {
        return compare( b[ comparator ], a[ comparator ] );
      };
    }
    else
    {
      return function compareObjects(a, b)
      {
        return compare( a[ comparator ], b[ comparator ] );
      };
    }
  }

  return null;
}

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
        }
      }
      // Remove specific listener
      else
      {
        for (var i = 0; i < events.length; i++)
        {
          offListeners( this.$$on, events[i], callback );
          offListeners( this.$$once, events[i], callback );
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
    }

    return this;
  }

  if ( secret )
  {
    target.$on = on;
    target.$once = once;
    target.$off = off;
    target.$trigger = trigger;
  }
  else
  {
    target.on = on;
    target.once = once;
    target.off = off;
    target.trigger = trigger;
  }
};

/*
new Neuro({
  name: 'name',
  api: 'http://api/name',
  pubsub: 'http://url:port',
  channel: 'houseid',
  token: 'userid',
  key: 'id',
  fields: ['id', 'name', 'updated_at'],
//  encode: function() {},
//  decode: function() {}
});
*/

function Neuro(options)
{
  var database = new NeuroDatabase( options );

  var model = new Function('return function ' + options.className + '(props, exists) { this.$init( props, exists ) }')();

  model.prototype = new NeuroModel( database );

  database.model = model;
  database.init();

  Neuro.debug( Neuro.Events.CREATION, database, options );

  model.Database = database;
  model.Model = model;

  Neuro.cache[ options.name ] = model;
  Neuro.cache[ options.className ] = model;

  Neuro.trigger( 'initialized', [model] );

  return model;
}

Neuro.cache = {};

Neuro.get = function(name, callback, context)
{
  var cached = Neuro.cache[ name ];
  var callbackContext = context || global;

  if ( isFunction( callback ) )
  {
    if ( cached )
    {
      callback.call( callbackContext, cached );
    }
    else
    {
      function checkNeuro(neuro)
      {
        if ( neuro.name === name || neuro.className === name )
        {
          callback.call( callbackContext, neuro );

          Neuro.off( 'initialized', checkNeuro );
        }
      }

      Neuro.on( 'initialized', checkNeuro );
    }
  }

  return cached;
};

Neuro.RELATIONS = {};

eventize( Neuro );


Neuro.debug = function(event, source)  /*, data.. */
{
  // up to the user
};

Neuro.Events = {

  CREATION: 0,                // options

  REST: 1,                    // options

  REMOTE_UPDATE: 2,           // encoded, NeuroModel
  REMOTE_CREATE: 3,           // encoded, NeuroModel
  REMOTE_REMOVE: 4,           // NeuroModel
  REMOTE_LOAD: 5,             // encoded[]
  REMOTE_LOAD_OFFLINE: 6,     // 
  REMOTE_LOAD_ERROR: 7,       // status
  REMOTE_LOAD_REMOVE: 8,      // key
  REMOTE_LOAD_RESUME: 22,     // 

  LOCAL_LOAD: 9,              // encoded[]
  LOCAL_RESUME_DELETE: 10,    // NeuroModel
  LOCAL_RESUME_SAVE: 11,      // NeuroModel
  LOCAL_LOAD_SAVED: 12,       // NeuroModel

  REALTIME_SAVE: 13,          // encoded, key
  REALTIME_REMOVE: 14,        // key

  SAVE_VALUES: 15,            // encoded, NeuroModel
  SAVE_PUBLISH: 16,           // encoded, NeuroModel
  SAVE_CONFLICT: 17,          // encoded, NeuroModel
  SAVE_UPDATE_FAIL: 18,       // NeuroModel
  SAVE_ERROR: 19,             // NeuroModel, status
  SAVE_OFFLINE: 20,           // NeuroModel
  SAVE_RESUME: 21,            // NeuroModel
  SAVE_REMOTE: 25,            // NeuroModel
  SAVE_DELETED: 40,           // NeuroModel

  SAVE_OLD_REVISION: 48,      // NeuroModel, encoded

  SAVE_LOCAL: 23,             // NeuroModel
  SAVE_LOCAL_ERROR: 24,       // NeuroModel, error
  SAVE_LOCAL_DELETED: 38,     // NeuroModel
  SAVE_LOCAL_BLOCKED: 39,     // NeuroModel

  SAVE_REMOTE_DELETED: 41,    // NeuroModel, [encoded]
  SAVE_REMOTE_BLOCKED: 42,    // NeuroModel

  REMOVE_PUBLISH: 26,         // key, NeuroModel
  REMOVE_LOCAL: 27,           // key, NeuroModel
  REMOVE_MISSING: 28,         // key, NeuroModel
  REMOVE_ERROR: 29,           // status, key, NeuroModel
  REMOVE_OFFLINE: 30,         // NeuroModel
  REMOVE_RESUME: 31,          // NeuroModel
  REMOVE_REMOTE: 32,          // NeuroModel
  REMOVE_CANCEL_SAVE: 47,     // NeuroModel

  REMOVE_LOCAL: 33,           // NeuroModel
  REMOVE_LOCAL_ERROR: 34,     // NeuroModel, error
  REMOVE_LOCAL_BLOCKED: 44,   // NeuroModel
  REMOVE_LOCAL_NONE: 45,      // NeuroModel
  REMOVE_LOCAL_UNSAVED: 46,   // NeuroModel

  REMOVE_REMOTE_BLOCKED: 43,  // NeuroModel

  ONLINE: 35,                 //
  OFFLINE: 36,                //

  PUBSUB_CREATED: 37,         // PubSub

  HASONE_INIT: 53,            // NeuroHasOne
  HASONE_NINJA_REMOVE: 49,    // NeuroModel, relation
  HASONE_NINJA_SAVE: 50,      // NeuroModel, relation
  HASONE_INITIAL_PULLED: 51,  // NeuroModel, initial
  HASONE_INITIAL: 52,         // NeuroModel, initial
  HASONE_CLEAR_MODEL: 54,     // relation
  HASONE_SET_MODEL: 55,       // relation
  HASONE_PRESAVE: 56,         // NeuroModel, relation
  HASONE_POSTREMOVE: 57,      // NeuroModel, relation
  HASONE_CLEAR_KEY: 58,       // NeuroModel, local
  HASONE_UPDATE_KEY: 59,      // NeuroModel, local, NeuroModel, foreign
  HASONE_LOADED: 60,          // NeuroModel, relation, [NeuroModel]

  BELONGSTO_INIT: 61,          // NeuroHasOne
  BELONGSTO_NINJA_REMOVE: 62,  // NeuroModel, relation
  BELONGSTO_NINJA_SAVE: 63,    // NeuroModel, relation
  BELONGSTO_INITIAL_PULLED: 64,// NeuroModel, initial
  BELONGSTO_INITIAL: 65,       // NeuroModel, initial
  BELONGSTO_CLEAR_MODEL: 66,   // relation
  BELONGSTO_SET_MODEL: 67,     // relation
  BELONGSTO_PRESAVE: 68,       // NeuroModel, relation
  BELONGSTO_POSTREMOVE: 69,    // NeuroModel, relation
  BELONGSTO_CLEAR_KEY: 70,     // NeuroModel, local
  BELONGSTO_UPDATE_KEY: 71,    // NeuroModel, local, NeuroModel, foreign
  BELONGSTO_LOADED: 71         // NeuroModel, relation, [NeuroModel]

};

// Neuro.rest = function(options, success(data), failure(data, status))

Neuro.rest = function(database)
{
  return function (method, model, data, success, failure)
  {
    // success ( data )
    // failure ( data, status )
    
    failure( {}, 0 );
  };
};
/**
 * A factory function for returning an object capable of storing objects for
 * retrieval later by the application.
 * 
 * @param  {NeuroDatabase} database
 *         The database this store is for.
 * @return {Object} -
 *         An object with put, remove, and all functions.
 */
Neuro.store = function(database)
{
  return {

    /**
     * Places a record in the store with the given key.
     * 
     * @param  {String|Number} key
     *         The key to store the record as.
     * @param  {Object} record
     *         The record to store.
     * @param  {function} success
     *         A function to invoke when the record is successfully stored with
     *         the key. The arguments of the function should be the key and 
     *         record passed to this function.
     * @param  {function} failure
     *         A function to invoke when the record failed to be stored with the
     *         key. The arguments of the function should be the key, record, and
     *         an error that occurred if available.
     */
    put: function(key, record, success, failure) 
    { 
      // implement
    },

    /**
     * Removes a record from the store with the given key.
     * 
     * @param  {String|Number} key
     *         The key to remove from the store.
     * @param  {[type]} success
     *         A function to invoke when the record doesn't exist in the store.
     *         The arguments of the function are the removedValue (if any) and
     *         the key passed to this function.
     * @param  {[type]} failure
     *         A function to invoke when there was an issue removing the key
     *         from the store. The arguments of the function are the key given
     *         to this function and an error that occurred if available.
     */
    remove: function(key, success, failure) 
    {
      // implement
    },

    /**
     * Returns all records and their keys to the given success callback.
     * 
     * @param  {function} success
     *         The function to invoke with the array of records and an array
     *         of keys.
     * @param  {function} failure
     *         The function to invoke with the error that occurred if available.
     */
    all: function(success, failure) 
    {
      // implement
    }

  };

};

/**
 * The factory responsible for creating a service which publishes operations
 * and receives operations that have occurred. The first argument is a reference
 * to the NeuroDatabase and the second argument is a function to invoke when a
 * live operation occurs. This function must return a function that can be passed
 * an operation to be delegated to other clients.
 * 
 * @param  {NeuroDatabase} database
 *         The database this live function is for.
 * @param  {function} onPublish
 *         The function which receives live operations.
 * @return {function} -
 *         The function which sends operations.
 */
Neuro.live = function(database, onPublish)
{
  return function publish(message)
  {
    // ignore the message.
  };
};

// Initial online
Neuro.online = window.navigator.onLine !== false;

Neuro.forceOffline = false;

// Set network status to online and notify all listeners
Neuro.setOnline = function()
{
  Neuro.online = true;
  Neuro.debug( Neuro.Events.ONLINE );
  Neuro.trigger('online');
};

// Set network status to offline and notify all listeners
Neuro.setOffline = function()
{
  Neuro.online = false;
  Neuro.debug( Neuro.Events.OFFLINE );
  Neuro.trigger('offline');
};

// This must be called manually - this will try to use built in support for 
// online/offline detection instead of solely using status codes of 0.
Neuro.listenToNetworkStatus = function()
{
  if (window.addEventListener) 
  {
    window.addEventListener( 'online', Neuro.setOnline, false );
    window.addEventListener( 'offline', Neuro.setOffline, false );
  } 
  else 
  {
    document.body.ononline = Neuro.setOnline;
    document.body.onoffline = Neuro.setOffline;
  }
};

// Check to see if the network status has changed.
Neuro.checkNetworkStatus = function()
{
  var online = window.navigator.onLine;

  if ( Neuro.forceOffline ) 
  {
    online = false;
  }

  if (online === true && Neuro.online === false) 
  {
    Neuro.setOnline();
  }

  else if (online === false && Neuro.online === true) 
  {
    Neuro.setOffline();
  }
};


function NeuroDatabase(options)
{  
  transfer( options, this );

  this.models = new NeuroMap();

  this.initialized = false;
  this.pendingRefresh = false;

  this.localLoaded = false;
  this.remoteLoaded = false;

  this.rest = Neuro.rest( this );
  this.store = Neuro.store( this );
  this.live = Neuro.live( this, this.handlePublish( this ) );

  this.setComparator( this.comparator );
  this.setRevision( this.revision );

  this.relations = {};

  for (var relationType in options)
  {
    if ( !(relationType in Neuro.RELATIONS) )
    {
      continue;
    }
    var RelationClass = Neuro.RELATIONS[ relationType ];

    if ( !(RelationClass.prototype instanceof NeuroRelation ) )
    {
      continue;
    }

    var relationMap = options[ relationType ];

    for ( var name in relationMap )
    {
      var relationOptions = relationMap[ name ];
      var relation = new RelationClass();

      relation.init( this, name, relationOptions );

      this.relations[ name ] = relation;
    }
  }
}

NeuroDatabase.prototype =
{

  //
  toString: function(model) 
  {
    return '';
  },

  // Notifies a callback when the database has loaded (either locally or remotely).
  ready: function(callback, context, persistent)
  {
    var db = this;
    var callbackContext = context || db;
    var invoked = false;

    if ( db.initialized )
    {
      callback.call( callbackContext, db );
      invoked = true;
    }
    else
    {
      function onReadyRemove()
      {
        db.off( 'local-load remote-load', onReady );
      }

      function onReady()
      {
        if ( !persistent )
        {
          onReadyRemove();
        }
        if ( !invoked || persistent )
        {
          if ( callback.call( callbackContext, db ) === false )
          {
            onReadyRemove();
          }
          invoked = true;
        }
      }

      db.on( 'local-load remote-load', onReady );
    }

    return invoked;
  },

  // Grab a model with the given input and notify the callback
  grabModel: function(input, callback, context)
  {
    var db = this;
    var callbackContext = context || db;

    function checkModel()
    {
      var result = db.parseModel( input, true );

      if ( result !== false )
      {
        callback.call( callbackContext, result );
      }

      return result;
    }

    if ( checkModel() )
    {
      db.ready( checkModel, db, true );
    }
  },

  // Parses the model from the given input
  // 
  // Returns false if the input doesn't resolve to a model at the moment
  // Returns null if the input doesn't resolve to a model and all models have been remotely loaded
  // 
  // parseModel( Neuro )
  // parseModel( Neuro.Model )
  // parseModel( 'uuid' )
  // parseModel( ['uuid'] )
  // parseModel( modelInstance )
  // parseModel( {name:'new model'} )
  // parseModel( {id:4, name:'new or existing model'} )
  // 
  parseModel: function(input, fromStorage)
  {
    var db = this;

    if ( !isValue( input ) )
    {
      return db.remoteLoaded ? null : false;
    }

    if ( isNeuro( input ) )
    {
      input = new input.Model();
    }
    else if ( isModelConstructor( input ) )
    {
      input = new input();
    }

    var key = db.buildKeyFromInput( input );

    if ( input instanceof db.model )
    {
      if ( !db.models.has( key ) )
      {
        // trigger? save?
        db.models.put( key, input );
      }

      return input;
    }
    else if ( db.models.has( key ) )
    {
      return db.models.get( key );
    }
    else if ( isObject( input ) )
    {
      return db.putRemoteData( input, undefined, undefined, fromStorage );
    }
    else if ( db.remoteLoaded )
    {
      return null;
    }

    return false;
  },

  // Removes the key from the given model
  removeKey: function(model)
  {
    var k = this.key;

    if ( isArray(k) )
    {
      for (var i = 0; i < k.length; i++) 
      {
        delete model[ k[i] ];
      }
    }
    else
    {
      delete model[ k ];
    }
  },

  // Builds a key string from the given model and array of fields
  buildKey: function(model, fields)
  {
    var key = this.buildKeys( model, fields );

    if ( isArray( key ) )
    {
      key = key.join( this.keySeparator || '/' );
    }
    
    return key;
  },

  // Builds a key (possibly array) from the given model and array of fields
  buildKeys: function(model, fields)
  {
    var key = null;

    if ( isArray( fields ) )
    {      
      key = [];
      
      for (var i = 0; i < fields.length; i++) 
      {
        key.push( model[ fields[i] ] );
      }
    }
    else
    {
      key = model[ fields ];

      if (!key)
      {
        key = model[ fields ] = uuid();
      }
    }

    return key;
  },

  // Builds a key from various types of input.
  buildKeyFromInput: function(input)
  {
    if ( input instanceof this.model )
    {
      return input.$key();
    }
    else if ( isArray( input ) ) // && isArray( this.key )
    {
      return this.buildKeyFromArray( input );
    }
    else if ( isObject( input ) )
    {
      return this.buildKey( input, this.key );
    }

    return input;
  },

  // Builds a key from an array
  buildKeyFromArray: function(arr)
  {
    var ks = this.keySeparator || '/';
    var key = '';

    for (var i = 0; i < arr.length; i++)
    {
      if (i > 0)
      {
        key += ks;
      }

      key += arr[ i ];
    }

    return key;
  },

  // Gets the key from the given model
  getKey: function(model)
  {
    return this.buildKey( model, this.key );
  },

  // Gets the key from the given model
  getKeys: function(model)
  {
    return this.buildKeys( model, this.key );
  },

  // Determines whether the given model has the given fields
  hasFields: function(model, fields, exists)
  {
    if ( isArray( fields ) )
    {
      for (var i = 0; i < fields.length; i++) 
      {
        if ( !exists( model[ fields[ i ] ] ) )
        {
          return false;
        }
      }

      return true;
    }
    else // isString( fields )
    {
      return exists( model[ fields ] );
    }
  },

  // Sorts the models & notifies listeners that the database has been updated.
  updated: function()
  {
    this.sort();
    this.trigger( 'updated' );
  },

  // Sets a revision comparision function for this database. It can be a field
  // name or a function. This is used to avoid updating model data that is older
  // than the model's current data.
  setRevision: function(revision)
  {
    if ( isFunction( revision ) )
    {
      this.revisionFunction = revision;
    }
    else if ( isString( revision ) )
    {
      this.revisionFunction = function(a, b)
      {
        return (revision in a && revision in b) ? (a[ revision ] - b[ revision ]) : false;
      };
    }
    else
    {
      this.revisionFunction = function(a, b)
      {
        return false;
      };
    }
  },

  // Sets a comparator for this database. It can be a field name, a field name
  // with a minus in the front to sort in reverse, or a comparator function.
  setComparator: function(comparator)
  {
    this.comparatorFunction = createComparator( comparator );
  },

  // Sorts the database if it isn't sorted.
  sort: function()
  {
    if ( !this.isSorted() )
    {
      this.models.sort( this.comparatorFunction );
    }
  },

  // Determines whether this database is sorted.
  isSorted: function()
  {
    return this.models.isSorted( this.comparatorFunction );
  },

  // Handles when we receive data from the server - either from
  // a publish, refresh, or values being returned on a save.
  putRemoteData: function(encoded, key, model, fromStorage)
  {
    var db = this;
    var key = key || db.getKey( encoded );
    var model = model || db.models.get( key );
    var decoded = db.decode( copy( encoded ) );

    if ( model )
    {
      var revisionCompare = this.revisionFunction( model, encoded );

      if ( revisionCompare !== false && revisionCompare > 0 )
      {
        Neuro.debug( Neuro.Events.SAVE_OLD_REVISION, db, model, encoded );

        return;
      }
    }

    if ( model && model.$saved )
    {
      var current = model.$toJSON( true );
      var conflicts = {};
      var conflicted = false;
      var updated = {};

      for (var prop in encoded)
      {
        if ( prop.charAt(0) === '$' )
        {
          continue;
        }

        var currentValue = current[ prop ];
        var savedValue = model.$saved[ prop ];

        if ( equals( currentValue, savedValue ) )
        {
          model[ prop ] = decoded[ prop ];
          updated[ prop ] = encoded[ prop ];

          if ( db.cache !== false )
          {
            model.$local[ prop ] = encoded[ prop ];
          }
        }
        else
        {
          conflicts[ prop ] = encoded[ prop ];
          conflicted = true;
        }

        model.$saved[ prop ] = copy( encoded[ prop ] );
      }

      if ( conflicted )
      {
        model.$trigger( 'partial-update', [encoded, conflicts] );
      }
      else
      {
        model.$trigger( 'full-update', [encoded, updated] );
      }

      model.$trigger( 'remote-update', [encoded] );

      if ( db.cache !== false )
      {
        model.$addOperation( NeuroSaveNow ); 
      }
    }
    else
    {
      model = db.instantiate( decoded, fromStorage );

      if ( db.cache !== false )
      {
        model.$local = encoded;
        model.$saved = model.$local.$saved = copy( encoded );

        model.$addOperation( NeuroSaveNow );
      }
      else
      {
        model.$saved = clean( encoded );
      }
    }

    if ( !db.models.has( key ) )
    {
      db.models.put( key, model );
      db.trigger( 'model-added', [model] );

      if ( !fromStorage )
      {
        model.$trigger( 'saved' ); 
      }
    }

    return model;
  },

  destroyLocalUncachedModel: function(model, key)
  {
    var db = this;

    if ( model )
    {
      if ( model.$hasChanges() )
      {
        delete model.$saved;

        db.removeKey( model );

        model.$trigger( 'detach' );

        return false;
      }

      model.$trigger( 'remote-remove' );

      db.models.remove( key );
      db.trigger( 'model-removed', [model] );

      model.$trigger('removed');

      Neuro.debug( Neuro.Events.REMOTE_REMOVE, db, model );

      return true;
    }

    return false;
  },

  destroyLocalCachedModel: function(model, key)
  {
    var db = this;

    if ( model )
    {
      // If a model was removed remotely but the model has changes - don't remove it.
      if ( model.$hasChanges() )
      {
        // Removed saved history and the current ID
        delete model.$saved;
        delete model.$local.$saved;

        db.removeKey( model );
        db.removeKey( model.$local );

        model.$trigger( 'detach' );

        model.$addOperation( NeuroSaveNow );
     
        return false;
      }

      model.$trigger( 'remote-remove' );

      model.$addOperation( NeuroRemoveNow );

      db.models.remove( key );
      db.trigger( 'model-removed', [model] );

      model.$trigger('removed');

      Neuro.debug( Neuro.Events.REMOTE_REMOVE, db, model );
    }
    else
    {
      db.store.remove( key, function(removedValue)
      {
        if (removedValue) 
        {
          Neuro.debug( Neuro.Events.REMOTE_REMOVE, db, removedValue );
        }
      });

      // The model didn't exist
      return false;
    }

    return true;
  },

  // Destroys a model locally because it doesn't exist remotely
  destroyLocalModel: function(key)
  {
    var db = this;
    var model = db.models.get( key );

    if ( db.cache === false )
    {
      return db.destroyLocalUncachedModel( model, key );
    }
    else
    {
      return db.destroyLocalCachedModel( model, key );
    }
  },

  // Initialize the database by loading local values and on success load
  // remove values.
  init: function()
  {
    var db = this;

    if ( db.cache === false )
    {
      if ( db.loadRemote !== false )
      {
        db.refresh();
      }

      return;
    }

    db.store.all(function(records, keys)
    {
      Neuro.debug( Neuro.Events.LOCAL_LOAD, db, records );

      db.models.reset();

      for (var i = 0; i < records.length; i++) 
      {
        var encoded = records[ i ];
        var key = keys[ i ];
        var decoded = db.decode( copy( encoded, true ) );
        var model = db.instantiate( decoded, true );

        model.$local = encoded;

        if ( encoded.$deleted )
        {
          Neuro.debug( Neuro.Events.LOCAL_RESUME_DELETE, db, model );

          model.$addOperation( NeuroRemoveRemote );
        }
        else
        {
          if ( !encoded.$saved )
          {
            Neuro.debug( Neuro.Events.LOCAL_RESUME_SAVE, db, model );

            model.$addOperation( NeuroSaveRemote );
          }
          else
          {
            Neuro.debug( Neuro.Events.LOCAL_LOAD_SAVED, db, model );

            model.$local.$saved = model.$saved;
          }

          // TODO investigate why sometimes the key is removed from the model then saved
          if ( key === model.$key() )
          {
            db.models.put( key, model );            
          }
          else
          {
            db.store.remove( key );
          }
        }
      }
      
      db.initialized = true;
      db.localLoaded = true;

      db.trigger( 'local-load', [db] );

      db.updated();

      if ( db.loadRemote !== false )
      {
        db.refresh();
      }
    });    
  },

  // Loads all data remotely
  refresh: function()
  {
    var db = this;
    
    db.rest( 'GET', undefined, undefined, onModels, onLoadError );
    
    function onModels(models) 
    {
      var mapped = {};

      for (var i = 0; i < models.length; i++)
      {
        var model = db.putRemoteData( models[ i ] );
        var key = model.$key();

        mapped[ key ] = model;
      }

      var keys = db.models.keys;

      for (var i = 0; i < keys.length; i++)
      {
        var k = keys[ i ];

        if ( !(k in mapped) )
        {
          var old = db.models.get( k );

          if ( old.$saved )
          {
            Neuro.debug( Neuro.Events.REMOTE_LOAD_REMOVE, db, k );

            db.destroyLocalModel( k );
          }
        }
      }

      db.initialized = true;
      db.remoteLoaded = true;

      db.trigger( 'remote-load', [db] );

      db.updated();

      Neuro.debug( Neuro.Events.REMOTE_LOAD, db, models );
    }

    function onLoadError(models, status) 
    {
      if ( status === 0 )
      {
        Neuro.checkNetworkStatus();

        if ( !Neuro.online )
        {
          db.pendingRefresh = true;

          Neuro.once('online', function()
          {
            Neuro.debug( Neuro.Events.REMOTE_LOAD_RESUME, db );

            if ( db.pendingRefresh )
            {
              db.pendingRefresh = false;

              db.refresh(); 
            }
          })
        }

        Neuro.debug( Neuro.Events.REMOTE_LOAD_OFFLINE, db );
      }
      else
      {
        Neuro.debug( Neuro.Events.REMOTE_LOAD_ERROR, db, status );
      }
    }
  
  },

  // The reference to all of the models in the database
  getModels: function()
  {
    return this.models.values;
  }, 

  // Returns a model
  getModel: function(key)
  {
    if ( isArray( key ) )
    {
      key = this.buildKeyFromArray( key );
    }

    return this.models.get( key );
  },

  // Crates a function for handling real-time changes
  handlePublish: function(db)
  {
    return function(message)
    {
      var key = message.key;
      var encoded = message.model;

      switch (message.op) 
      {
      case 'SAVE':

        db.putRemoteData( encoded, key );
        db.updated();

        Neuro.debug( Neuro.Events.REALTIME_SAVE, db, message.model, key );
        break;

      case 'REMOVE':

        if ( db.destroyLocalModel( key ) )
        {
          db.updated(); 
        }

        Neuro.debug( Neuro.Events.REALTIME_REMOVE, db, key );
        break;
      }
    };
  },

  // Return an instance of the model with the data as initial values
  instantiate: function(data, fromStorage)
  {
    return new this.model( data, fromStorage );
  },

  // Converts properties in data into their storable form
  encode: function(data)
  {
    return data;
  },

  // Converts properties in rawData from their storable form to their desired
  decode: function(rawData)
  {
    return rawData;
  },

  // Save the model
  save: function(model)
  {
    var db = this;
    var key = model.$key();

    // If the model is deleted, return immediately!
    if ( model.$deleted )
    {
      Neuro.debug( Neuro.Events.SAVE_DELETED, db, model );

      return;
    }

    // Place the model and trigger a database update.
    if ( !db.models.has( key ) )
    {
      db.models.put( key, model );
      db.trigger( 'model-added', [model] );
      db.updated();

      model.$trigger('created saved');
    }
    else
    {
      db.trigger( 'model-updated', [model] );

      model.$trigger('updated saved');
    }

    if ( db.cache === false )
    {
      // Save remotely
      model.$addOperation( NeuroSaveRemote );
    }
    else
    {
      // Start by saving locally.
      model.$addOperation( NeuroSaveLocal );
    }
  },

  // Remove the model 
  remove: function(model)
  {
    var db = this;
    var key = model.$key();

    // If we have it in the models, remove it!
    if ( db.models.has( key ) )
    {
      db.models.remove( key );
      db.trigger( 'model-removed', [model] );
      db.updated();

      model.$trigger('removed');
    }

    // Mark as deleted right away
    model.$deleted = true;

    // If we're offline and we have a pending save - cancel the pending save.
    // TODO Add Debug here?
    if ( model.$pendingSave )
    {
      Neuro.debug( Neuro.Events.REMOVE_CANCEL_SAVE, db, model );

      model.$pendingSave = false; 
    }

    if ( db.cache === false )
    {
      // Remove remotely
      model.$addOperation( NeuroRemoveRemote );
    }
    else
    { 
      // Start by removing locally.
      model.$addOperation( NeuroRemoveLocal );
    }
  }

};

eventize( NeuroDatabase.prototype );

function NeuroModel(db)
{
  this.$db = db;

  /**
   * @property {NeuroDatabase} $db
   *           The reference to the database this model is stored in.
   */

  /**
   * @property {Object} [$saved]
   *           An object of encoded data representing the values saved remotely.
   *           If this object does not exist - the model hasn't been created
   *           yet.
   */
  
  /**
   * @property {Boolean} [$deleted]
   *           A flag placed on a model once it's requested to be deleted. A  
   *           model with this flag isn't present on any arrays - it's stored
   *           locally until its successfully removed remotely - then it's 
   *           removed locally.
   */
  
  /**
   * @property {Object} [$local]
   *           The object of encoded data that is stored locally. It's $saved
   *           property is the same object as this $saved property.
   */
  
  /**
   * @property {Boolean} $pendingSave
   *           Whether there is a pending save for this model.
   */
}

NeuroModel.prototype =
{

  $init: function(props, exists)
  {
    this.$pendingSave = false;
    this.$operation = null;
    this.$relations = {};

    if ( exists )
    {
      this.$set( props );
    }
    else
    {
      this.$reset( props );
    }

    // Load relations after initialization?
    if ( this.$db.loadRelations )
    {
      var databaseRelations = this.$db.relations;

      for (var name in databaseRelations)
      {
        this.$getRelation( name );
      }
    }
  },

  $reset: function(props)
  {
    var def = this.$db.defaults;
    var fields = this.$db.fields;
    var relations = this.$db.relations;

    if ( isObject( def ) )
    {
      for (var i = 0; i < fields.length; i++)
      {
        var prop = fields[ i ];
        var defaultValue = def[ prop ];
        var evaluatedValue = evaluate( defaultValue );

        this[ prop ] = evaluatedValue;
      }

      for (var prop in relations)
      {
        if ( prop in def )
        {
          var defaultValue = def[ prop ];
          var evaluatedValue = evaluate( defaultValue );
          var relation = this.$getRelation( prop );

          relation.set( this, evaluatedValue );
        }
      }
    }
    else
    {
      for (var i = 0; i < fields.length; i++)
      {
        var prop = fields[ i ];

        this[ prop ] = undefined;
      }
    }

    this.$set( props );
  },

  $set: function(props, value)
  {
    if ( isObject( props ) )
    {
      transfer( props, this );
    }
    else if ( isString( props ) )
    {
      var relation = this.$getRelation( props );
      
      if ( relation )
      {
        relation.set( this, value );
      }
      else
      {
        this[ props ] = value; 
      }
    }
  },

  $get: function(props, copyValues)
  {
    if ( isArray( props ) )
    {
      return grab( this, props, copyValues );
    }
    else if ( isObject( props ) )
    {
      for (var p in props)
      {
        props[ p ] = copyValues ? copy( this[ p ] ) : this[ p ];
      }

      return props;
    }
    else if ( isString( props ) )
    {
      var relation = this.$getRelation( props );

      if ( relation )
      {
        var values = relation.get( this );

        return copyValues ? copy( values ) : values;
      }
      else
      {
        return copyValues ? copy( this[ props ] ) : this[ props ];
      }
    }
  },

  $relate: function(prop, relate)
  {
    var relation = this.$getRelation( prop );

    if ( relation )
    {
      relation.relate( this, relate );
    }
  },

  $unrelate: function(prop, unrelated)
  {
    var relation = this.$getRelation( prop );

    if ( relation )
    {
      relation.unrelate( this, unrelated );
    }
  },

  $getRelation: function(prop)
  {
    var databaseRelations = this.$db.relations;

    if ( prop in databaseRelations )
    {
      var relation = databaseRelations[ prop ];

      if ( !(prop in this.$relations) )
      {
        relation.load( this );
      }

      return relation;
    }

    return false;
  },

  $save: function(setProperties, setValue)
  {
    this.$set( setProperties, setValue );

    this.$callRelationFunction( 'preSave' );

    this.$db.save( this );

    this.$callRelationFunction( 'postSave' );
  },

  $remove: function()
  {
    if ( this.$exists() )
    {
      this.$callRelationFunction( 'preRemove' );

      this.$db.remove( this );

      this.$callRelationFunction( 'postRemove' );
    }
  },

  $exists: function()
  {
    return !this.$deleted && this.$db.models.has( this.$key() );
  },

  $callRelationFunction: function(functionName)
  {
    var databaseRelations = this.$db.relations;

    for ( var name in databaseRelations )
    {
      databaseRelations[ name ][ functionName ]( this );
    }
  },

  $addOperation: function(OperationType) 
  {
    var operation = new OperationType( this );

    if ( !this.$operation ) 
    {
      this.$operation = operation;
      this.$operation.execute();
    } 
    else 
    {
      this.$operation.queue( operation );
    }
  },

  $toJSON: function( forSaving )
  {
    var encoded = this.$db.encode( grab( this, this.$db.fields, true ) );

    var databaseRelations = this.$db.relations;
    var relations = this.$relations;

    for (var name in relations)
    {
      databaseRelations[ name ].encode( this, encoded, forSaving );
    }

    return encoded;
  },

  $key: function()
  {
    return this.$db.getKey( this );
  },

  $keys: function()
  {
    return this.$db.getKeys( this );
  },

  $isSaved: function()
  {
    return !!this.$saved;
  },

  $isSavedLocally: function()
  {
    return !!this.$local;
  },

  $isNew: function()
  {
    return !(this.$saved || this.$local);
  },

  $getChanges: function()
  {
    var saved = this.$saved;
    var encoded = this.$toJSON( true );
    var fields = this.$db.fields;

    return saved ? diff( encoded, saved, fields, equals ) : encoded;
  },

  $hasChanges: function()
  {
    if (!this.$saved) 
    {
      return true;
    }

    var encoded = this.$toJSON( true );
    var saved = this.$saved;

    for (var prop in encoded) 
    {
      var currentValue = encoded[ prop ];
      var savedValue = saved[ prop ];

      if ( !equals( currentValue, savedValue ) ) 
      {
        return true;
      }
    }

    return false;
  }

};

eventize( NeuroModel.prototype, true );

/**
 * A NeuroMap has the key-to-value benefits of a map and iteration benefits of an
 * array. This is especially beneficial when most of the time the contents of 
 * the structure need to be iterated and order doesn't matter (since removal 
 * performs a swap which breaks insertion order).
 *
 * @constructor
 */
function NeuroMap()
{
  /**
   * An array of the values in this map.
   * @member {Array}
   */
  this.values = [];

  /**
   * An array of the keys in this map.
   * @type {Array}
   */
  this.keys = [];

  /**
   * An object of key to index mappings.
   * @type {Object}
   */
  this.indices = {};
}

NeuroMap.prototype =
{

  /**
   * Resets the map by initializing the values, keys, and indexes.
   * 
   * @return {NeuroMap} -
   *         The reference to this map.
   */
  reset: function()
  {
    this.values.length = 0;
    this.keys.length = 0;
    this.indices = {};

    return this;
  },

  /**
   * Puts the value in the map by the given key.
   *
   * @param {String} key
   * @param {V} value
   * @return {NeuroMap} -
   *         The reference to this map.
   */
  put: function(key, value)
  {
    if ( key in this.indices )
    {
      this.values[ this.indices[ key ] ] = value;
    }
    else
    {
      this.indices[ key ] = this.values.length;
      this.values.push( value );
      this.keys.push( key );
    }

    return this;
  },

  /**
   * Returns the value mapped by the given key.
   *
   * @param {String} key
   * @return {V}
   */
  get: function(key)
  {
    return this.values[ this.indices[ key ] ];
  },

  /**
   * Removes the value by a given key
   *
   * @param {String} key
   * @return {NeuroMap} -
   *         The reference to this map.
   */
  remove: function(key)
  {
    var index = this.indices[ key ];

    if ( isNumber( index ) )
    {
      this.removeAt( index );
    }

    return this;
  },

  /**
   * Removes the value & key at the given index.
   *
   * @param {Number} index
   * @return {NeuroMap} -
   *         The reference to this map.
   */
  removeAt: function(index)
  {
    var key = this.keys[ index ];
    var lastValue = this.values.pop();
    var lastKey = this.keys.pop();

    if ( index < this.values.length )
    {
      this.values[ index ] = lastValue;
      this.keys[ index ] = lastKey;
      this.indices[ lastKey ] = index;
    }

    delete this.indices[ key ];

    return this;
  },

  /**
   * Returns whether this map has a value for the given key.
   *
   * @param {String} key
   * @return {Boolean}
   */
  has: function(key)
  {
    return key in this.indices;
  },

  /**
   * Returns the number of elements in the map.
   *
   * @return {Number}
   */
  size: function()
  {
    return this.values.length;
  },

  /**
   * Passes all values & keys in this map to a callback and if it returns a 
   * truthy value then the key and value are placed in the destination map.
   * 
   * @param  {Function} callback [description]
   * @param  {NeuroMap} [dest]     [description]
   * @return {[type]}            [description]
   */
  filter: function(callback, dest)
  {
    var out = dest || new NeuroMap();
    var n = this.size();
    var values = this.values;
    var keys = this.keys;

    for (var i = 0; i < n; i++)
    {
      var v = values[ i ];
      var k = keys[ i ];

      if ( callback( v, k ) )
      {
        out.put( k, v );
      }
    }

    return out;
  },

  /**
   * Reverses the order of the underlying values & keys.
   * 
   * @return {NeuroMap} -
   *         The referense to this map.
   */
  reverse: function()
  {
    var max = this.size() - 1;
    var half = Math.ceil( max / 2 );

    for (var i = 0; i < half; i++)
    {
      swap( this.values, i, max - i );
      swap( this.keys, i, max - i );
    }

    this.rebuildIndex();

    return this;
  },

  /**
   * 
   * @param  {[type]}  comparator [description]
   * @return {Boolean}            [description]
   */
  isSorted: function(comparator)
  {
    if ( !comparator )
    {
      return true;
    }

    var models = this.values;

    for (var i = 0, n = models.length - 1; i < n; i++)
    {
      if ( comparator( models[ i ], models[ i + 1 ] ) > 0 )
      {
        return false;
      }
    }

    return true;
  },

  /**
   * Sorts the underlying values & keys given a value compare function.
   * 
   * @param  {function} comparator
   *         A function which accepts two values and returns a number used for
   *         sorting. If the first argument is less than the second argument, a
   *         negative number should be returned. If the arguments are equivalent
   *         then 0 should be returned, otherwise a positive number should be
   *         returned.
   * @return {NeuroMap} -
   *         The reference to this map.
   */
  sort: function(comparator)
  {
    var map = this;

    // Sort this partition!
    function partition(left, right)
    {
      var pivot = map.values[ Math.floor((right + left) / 2) ];
      var i = left;
      var j = right;

      while (i <= j) 
      {
        while (comparator( map.values[i], pivot ) < 0) i++
        while (comparator( map.values[j], pivot ) > 0) j--;

        if (i <= j) {
          swap( map.values, i, j );
          swap( map.keys, i, j );
          i++;
          j--;
        }
      }

      return i;
    }

    // Quicksort
    function qsort(left, right)
    {
      var index = partition( left, right );

      if (left < index - 1) 
      {
        qsort( left, index - 1 );
      }

      if (index < right) 
      {
        qsort( index, right );
      }
    }

    var right = this.size() - 1;

    // Are there elements to sort?
    if ( right > 0 )
    {
      qsort( 0, right );

      this.rebuildIndex();
    }

    return this;
  },

  /**
   * Rebuilds the index based on the keys.
   * 
   * @return {NeuroMap} -
   *         The reference to this map.
   */
  rebuildIndex: function()
  {
    this.indices = {};

    for (var i = 0, l = this.keys.length; i < l; i++)
    {
      this.indices[ this.keys[ i ] ] = i;
    }

    return this;
  }

};

function NeuroOperation(interrupts, type)
{
  this.interrupts = interrupts;
  this.type = type;
}

NeuroOperation.prototype = 
{
  reset: function(model)
  {
    this.model = model;
    this.db = model.$db;
    this.next = null;
    this.finished = false;
  },

  queue: function(operation)
  {
    if ( this.next && !operation.interrupts )
    {
      this.next.queue( operation );
    }
    else
    {
      this.next = operation;
    }
  },

  execute: function()
  {
    this.run( this.db, this.model );
  },

  run: function(db, model)
  {
    throw 'NeuroOperation.run Not implemented';
  },

  finish: function()
  {
    if ( !this.finished )
    {
      this.finished = true;

      if ( this.model.$operation = this.next )
      {
        this.next.execute();
      }
    }

    return this;
  },

  tryNext: function(OperationType)
  {
    if ( !this.next )
    {
      this.next = new OperationType( this.model );
    }
  },

  insertNext: function(OperationType)
  {
    var op = new OperationType( this.model );

    op.next = this.next;
    this.next = op;
  },

  success: function()
  {
    var op = this;

    return function handleSuccess() 
    {
      op.onSuccess.apply( op, arguments );
      op.finish();
    };
  },

  onSuccess: function()
  {

  },

  failure: function()
  {
    var op = this;

    return function handleFailure() 
    {
      op.onFailure.apply( op, arguments );
      op.finish();
    };
  },

  onFailure: function()
  {

  }

};

/**

$operation;

$addOperation: function(OperationType) {
  var operation = new OperationType( this );
  if ( !this.$operation ) {
    this.$operation = operation;
    this.$operation.execute();
  } else {
    this.$operation.queue( operation );
  }
}

 */
function NeuroRemoveLocal(model)
{
  this.reset( model );
}

NeuroRemoveLocal.prototype = new NeuroOperation( true, 'NeuroRemoveLocal' );

NeuroRemoveLocal.prototype.run = function(db, model)
{
  var key = model.$key();

  // If there is no local there's nothing to remove from anywhere!
  if ( !model.$local )
  {
    Neuro.debug( Neuro.Events.REMOVE_LOCAL_NONE, model );

    return this.finish();
  }

  // If this model hasn't been saved we only need to remove it from local storage.
  if ( model.$saved )
  {
    // Mark local copy as deleted in the event we're not online
    model.$local.$deleted = true;

    db.store.put( key, model.$local, this.success(), this.failure() );
  }
  else
  {
    Neuro.debug( Neuro.Events.REMOVE_LOCAL_UNSAVED, model );

    db.store.remove( key, this.success(), this.failure() );
  }
};

NeuroRemoveLocal.prototype.onSuccess = function(key, encoded, previousValue)
{
  var model = this.model;

  Neuro.debug( Neuro.Events.REMOVE_LOCAL, model );

  if ( model.$saved )
  {
    model.$addOperation( NeuroRemoveRemote );
  }
};

NeuroRemoveLocal.prototype.onFailure = function(e)
{
  var model = this.model;

  Neuro.debug( Neuro.Events.REMOVE_LOCAL_ERROR, model, e );

  if ( model.$saved )
  {
    model.$addOperation( NeuroRemoveRemote );
  }
};
function NeuroRemoveNow(model)
{
  this.reset( model );
}

NeuroRemoveNow.prototype = new NeuroOperation( true, 'NeuroRemoveNow' );

NeuroRemoveNow.prototype.run = function(db, model)
{
  var key = model.$key();

  if ( db.models.has( key ) )
  {
    db.models.remove( key );
    db.trigger( 'model-removed', [model] );
    
    db.updated();

    model.$trigger('removed');
  }

  db.store.remove( key, this.success(), this.failure() );
};
function NeuroRemoveRemote(model)
{
  this.reset( model );
}

NeuroRemoveRemote.prototype = new NeuroOperation( true, 'NeuroRemoveRemote' );

NeuroRemoveRemote.prototype.run = function(db, model)
{
  // Cancel any pending saves
  model.$pendingSave = false;
  model.$deleted = true;

  // Grab key & encode to JSON
  this.key = model.$key();

  // Make the REST call to remove the model
  db.rest( 'DELETE', model, undefined, this.success(), this.failure() );
};

NeuroRemoveRemote.prototype.onSuccess = function(data)
{
  this.finishRemove();
};

NeuroRemoveRemote.prototype.onFailure = function(data, status)
{
  var operation = this;
  var key = this.key;
  var model = this.model;

  if ( status === 404 || status === 410 )
  {
    Neuro.debug( Neuro.Events.REMOVE_MISSING, this, key, model );

    this.finishRemove();
  }
  else if ( status !== 0 ) 
  {
    Neuro.debug( Neuro.Events.REMOVE_ERROR, this, status, key, model );
  } 
  else 
  {
    // Looks like we're offline!
    Neuro.checkNetworkStatus();

    // If we are offline, wait until we're online again to resume the delete
    if (!Neuro.online) 
    {
      Neuro.once('online', function() 
      {
        Neuro.debug( Neuro.Events.REMOVE_RESUME, operation, model );

        model.$addOperation( NeuroRemoveRemote );
      });
    }

    Neuro.debug( Neuro.Events.REMOVE_OFFLINE, this, model );
  }
};

NeuroRemoveRemote.prototype.finishRemove = function()
{
  var db = this.db;
  var key = this.key;
  var model = this.model;

  Neuro.debug( Neuro.Events.REMOVE_REMOTE, this, key, model );

  // Remove from local storage now
  this.insertNext( NeuroRemoveNow );

  // Publish REMOVE
  Neuro.debug( Neuro.Events.REMOVE_PUBLISH, this, key, model );

  db.live({
    op: 'REMOVE',
    key: key
  });
};
function NeuroSaveLocal(model)
{
  this.reset( model );
}

NeuroSaveLocal.prototype = new NeuroOperation( false, 'NeuroSaveLocal' );

NeuroSaveLocal.prototype.run = function(db, model)
{
  // If the model is deleted, return immediately!
  if ( model.$deleted )
  {
    Neuro.debug( Neuro.Events.SAVE_LOCAL_DELETED, this, model );

    return this.finish();
  }

  var encoded = model.$toJSON( false );

  // If this model doesn't have a local copy yet - create it.
  if ( !model.$local ) 
  {
    model.$local = encoded;
  } 
  else 
  {
    // Copy to the local copy
    transfer( encoded, model.$local );
  }

  db.store.put( model.$key(), model.$local, this.success(), this.failure() );
};

NeuroSaveLocal.prototype.onSuccess = function(key, encoded, previousValue)
{
  var model = this.model;

  Neuro.debug( Neuro.Events.SAVE_LOCAL, this, model );

  this.tryNext( NeuroSaveRemote );
};

NeuroSaveLocal.prototype.onFailure = function(e)
{
  var model = this.model;

  Neuro.debug( Neuro.Events.SAVE_LOCAL_ERROR, this, model, e );

  this.tryNext( NeuroSaveRemote );
};
function NeuroSaveNow(model)
{
  this.reset( model );
}

NeuroSaveNow.prototype = new NeuroOperation( false, 'NeuroSaveNow' );

NeuroSaveNow.prototype.run = function(db, model)
{
  db.store.put( model.$key(), model.$local, this.success(), this.failure() );
};
function NeuroSaveRemote(model)
{
  this.reset( model );
}

NeuroSaveRemote.prototype = new NeuroOperation( false, 'NeuroSaveRemote' );

NeuroSaveRemote.prototype.run = function(db, model)
{
  // If the model is deleted, return immediately!
  if ( model.$deleted )
  {
    Neuro.debug( Neuro.Events.SAVE_REMOTE_DELETED, this, model );

    return this.finish();
  }

  // Grab key & encode to JSON
  var key = this.key = model.$key();

  // The fields that have changed since last save
  var saving = this.saving = model.$getChanges( true );

  // If there's nothing to save, don't bother!
  if ( isEmpty( saving ) )
  {
    return this.finish();
  }

  // Make the REST call to save the model
  db.rest( model.$saved ? 'PUT' : 'POST', model, saving, this.success(), this.failure() );
};

NeuroSaveRemote.prototype.onSuccess = function(data)
{
  var model = this.model;

  Neuro.debug( Neuro.Events.SAVE_REMOTE, this, model );

  this.handleData( data );
};

NeuroSaveRemote.prototype.onFailure = function(data, status)
{
  var operation = this;
  var db = this.db;
  var model = this.model;

  // A non-zero status means a real problem occurred
  if ( status === 409 ) // 409 Conflict
  {
    Neuro.debug( Neuro.Events.SAVE_CONFLICT, this, data, model );

    // Update the model with the data saved and returned
    this.handleData( data, model, this.db );
  }
  else if ( status === 410 || status === 404 ) // 410 Gone, 404 Not Found
  {
    Neuro.debug( Neuro.Events.SAVE_UPDATE_FAIL, this, model );

    this.insertNext( NeuroRemoveNow );
  }
  else if ( status !== 0 ) 
  {          
    Neuro.debug( Neuro.Events.SAVE_ERROR, this, model, status );
  } 
  else 
  {
    // Check the network status right now
    Neuro.checkNetworkStatus();

    // If not online for sure, try saving once online again
    if (!Neuro.online) 
    {
      model.$pendingSave = true;

      Neuro.once('online', function() 
      {
        if ( model.$pendingSave )
        { 
          model.$pendingSave = false;
          model.$addOperation( NeuroSaveRemote );

          Neuro.debug( Neuro.Events.SAVE_RESUME, operation, model );
        }
      });
    }

    Neuro.debug( Neuro.Events.SAVE_OFFLINE, this, model );
  }
};

NeuroSaveRemote.prototype.handleData = function(data)
{
  var db = this.db;
  var model = this.model;
  var saving = this.saving;

  // Check deleted one more time before updating model.
  if ( model.$deleted )
  {
    Neuro.debug( Neuro.Events.SAVE_REMOTE_DELETED, this, model, data );

    return;
  }

  // If data was returned, place it in saving to update the model and publish
  for (var prop in data)
  {
    if ( !(prop in saving ) )
    {
      saving[ prop ] = data[ prop ];
    }
  }

  Neuro.debug( Neuro.Events.SAVE_VALUES, this, saving, model );

  // If the model hasn't been saved before - create the record where the 
  // local and model point to the same object.
  if ( !model.$saved )
  {
    if ( db.cache === false )
    {
      model.$saved = {};
    }
    else
    {
      model.$saved = model.$local.$saved = {}; 
    }
  }
  
  // Update the model with the return data
  db.putRemoteData( saving, this.key, model );

  // Publish saved data to everyone else
  Neuro.debug( Neuro.Events.SAVE_PUBLISH, this, saving, model );

  db.live({
    op: 'SAVE',
    model: saving,
    key: this.key
  });
};
function NeuroRelation()
{

}

Neuro.STORE_NONE = 0;
Neuro.STORE_MODEL = 1;
Neuro.STORE_KEY = 2;
Neuro.STORE_KEYS = 3;

Neuro.SAVE_NONE = 0;
Neuro.SAVE_MODEL = 4;

NeuroRelation.prototype = 
{

  /**
   * Initializes this relation with the given database, field, and options.
   * 
   * @param  {[type]} database [description]
   * @param  {[type]} field    [description]
   * @param  {[type]} options  [description]
   * @return {[type]}          [description]
   */
  init: function(database, field, options)
  {
    this.database = database;
    this.name = field;
    this.options = options;
    this.store = options.store || Neuro.STORE_NONE;
    this.save = options.save || Neuro.SAVE_NONE;
    this.auto = !!options.auto;
    this.property = !!options.property;

    var setNeuro = this.setNeuro( database, field, options );

    if ( !isNeuro( options.model ) )
    {
      Neuro.get( options.model, setNeuro, this );
    }
    else
    {
      setNeuro( options.model );
    }
  },

  /**
   * 
   * @param {[type]} neuro [description]
   */
  setNeuro: function(database, field, options)
  {
    return function(neuro)
    {
      this.model = neuro;

      if ( !this.property )
      {
        this.property = indexOf( database.fields, this.name ) !== false;        
      }

      this.onInitialized( database, field, options );
    };
  },

  /**
   * 
   * @param  {[type]} database [description]
   * @param  {[type]} fields   [description]
   * @param  {[type]} options  [description]
   * @return {[type]}          [description]
   */
  onInitialized: function(database, fields, options)
  {

  },

  /**
   * Loads the model.$relation variable with what is necessary to get, set, 
   * relate, and unrelate models. If serialize is true, look at model[ name ]
   * to load models/keys. If it contains values that don't exist or aren't 
   * actually related
   * 
   * @param  {[type]} model [description]
   * @return {[type]}       [description]
   */
  load: function(model)
  {
    
  },

  relate: function(model, input)
  {

  },

  unrelate: function(model, input)
  {

  },

  get: function(model)
  {

  },

  set: function(model, input)
  {
    this.unrelate( model );
    this.relate( model, input );
  },

  encode: function(model, out, forSaving)
  {
    
  },

  preSave: function(model)
  {

  },

  postSave: function(model)
  {

  },

  preRemove: function(model)
  {

  },

  postRemove: function(model)
  {

  },

  clearFields: function(target, targetFields)
  {
    var changes = false;

    if ( isString( targetFields ) )
    {
      if ( target[ targetFields ] )
      {
        target[ targetFields ] = null;
        changes = true;
      }
    }
    else // isArray ( targetFields )
    {
      for (var i = 0; i < targetFields.length; i++)
      {
        var targetField = targetFields[ i ];

        if ( target[ targetField ] )
        {
          target[ targetField ] = null;
          changes = true;
        }
      }
    }

    if ( changes && this.auto && !target.$isNew() )
    {
      target.$save();
    }
    
    return changes;
  },

  updateFields: function(target, targetFields, source, sourceFields)
  {
    var changes = false;

    source.$key();

    if ( isString( targetFields ) ) // && isString( sourceFields )
    {
      var targetValue = target[ targetFields ];
      var sourveValue = source[ sourceFields ];

      if ( !equals( targetValue, sourveValue ) )
      {
        target[ targetFields ] = sourveValue;
        changes = true;
      }
    }
    else // if ( isArray( targetFields ) && isArray( sourceFields ) )
    {
      for (var i = 0; i < targetFields.length; i++)
      {
        var targetField = targetFields[ i ];
        var targetValue = target[ targetField ];
        var sourceField = sourceFields[ i ];
        var sourceValue = source[ sourceField ];

        if ( !equals( targetValue, sourceValue ) )
        {
          target[ targetField ] = copy( sourceValue );
          changes = true;
        }
      }
    }

    if ( changes && this.auto && !target.$isNew() )
    {
      target.$save();
    }

    return changes;
  },

  getStoredArray: function(relateds, mode)
  {
    if ( !mode )
    {
      return null;
    }

    var stored = [];

    for (var i = 0; i < relateds.length; i++)
    {
      var related = this.getStored( relateds[ i ], mode );

      if ( related !== null )
      {
        stored.push( related );
      }
    }

    return stored;
  },

  getStored: function(related, mode)
  {
    if ( related )
    {
      switch (mode) 
      {
      case Neuro.SAVE_MODEL:
        return related.$toJSON( true );

      case Neuro.STORE_MODEL:
        if ( related.$local ) 
        {
          return related.$local;
        } 
        else 
        {
          var local = related.$toJSON( false );

          if ( related.$saved ) 
          {
            local.$saved = related.$saved;
          }

          return local;
        }

      case Neuro.STORE_KEY:
        return related.$key();

      case Neuro.STORE_KEYS:
        return related.$keys();

      }
    }

    return null;
  }

};
function NeuroBelongsTo()
{
  this.type = 'belongsTo';
}

extend( new NeuroRelation(), NeuroBelongsTo, 
{

  onInitialized: function(database, field, options)
  {
    var relatedDatabase = this.model.Database;

    this.local = options.local || ( relatedDatabase.name + '_' + relatedDatabase.key );

    Neuro.debug( Neuro.Events.BELONGSTO_INIT, this );
  },

  load: function(model)
  {
    var that = this;
    var relatedDatabase = this.model.Database;
    var initial = model[ this.name ];

    var relation = model.$relations[ this.name ] = 
    {
      initial: initial,
      model: null,
      loaded: false,

      onRemoved: function() 
      {
        Neuro.debug( Neuro.Events.BELONGSTO_NINJA_REMOVE, that, model, relation );

        if ( this.cascade !== false )
        {
          model.$remove();
        }
      },
      onSaved: function() 
      {
        Neuro.debug( Neuro.Events.BELONGSTO_NINJA_SAVE, that, model, relation );

        if ( !this.hasForeignKey( model, relation.model ) && this.cascade !== false )
        {
          model.$remove();
        }
      }
    };

    if ( isEmpty( initial ) && relatedDatabase.hasFields( model, this.local, isValue ) )
    {
      initial = pull( model, this.local );

      Neuro.debug( Neuro.Events.BELONGSTO_INITIAL_PULLED, this, model, initial );
    }

    if ( !isEmpty( initial ) )
    {
      Neuro.debug( Neuro.Events.BELONGSTO_INITIAL, this, model, initial );

      relatedDatabase.grabModel( initial, this.handleLoad( model, relation ), this );      
    }
  },

  // same as HasOne
  set: function(model, input)
  {
    if ( !isValue( input ) )
    {
      this.unrelate( model );
    }
    else
    {
      var relatedDatabase = this.model.Database;
      var related = relatedDatabase.parseModel( input );
      var relation = model.$relations[ this.name ];

      if ( related && !this.hasForeignKey( model, related ) )
      {
        this.clearModel( relation );
        this.setRelated( model, relation, related );
      }
    }
  },

  // same as HasOne
  relate: function(model, input)
  {
    var relatedDatabase = this.model.Database;
    var related = relatedDatabase.parseModel( input );
    var relation = model.$relations[ this.name ];
    
    if ( related )
    {
      if ( relation.model !== related )
      {
        this.clearModel( relation );
        this.setRelated( model, relation, related );
      }
    }
  },

  // same as HasOne
  unrelate: function(model, input)
  {
    var relatedDatabase = this.model.Database;
    var relation = model.$relations[ this.name ];
    var related = relatedDatabase.parseModel( input );

    if ( !related || relation.model === related )
    {
      this.clearModel( relation );
      this.clearForeignKey( model );
    }
  },

  // same as HasOne
  setRelated: function(model, relation, related)
  {
    this.setModel( relation, related );
    this.updateForeignKey( model, related );
    this.setProperty( model, relation );
  },

  // same as HasOne
  get: function(model)
  {
    var relation = model.$relations[ this.name ];
    
    return relation.model;
  },

  // same as HasOne
  encode: function(model, out, forSaving)
  {
    var relation = model.$relations[ this.name ];
    var mode = forSaving ? this.save : this.store;

    if ( relation && mode )
    {
      out[ this.name ] = this.getStored( relation.model, mode );
    }
  },

  postRemove: function(model)
  {
    var relation = model.$relations[ this.name ];

    if ( relation )
    {
      Neuro.debug( Neuro.Events.BELONGSTO_POSTREMOVE, this, model, relation );

      this.clearModel( relation );
    }
  },

  clearModel: function(relation)
  {
    if ( relation.model )
    {
      Neuro.debug( Neuro.Events.BELONGSTO_CLEAR_MODEL, this, relation );

      relation.model.$off( 'saved', relation.onSaved );
      relation.model.$off( 'removed', relation.onRemoved );

      relation.model = null;
      relation.loaded = true;
    }
  },

  setModel: function(relation, model)
  {
    model.$on( 'saved', relation.onSaved, this );
    model.$on( 'removed', relation.onRemoved, this );

    relation.model = model;
    relation.loaded = true;

    Neuro.debug( Neuro.Events.BELONGSTO_SET_MODEL, this, relation );
  },

  // same as HasOne
  handleLoad: function(model, relation)
  {
    return function(related) 
    {
      Neuro.debug( Neuro.Events.BELONGSTO_LOADED, this, model, relation, related );

      if ( relation.loaded === false ) 
      {
        if ( related ) 
        {
          this.setModel( relation, related );
          this.updateForeignKey( model, related );
        }
        else
        {
          this.clearForeignKey( model );
        }

        relation.loaded = true;

        this.setProperty( model, relation );
      }
    };
  },

  // same as HasOne
  hasForeignKey: function(model, related)
  {
    var relatedDatabase = this.model.Database;
    var local = this.local;
    var foreign = relatedDatabase.key;

    return propsMatch( model, local, related, foreign );
  },

  // same as HasOne
  clearForeignKey: function(model)
  {
    var local = this.local;

    Neuro.debug( Neuro.Events.BELONGSTO_CLEAR_KEY, this, model, local );

    this.clearFields( model, local );
  },

  // same as HasOne
  updateForeignKey: function(model, related)
  {
    var relatedDatabase = this.model.Database;
    var local = this.local;
    var foreign = relatedDatabase.key;

    Neuro.debug( Neuro.Events.BELONGSTO_UPDATE_KEY, this, model, local, related, foreign );

    this.updateFields( model, local, related, foreign );
  },

  // same as HasOne
  setProperty: function(model, relation)
  {
    if ( this.property )
    {
      model[ this.name ] = relation.model;
    }
  }

});

Neuro.RELATIONS[ 'belongsTo' ] = NeuroBelongsTo;
function NeuroHasMany()
{
  this.type = 'hasMany';
}

// cascadeSave = when model is saved, save children?
// cascadeRemove = when model is deleted, delete children?

extend( new NeuroRelation(), NeuroHasMany, 
{

  onInitialized: function(database, field, options)
  {
    this.foreign = options.foreign || ( database.name + '_' + database.key );
    this.comparator = createComparator( options.comparator );
    this.cascadeRemove = !!options.cascadeRemove;
    this.cascadeSave = !!options.cascadeSave;

    Neuro.debug( Neuro.Events.HASMANY_INIT, this );
  },

  load: function(model)
  {
    var that = this;
    var relatedDatabase = this.model.Database;
    var isRelated = this.isRelated( model );
    var initial = model[ this.name ];
 
    var relation = model.$relations[ this.name ] =
    {
      parent: model,
      isRelated: isRelated,
      initial: initial,
      pending: {},
      models: new NeuroMap(),
      saving: false,
      delaySorting: false,
      delaySaving: false,

      onRemoved: function() // this = model removed
      {
        that.removeModel( relation, this, true );
      },

      onSaved: function() // this = model saved
      {
        if ( relation.saving )
        {
          return;
        }

        if ( !isRelated( this ) )
        {
          that.removeModel( relation, this );
        }
        else
        {
          that.sort( relation );
          that.checkSave( relation );
        }
      }

    };

    // Populate the model's key if it's missing
    model.$key();

    // When models are added to the related database, check if it's related to this model
    relatedDatabase.on( 'model-added', this.handleModelAdded( relation ), this );
    
    // If the model's initial value is an array, populate the relation from it!
    if ( isArray( initial ) )
    {
      for (var i = 0; i < initial.length; i++)
      {
        var input = initial[ i ];
        var key = relatedDatabase.buildKeyFromInput( input );

        relation.pending[ key ] = true;
        relatedDatabase.grabModel( input, this.handleModel( relation ), this );
      }
    } 
    else
    {
      var source = relatedDatabase.models;
        
      relatedDatabase.ready( this.handleLazyLoad( relation, source ), this );
    }

    // We only need to set the property once since the underlying array won't change.
    this.setProperty( relation );
  },

  bulk: function(relation, callback)
  {
    relation.delaySorting = true;
    relation.delaySaving = true;

    callback.apply( this );

    relation.delaySorting = false;
    relation.delaySaving = false;

    this.sort( relation );
    this.checkSave( relation );
  },

  relate: function(model, input)
  {
    var relatedDatabase = this.model.Database;
    var relation = model.$relations[ this.name ];

    if ( this.isModelArray( input ) )
    {
      this.bulk( relation, function()
      {
        for (var i = 0; i < input.length; i++)
        {
          var related = relatedDatabase.parseModel( input[ i ] );

          if ( related )
          {
            this.addModel( relation, related );
          }
        }
      });
    }
    else if ( isValue( input ) )
    {
      var related = relatedDatabase.parseModel( input );

      if ( related )
      {
        this.addModel( relation, related );
      }
    }
  },

  unrelate: function(model, input)
  {
    var relatedDatabase = this.model.Database;
    var relation = model.$relations[ this.name ];

    if ( this.isModelArray( input ) )
    {
      this.bulk( relation, function()
      { 
        for (var i = 0; i < input.length; i++)
        {
          var related = relatedDatabase.parseModel( input[ i ] );

          if ( related )
          {
            this.removeModel( relation, related );
          }
        }
      });
    }
    else if ( isValue( input ) )
    {
      var related = relatedDatabase.parseModel( input );

      if ( related )
      {
        this.removeModel( relation, related );
      }
    }
    else
    {
      var all = relation.models.values;

      for (var i = all.length - 1; i >= 0; i--)
      {
        this.removeModel( relation, all[ i ] );
      }
    }
  },

  get: function(model)
  {
    var relation = model.$relations[ this.name ];

    return relation.models.values;
  },

  encode: function(model, out, forSaving)
  {
    var relation = model.$relations[ this.name ];
    var mode = forSaving ? this.save : this.store;

    if ( relation && mode )
    {
      out[ this.name ] = this.getStoredArray( relation.models.values, mode );
    }
  },

  postSave: function(model)
  {
    var relation = model.$relations[ this.name ];

    if ( relation && this.cascadeSave )
    {
      relation.saving = true;
      relation.delaySaving = true;

      var models = relation.models.values;

      for (var i = 0; i < models.length; i++)
      {
        var related = models[ i ];

        if ( related.$hasChanges() )
        {
          related.$save();
        }
      }

      relation.saving = false;
      relation.delaySaving = false;
    }
  },

  preRemove: function(model)
  {
    var relation = model.$relations[ this.name ];

    if ( relation && this.cascadeRemove )
    {
      this.bulk( relation, function()
      {
        var models = relation.models.values;

        for (var i = 0; i < models.length; i++)
        {
          var related = models[ i ];

          related.$remove();
        }
      });
    }
  },

  checkSave: function(relation)
  {
    if ( !relation.delaySaving )
    {
      if ( this.store === Neuro.STORE_MODEL || this.save === Neuro.SAVE_MODEL )
      {
        relation.parent.$save();
      }
    }
  },

  handleModelAdded: function(relation)
  {
    return function (related)
    {
      if ( relation.isRelated( related ) )
      {
        this.addModel( relation, related );
      }
    };
  },

  handleModel: function(relation)
  {
    return function (related)
    {
      var pending = relation.pending;
      var key = related.$key();

      if ( key in pending )
      {
        this.addModel( relation, related, true );

        delete pending[ key ];
      }
    };
  },

  handleLazyLoad: function(relation, source)
  {
    return function (relatedDatabase)
    {
      var map = source.filter( relation.isRelated );
      var models = map.values;

      this.bulk( relation, function()
      {
        for (var i = 0; i < models.length; i++)
        {
          this.addModel( relation, models[ i ] );
        }
      });
    };
  },

  addModel: function(relation, related, skipCheck)
  {
    var target = relation.models;
    var key = related.$key();
    var adding = !target.has( key );

    if ( adding )
    {
      target.put( key, related );

      related.$on( 'removed', relation.onRemoved );
      related.$on( 'saved remote-update', relation.onSaved );

      this.updateForeignKey( relation.parent, related );

      this.sort( relation );

      if ( skipCheck )
      {
        this.checkSave( relation );
      }
    }

    return adding;
  },

  removeModel: function(relation, related, alreadyRemoved)
  {
    var target = relation.models;
    var pending = relation.pending;
    var key = related.$key();

    if ( target.has( key ) )
    {
      target.remove( key );

      related.$off( 'removed', relation.onRemoved );
      related.$off( 'saved remote-update', relation.onSaved );

      this.clearForeignKey( related );

      if ( !alreadyRemoved && this.cascadeRemove )
      {
        related.$remove();
      }

      this.sort( relation );
      this.checkSave( relation );
    }

    delete pending[ key ];
  },

  updateForeignKey: function(model, related)
  {
    var foreign = this.foreign;
    var local = model.$db.key;

    this.updateFields( related, foreign, model, local );
  },

  clearForeignKey: function(related)
  {
    var foreign = this.foreign;

    this.clearFields( related, foreign );
  },

  isModelArray: function(input)
  {
    if ( !isArray( input ) )
    {
      return false;
    }

    var relatedDatabase = this.model.Database;
    var relatedKey = relatedDatabase.key;

    if ( !isArray( relatedKey ) )
    {
      return false;
    }

    if ( relatedKey.length !== input.length )
    {
      return false;
    }

    for ( var i = 0; i < input.length; i++ )
    {
      if ( !isNumber( input[ i ] ) && !isString( input[ i ] ) )
      {
        return false;
      }
    }

    return true;
  },

  isRelated: function(model)
  {
    var foreign = this.foreign;
    var local = model.$db.key;

    return function(related)
    {
      return propsMatch( related, foreign, model, local );
    };
  },

  setProperty: function(relation)
  {
    if ( this.property )
    {
      relation.parent[ this.name ] = relation.models.values;
    }
  },

  sort: function(relation)
  {
    var related = relation.models;

    if ( !relation.delaySorting && !related.isSorted( this.comparator ) )
    {
      related.sort( this.comparator );
    }
  }

});

Neuro.RELATIONS[ 'hasMany' ] = NeuroHasMany;
function NeuroHasOne()
{
  this.type = 'hasOne';
}

extend( new NeuroRelation(), NeuroHasOne, 
{

  onInitialized: function(database, field, options)
  {
    var relatedDatabase = this.model.Database;

    this.local = options.local || ( relatedDatabase.name + '_' + relatedDatabase.key );

    Neuro.debug( Neuro.Events.HASONE_INIT, this );
  },

  load: function(model)
  {
    var that = this;
    var relatedDatabase = this.model.Database;
    var initial = model[ this.name ];

    var relation = model.$relations[ this.name ] = 
    {
      initial: initial,
      model: null,
      loaded: false,
      dirty: false,
      saving: false,

      onRemoved: function() 
      {
        Neuro.debug( Neuro.Events.HASONE_NINJA_REMOVE, that, model, relation );

        this.clearModel( relation, true );
        this.clearForeignKey( model );
      },
      onSaved: function() 
      {
        if ( relation.saving )
        {
          return;
        }

        Neuro.debug( Neuro.Events.HASONE_NINJA_SAVE, that, model, relation );

        if ( !this.hasForeignKey( model, relation.model ) )
        {
          this.clearModel( relation );
          this.clearForeignKey( model );
        }
      }
    };

    if ( isEmpty( initial ) && relatedDatabase.hasFields( model, this.local, isValue ) )
    {
      initial = pull( model, this.local );

      Neuro.debug( Neuro.Events.HASONE_INITIAL_PULLED, this, model, initial );
    }

    if ( !isEmpty( initial ) )
    {
      Neuro.debug( Neuro.Events.HASONE_INITIAL, this, model, initial );

      relatedDatabase.grabModel( initial, this.handleLoad( model, relation ), this );      
    }
  },

  set: function(model, input)
  {
    if ( !isValue( input ) )
    {
      this.unrelate( model );
    }
    else
    {
      var relatedDatabase = this.model.Database;
      var related = relatedDatabase.parseModel( input );
      var relation = model.$relations[ this.name ];

      if ( related && !this.hasForeignKey( model, related ) )
      {
        this.clearModel( relation );
        this.setRelated( model, relation, related );
      }
    }
  },

  relate: function(model, input)
  {
    var relatedDatabase = this.model.Database;
    var related = relatedDatabase.parseModel( input );
    var relation = model.$relations[ this.name ];
    
    if ( related )
    {
      if ( relation.model !== related )
      {
        this.clearModel( relation );
        this.setRelated( model, relation, related );
      }
    }
  },

  unrelate: function(model, input)
  {
    var relatedDatabase = this.model.Database;
    var relation = model.$relations[ this.name ];
    var related = relatedDatabase.parseModel( input );

    if ( !related || relation.model === related )
    {
      this.clearModel( relation );
      this.clearForeignKey( model );
    }
  },

  setRelated: function(model, relation, related)
  {
    this.setModel( relation, related );
    this.updateForeignKey( model, related );
    this.setProperty( model, relation );
  },

  get: function(model)
  {
    var relation = model.$relations[ this.name ];
    
    return relation.model;
  },

  encode: function(model, out, forSaving)
  {
    var relation = model.$relations[ this.name ];
    var mode = forSaving ? this.save : this.store;

    if ( relation && mode )
    {
      out[ this.name ] = this.getStored( relation.model, mode );
    }
  },

  preSave: function(model)
  {
    var relation = model.$relations[ this.name ];

    if ( relation && relation.model )
    {
      var related = relation.model;  

      if ( !this.hasForeignKey( model, related ) )
      {
        // this.set( model, model[ this.local ] ) ?
      }

      if ( relation.dirty || related.$hasChanges() )
      {
        Neuro.debug( Neuro.Events.HASONE_PRESAVE, this, model, relation );

        relation.saving = true;
        related.$save();
        relation.saving = false;
        relation.dirty = false;
      }
    }
  },

  postRemove: function(model)
  {
    var relation = model.$relations[ this.name ];

    if ( relation )
    {
      if ( this.cascade !== false )
      {
        Neuro.debug( Neuro.Events.HASONE_POSTREMOVE, this, model, relation );

        this.clearModel( relation );
      }
    }
  },

  clearModel: function(relation, dontRemove)
  {
    if ( relation.model )
    {
      Neuro.debug( Neuro.Events.HASONE_CLEAR_MODEL, this, relation );

      relation.model.$off( 'saved', relation.onSaved );
      relation.model.$off( 'removed', relation.onRemoved );

      if ( !dontRemove )
      {
        relation.model.$remove();
      }

      relation.model = null;
      relation.dirty = true;
      relation.loaded = true;
    }
  },

  setModel: function(relation, model)
  {
    model.$on( 'saved', relation.onSaved, this );
    model.$on( 'removed', relation.onRemoved, this );

    relation.model = model;
    relation.dirty = true;
    relation.loaded = true;

    Neuro.debug( Neuro.Events.HASONE_SET_MODEL, this, relation );
  },

  handleLoad: function(model, relation)
  {
    return function(related) 
    {
      Neuro.debug( Neuro.Events.HASONE_LOADED, this, model, relation, related );

      if ( relation.loaded === false ) 
      {
        if ( related ) 
        {
          this.setModel( relation, related );
          this.updateForeignKey( model, related );
        }
        else
        {
          this.clearForeignKey( model );
        }

        relation.loaded = true;

        this.setProperty( model, relation );
      }
    };
  },

  hasForeignKey: function(model, related)
  {
    var relatedDatabase = this.model.Database;
    var local = this.local;
    var foreign = relatedDatabase.key;

    return propsMatch( model, local, related, foreign );
  },

  clearForeignKey: function(model)
  {
    var local = this.local;

    Neuro.debug( Neuro.Events.HASONE_CLEAR_KEY, this, model, local );

    this.clearFields( model, local );
  },

  updateForeignKey: function(model, related)
  {
    var relatedDatabase = this.model.Database;
    var local = this.local;
    var foreign = relatedDatabase.key;

    Neuro.debug( Neuro.Events.HASONE_UPDATE_KEY, this, model, local, related, foreign );

    this.updateFields( model, local, related, foreign );
  },

  setProperty: function(model, relation)
  {
    if ( this.property )
    {
      model[ this.name ] = relation.model;
    }
  }

});

Neuro.RELATIONS[ 'hasOne' ] = NeuroHasOne;

  /* Top-Level Function */
  global.Neuro = Neuro;

  /* Classes */
  global.Neuro.Model = NeuroModel;
  global.Neuro.Database = NeuroDatabase;
  global.Neuro.Relation = NeuroRelation;
  global.Neuro.Operation = NeuroOperation;

  /* Utility Functions */
  global.Neuro.uuid = uuid;
  global.Neuro.indexOf = indexOf;
  global.Neuro.extend = extend;
  global.Neuro.transfer = transfer;
  global.Neuro.swap = swap;
  global.Neuro.grab = grab;
  global.Neuro.pull = pull;
  global.Neuro.copy = copy;
  global.Neuro.diff = diff;
  global.Neuro.isEmpty = isEmpty;
  global.Neuro.compare = compare;
  global.Neuro.equals = equals;
  global.Neuro.equalsStrict = equalsStrict;
  global.Neuro.createComparator = createComparator;

})(window);