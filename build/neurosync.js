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
  return !!(x !== undefined && x !== null);
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

function extend(parent, child, override)
{
  transfer( override, child.prototype = parent );
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

function applyOptions( target, options, defaults )
{
  for (var prop in defaults)
  {
    var defaultValue = defaults[ prop ];
    var option = options[ prop ];

    if ( !option && defaultValue === undefined )
    {
      throw ( prop + ' is a required option' );
    }
    else if ( isValue( option ) )
    {
      target[ prop ] = option;
    }
    else
    {
      target[ prop ] = copy( defaultValue );
    }
  }

  target.options = options;
}

function ClassNameReplacer(match)
{
  return match.length === 1 ? match.toUpperCase() : match.charAt(1).toUpperCase(); 
}

function toClassName(name)
{
  return name.replace( /(^.|_.)/g, ClassNameReplacer );
};

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
  if (x === null || x === undefined || typeof x !== 'object' || isFunction(x) || isRegExp(x))
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

    return c;
  }

  if (isDate(x))
  {
    return new Date( x.getTime() );
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

function sizeof(x)
{
  if ( isArray(x) || isString(x) )
  {
    return x.length;
  }
  else if ( isObject(x) )
  {
    var properties = 0;

    for (var prop in x)
    {
      properties++;
    }

    return properties;
  }
  
  return 0;
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
      if (p.charAt(0) !== '$' && !isFunction(a[p])) {
        if (!(p in b) || !equals(a[p], b[p])) {
          return false;
        }
      }
    }
    for (var p in b) {
      if (p.charAt(0) !== '$' && !isFunction(b[p])) {
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

function compare(a, b, nullsFirst)
{
  if (a == b) 
  {
    return 0;
  }

  var av = isValue( a );
  var bv = isValue( b );

  if (av !== bv)
  {
    return (av && !nullsFirst) || (bv && nullsFirst) ? -1 : 1;
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

function createComparator(comparator, nullsFirst)
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
        var av = isValue( a ) ? a[ comparator ] : a;
        var bv = isValue( b ) ? b[ comparator ] : b; 

        return compare( bv, av, !nullsFirst );
      };
    }
    else
    {
      return function compareObjects(a, b)
      {
        var av = isValue( a ) ? a[ comparator ] : a;
        var bv = isValue( b ) ? b[ comparator ] : b; 

        return compare( av, bv, nullsFirst );
      };
    }
  }
  else if ( isArray( comparator ) )
  {
    var parsed = [];

    for (var i = 0; i < comparator.length; i++)
    {
      parsed[ i ] = createComparator( comparator[ i ], nullsFirst );
    }

    return function compareObjectsCascade(a, b)
    {
      var d = 0;

      for (var i = 0; i < parsed.length && d === 0; i++)
      {
        d = parsed[ i ]( a, b );
      }

      return d;
    };
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

  var CALLBACK_FUNCTION = 0;
  var CALLBACK_CONTEXT = 1;
  var CALLBACK_GROUP = 2;

  var triggerId = 0;

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
      
      $this[ property ][ events[i] ].push( [ callback, context || $this, 0 ] );
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

function Neuro(options)
{
  var database = new NeuroDatabase( options );

  var model = new Function('return function ' + database.className + '(props, exists) { this.$init( props, exists ) }')();

  model.prototype = new NeuroModel( database );

  database.model = model;
  database.init();

  Neuro.debug( Neuro.Debugs.CREATION, database, options );

  model.Database = database;
  model.Model = model;

  model.all = function()
  {
    return database.getModels();
  };

  model.create = function(props)
  {
    var inst = new model( props );
    inst.$save();
    return inst;
  };

  Neuro.cache[ options.name ] = model;
  Neuro.cache[ options.className ] = model;

  Neuro.trigger( Neuro.Events.Initialized, [model] );

  return model;
}

Neuro.Events = 
{
  Initialized:  'initialized',
  Online:       'online',
  Offline:      'offline'
};

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
      function checkNeuro()
      {
        var cached = Neuro.cache[ name ];

        if ( cached )
        {
          callback.call( callbackContext, cached );

          Neuro.off( Neuro.Events.Initialized, checkNeuro );
        }
      }

      Neuro.on( Neuro.Events.Initialized, checkNeuro );
    }
  }

  return cached;
};

eventize( Neuro );


Neuro.debug = function(event, source)  /*, data.. */
{
  // up to the user
};

Neuro.Debugs = {

  CREATION: 0,                // options

  REST: 1,                    // options
  AUTO_REFRESH: 73,           // 

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
  BELONGSTO_POSTREMOVE: 69,    // NeuroModel, relation
  BELONGSTO_CLEAR_KEY: 70,     // NeuroModel, local
  BELONGSTO_UPDATE_KEY: 71,    // NeuroModel, local, NeuroModel, foreign
  BELONGSTO_LOADED: 72,        // NeuroModel, relation, [NeuroModel]

  HASMANY_INIT: 74,             // NeuroHasMany
  HASMANY_NINJA_REMOVE: 75,     // NeuroModel, NeuroModel, relation
  HASMANY_NINJA_SAVE: 76,       // NeuroModel, NeuroModel, relation
  HASMANY_INITIAL: 77,          // NeuroModel, relation, initial
  HASMANY_INITIAL_PULLED: 78,   // NeuroModel, relation
  HASMANY_REMOVE: 79,           // relation, NeuroModel
  HASMANY_SORT: 80,             // relation
  HASMANY_ADD: 81,              // relation, NeuroModel
  HASMANY_LAZY_LOAD: 82,        // relation, NeuroModel[]
  HASMANY_INITIAL_GRABBED: 83,  // relation, NeuroModel
  HASMANY_NINJA_ADD: 84,        // relation, NeuroModel
  HASMANY_AUTO_SAVE: 85,        // relation
  HASMANY_PREREMOVE: 86,        // NeuroModel, relation
  HASMANY_POSTSAVE: 87,         // NeuroModel, relation

  HASMANYTHRU_INIT: 88,             // NeuroHasMany
  HASMANYTHRU_NINJA_REMOVE: 89,     // NeuroModel, NeuroModel, relation
  HASMANYTHRU_NINJA_SAVE: 90,       // NeuroModel, NeuroModel, relation
  HASMANYTHRU_NINJA_THRU_REMOVE: 91,// NeuroModel, NeuroModel, relation
  HASMANYTHRU_INITIAL: 92,          // NeuroModel, relation, initial
  HASMANYTHRU_INITIAL_PULLED: 93,   // NeuroModel, relation
  HASMANYTHRU_REMOVE: 94,           // relation, NeuroModel
  HASMANYTHRU_SORT: 95,             // relation
  HASMANYTHRU_ADD: 96,              // relation, NeuroModel
  HASMANYTHRU_LAZY_LOAD: 97,        // relation, NeuroModel[]
  HASMANYTHRU_INITIAL_GRABBED: 98,  // relation, NeuroModel
  HASMANYTHRU_NINJA_ADD: 99,        // relation, NeuroModel
  HASMANYTHRU_AUTO_SAVE: 100,       // relation
  HASMANYTHRU_PREREMOVE: 101,       // NeuroModel, relation
  HASMANYTHRU_POSTSAVE: 102,        // NeuroModel, relation  
  HASMANYTHRU_THRU_ADD: 103,        // relation, NeuroModel
  HASMANYTHRU_THRU_REMOVE: 68       // relation, NeuroModel, NeuroModel


};

// Neuro.rest = function(options, success(data), failure(data, status))

Neuro.rest = function(database)
{
  
  return {

    // success ( data[] )
    // failure ( data[], status )
    all: function( success, failure )
    {
      failure( [], 0 );
    },

    // success ( data )
    // failure ( data, status )
    create: function( model, encoded, success, failure )
    {
      failure( {}, 0 );
    },

    // success ( data )
    // failure ( data, status )
    update: function( model, encoded, success, failure )
    {
      failure( {}, 0 );
    },

    // success ( data )
    // failure ( data, status )
    remove: function( model, success, failure )
    {
      failure( {}, 0 );
    }

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
  Neuro.debug( Neuro.Debugs.ONLINE );
  Neuro.trigger( Neuro.Events.Online );
};

// Set network status to offline and notify all listeners
Neuro.setOffline = function()
{
  Neuro.online = false;
  Neuro.debug( Neuro.Debugs.OFFLINE );
  Neuro.trigger( Neuro.Events.Offline );
};

// This must be called manually - this will try to use built in support for 
// online/offline detection instead of solely using status codes of 0.
Neuro.listenToNetworkStatus = function()
{
  if (window.addEventListener) 
  {
    window.addEventListener( Neuro.Events.Online, Neuro.setOnline, false );
    window.addEventListener( Neuro.Events.Offline, Neuro.setOffline, false );
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
  var defaults = NeuroDatabase.Defaults;

  // Apply the options to this database!
  applyOptions( this, options, defaults );

  // Apply options not specified in defaults
  for (var prop in options)
  {
    if ( !(prop in defaults) )
    {
      this[ prop ] = options[ prop ];
    }
  }

  // Properties
  this.models = new NeuroMap();
  this.className = this.className || toClassName( this.name );
  this.initialized = false;
  this.pendingRefresh = false;
  this.localLoaded = false;
  this.remoteLoaded = false;
  this.remoteOperations = 0;
  this.afterOnline = false;

  // Services
  this.rest   = Neuro.rest( this );
  this.store  = Neuro.store( this );
  this.live   = Neuro.live( this, this.handlePublish( this ) );

  // Functions
  this.setComparator( this.comparator, this.comparatorNullsFirst );
  this.setRevision( this.revision );
  this.setToString( this.toString );

  // Relations
  this.relations = {};

  for (var relationType in options)
  {
    if ( !(relationType in Neuro.Relations) )
    {
      continue;
    }

    var RelationClass = Neuro.Relations[ relationType ];

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

NeuroDatabase.Events = 
{
  NoLoad:       'no-load',
  RemoteLoad:   'remote-load',
  LocalLoad:    'local-load',
  Updated:      'updated',
  ModelAdded:   'model-added',
  ModelUpdated: 'model-updated',
  ModelRemoved: 'model-removed',
  Loads:        'no-load remote-load local-load'
};

NeuroDatabase.Live = 
{
  Save:         'SAVE',
  Remove:       'REMOVE'
};

NeuroDatabase.Defaults = 
{
  name:                 undefined, // required
  className:            null, // defaults to name
  key:                  'id',
  keySeparator:         '/',
  fields:               undefined, // required
  defaults:             {},
  comparator:           null,
  comparatorNullsFirst: null,
  revision:             null,
  loadRelations:        true,
  loadRemote:           true,
  autoRefresh:          true,
  cache:                true,
  cachePending:         false,
  fullSave:             false,
  fullPublish:          false,
  encode:               function(data) { return data; },
  decode:               function(rawData) { return rawData; },
  toString:             function(model) { return model.$key() }
};

NeuroDatabase.prototype =
{

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
        db.off( NeuroDatabase.Events.Loads, onReady );
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

      db.on( NeuroDatabase.Events.Loads, onReady );
    }

    return invoked;
  },

  // Grab a model with the given input and notify the callback
  grabModel: function(input, callback, context, fromStorage)
  {
    var db = this;
    var callbackContext = context || db;

    function checkModel()
    {
      var result = db.parseModel( input, fromStorage !== false );

      if ( result !== false )
      {
        callback.call( callbackContext, result );
      }

      return result === null ? false : true;
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
    var hasRemote = db.remoteLoaded || !db.loadRemote;

    if ( !isValue( input ) )
    {
      return hasRemote ? null : false;
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
    else if ( hasRemote )
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
      key = key.join( this.keySeparator );
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
    return arr.join( this.keySeparator );
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
    this.trigger( NeuroDatabase.Events.Updated );
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
        return (revision in a && revision in b) ? (compare( a[ revision ], b[ revision ] )) : false;
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
  setComparator: function(comparator, nullsFirst)
  {
    this.comparatorFunction = createComparator( comparator, nullsFirst );
  },

  setToString: function(toString)
  {
    if ( isFunction( toString ) )
    {
      this.toString = toString;
    }
    else if ( isString( toString ) )
    {
      this.toString = function(model)
      {
        return isValue( model ) ? model[ toString ] : model;
      };
    }
    else
    {
      this.toString = function(model)
      {
        return model.$key();
      };
    }
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
        Neuro.debug( Neuro.Debugs.SAVE_OLD_REVISION, db, model, encoded );

        return model;
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

          if ( db.cache )
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
        model.$trigger( NeuroModel.Events.PartialUpdate, [encoded, conflicts] );
      }
      else
      {
        model.$trigger( NeuroModel.Events.FullUpdate, [encoded, updated] );
      }

      model.$trigger( NeuroModel.Events.RemoteUpdate, [encoded] );

      if ( db.cache )
      {
        model.$addOperation( NeuroSaveNow ); 
      }
    }
    else
    {
      model = db.instantiate( decoded, fromStorage );

      if ( db.cache )
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
      db.trigger( NeuroDatabase.Events.ModelAdded, [model] );

      if ( !fromStorage )
      {
        model.$trigger( NeuroModel.Events.Saved ); 
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

        model.$trigger( NeuroModel.Events.Detach );

        return false;
      }

      db.models.remove( key );
      db.trigger( NeuroDatabase.Events.ModelRemoved, [model] );

      model.$trigger( NeuroModel.Events.RemoteAndRemove );

      Neuro.debug( Neuro.Debugs.REMOTE_REMOVE, db, model );

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

        model.$trigger( NeuroModel.Events.Detach );

        model.$addOperation( NeuroSaveNow );
     
        return false;
      }

      model.$addOperation( NeuroRemoveNow );

      db.models.remove( key );
      db.trigger( NeuroDatabase.Events.ModelRemoved, [model] );

      model.$trigger( NeuroModel.Events.RemoteAndRemove );

      Neuro.debug( Neuro.Debugs.REMOTE_REMOVE, db, model );
    }
    else
    {
      db.store.remove( key, function(removedValue)
      {
        if (removedValue) 
        {
          Neuro.debug( Neuro.Debugs.REMOTE_REMOVE, db, removedValue );
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

    if ( !db.cache )
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

    if ( db.loadRemote && db.autoRefresh )
    {
      Neuro.after( 'online', db.onOnline, db );
    }

    if ( !db.cache )
    {
      if ( db.loadRemote )
      {
        db.refresh();
      }
      else
      {
        db.initialized = true;
        db.trigger( NeuroDatabase.Events.NoLoad, [db] );
      }

      return;
    }

    db.store.all( onLocalLoad, onLocalError );    

    function onLocalLoad(records, keys)
    {
      Neuro.debug( Neuro.Debugs.LOCAL_LOAD, db, records );

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
          Neuro.debug( Neuro.Debugs.LOCAL_RESUME_DELETE, db, model );

          model.$addOperation( NeuroRemoveRemote );
        }
        else
        {
          if ( !encoded.$saved )
          {
            Neuro.debug( Neuro.Debugs.LOCAL_RESUME_SAVE, db, model );

            model.$addOperation( NeuroSaveRemote );
          }
          else
          {
            Neuro.debug( Neuro.Debugs.LOCAL_LOAD_SAVED, db, model );

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

      db.trigger( NeuroDatabase.Events.LocalLoad, [db] );

      db.updated();

      if ( db.loadRemote )
      {
        db.refresh();
      }
    }

    function onLocalError()
    {
      db.initialized = true;

      if ( db.loadRemote )
      {
        db.refresh();
      }
      else
      {
        db.trigger( NeuroDatabase.Events.NoLoad, [db] );
      }
    }
  },

  onOnline: function()
  {
    this.afterOnline = true;

    if ( this.remoteOperations === 0 )
    {
      this.onRemoteRest();
    }
  },

  onRemoteRest: function()
  {
    var db = this;

    if ( db.autoRefresh && db.remoteLoaded )
    {
      if ( db.afterOnline )
      {
        db.afterOnline = false;
        
        Neuro.debug( Neuro.Debugs.AUTO_REFRESH, db );

        db.refresh();
      }
    }
  },

  // Loads all data remotely
  refresh: function()
  {
    var db = this;

    db.rest.all( onModels, onLoadError );
    
    function onModels(models) 
    {
      var mapped = {};

      for (var i = 0; i < models.length; i++)
      {
        var model = db.putRemoteData( models[ i ] );

        if ( model )
        {
          var key = model.$key();

          mapped[ key ] = model; 
        }
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
            Neuro.debug( Neuro.Debugs.REMOTE_LOAD_REMOVE, db, k );

            db.destroyLocalModel( k );
          }
        }
      }

      db.initialized = true;
      db.remoteLoaded = true;

      db.trigger( NeuroDatabase.Events.RemoteLoad, [db] );

      db.updated();

      Neuro.debug( Neuro.Debugs.REMOTE_LOAD, db, models );
    }

    function onLoadError(models, status) 
    {
      if ( status === 0 )
      {
        Neuro.checkNetworkStatus();

        if ( !Neuro.online )
        {
          db.pendingRefresh = true;

          Neuro.once( 'online', db.onRefreshOnline, db );
        }

        Neuro.debug( Neuro.Debugs.REMOTE_LOAD_OFFLINE, db );
      }
      else
      {
        Neuro.debug( Neuro.Debugs.REMOTE_LOAD_ERROR, db, status );

        db.initialized = true;
        db.trigger( NeuroDatabase.Events.NoLoad, [db] );
      }
    }
  
  },

  onRefreshOnline: function()
  {
    var db = this;

    Neuro.debug( Neuro.Debugs.REMOTE_LOAD_RESUME, db );

    if ( db.pendingRefresh )
    {
      db.pendingRefresh = false;

      db.refresh(); 
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
      case NeuroDatabase.Live.Save:

        db.putRemoteData( encoded, key );
        db.updated();

        Neuro.debug( Neuro.Debugs.REALTIME_SAVE, db, message.model, key );
        break;

      case NeuroDatabase.Live.Remove:

        if ( db.destroyLocalModel( key ) )
        {
          db.updated(); 
        }

        Neuro.debug( Neuro.Debugs.REALTIME_REMOVE, db, key );
        break;
      }
    };
  },

  // Return an instance of the model with the data as initial values
  instantiate: function(data, fromStorage)
  {
    return new this.model( data, fromStorage );
  },

  // Save the model
  save: function(model)
  {
    var db = this;
    var key = model.$key();

    // If the model is deleted, return immediately!
    if ( model.$deleted )
    {
      Neuro.debug( Neuro.Debugs.SAVE_DELETED, db, model );

      return;
    }

    // Place the model and trigger a database update.
    if ( !db.models.has( key ) )
    {
      db.models.put( key, model );
      db.trigger( NeuroDatabase.Events.ModelAdded, [model] );
      db.updated();

      model.$trigger( NeuroModel.Events.CreateAndSave );
    }
    else
    {
      db.trigger( NeuroDatabase.Events.ModelUpdated, [model] );

      model.$trigger( NeuroModel.Events.UpdateAndSave );
    }

    if ( !db.cache )
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
      db.trigger( NeuroDatabase.Events.ModelRemoved, [model] );
      db.updated();

      model.$trigger( NeuroModel.Events.Removed );
    }

    // Mark as deleted right away
    model.$deleted = true;

    // If we're offline and we have a pending save - cancel the pending save.
    if ( model.$pendingSave )
    {
      Neuro.debug( Neuro.Debugs.REMOVE_CANCEL_SAVE, db, model );

      model.$pendingSave = false; 
    }

    if ( !db.cache )
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

NeuroModel.Events = 
{
  Created:          'created',
  Saved:            'saved',
  PartialUpdate:    'partial-update',
  FullUpdate:       'full-update',
  Updated:          'updated',
  Detach:           'detach',
  CreateAndSave:    'created saved',
  UpdateAndSave:    'updated saved',
  Removed:          'removed',
  RemoteUpdate:     'remote-update',
  RemoteRemove:     'remote-remove',
  RemoteAndRemove:  'remote-remove removed'
};

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
      for (var prop in props)
      {
        this.$set( prop, props[ prop ] );
      }
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

  $isRelated: function(prop, related)
  {
    var relation = this.$getRelation( prop );

    return relation && relation.isRelated( this, related );
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

  $getChanges: function(alreadyEncoded)
  {
    var saved = this.$saved;
    var encoded = alreadyEncoded || this.$toJSON( true );
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
  },

  toString: function()
  {
    return this.$db.className + ' ' + JSON.stringify( this.$toJSON() );
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
    this.db.remoteOperations++;

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

      this.db.remoteOperations--;

      if ( this.db.remoteOperations === 0 )
      {
        this.db.onRemoteRest();
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

function NeuroRemoveCache(model)
{
  this.reset( model );
}

extend( new NeuroOperation( true, 'NeuroRemoveCache' ), NeuroRemoveCache,
{

  run: function(db, model)
  {
    model.$pendingSave = false;

    db.store.remove( model.$key(), this.success(), this.failure() );
  }

});
function NeuroRemoveLocal(model)
{
  this.reset( model );
}

extend( new NeuroOperation( true, 'NeuroRemoveLocal' ), NeuroRemoveLocal, 
{

  run: function(db, model)
  {
    var key = model.$key();

    // If there is no local there's nothing to remove from anywhere!
    if ( !model.$local )
    {
      Neuro.debug( Neuro.Debugs.REMOVE_LOCAL_NONE, model );

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
      Neuro.debug( Neuro.Debugs.REMOVE_LOCAL_UNSAVED, model );

      db.store.remove( key, this.success(), this.failure() );
    }
  },

  onSuccess: function(key, encoded, previousValue)
  {
    var model = this.model;

    Neuro.debug( Neuro.Debugs.REMOVE_LOCAL, model );

    if ( model.$saved )
    {
      model.$addOperation( NeuroRemoveRemote );
    }
  },

  onFailure: function(e)
  {
    var model = this.model;

    Neuro.debug( Neuro.Debugs.REMOVE_LOCAL_ERROR, model, e );

    if ( model.$saved )
    {
      model.$addOperation( NeuroRemoveRemote );
    }
  }

});
function NeuroRemoveNow(model)
{
  this.reset( model );
}

extend( new NeuroOperation( true, 'NeuroRemoveNow' ), NeuroRemoveNow,
{

  run: function(db, model)
  {
    var key = model.$key();

    model.$pendingSave = false;

    if ( db.models.has( key ) )
    {
      db.models.remove( key );
      db.trigger( 'model-removed', [model] );
      
      db.updated();

      model.$trigger('removed');
    }

    db.store.remove( key, this.success(), this.failure() );
  }

});
function NeuroRemoveRemote(model)
{
  this.reset( model );
}

extend( new NeuroOperation( true, 'NeuroRemoveRemote' ), NeuroRemoveRemote,
{

  run: function(db, model)
  {
    // Cancel any pending saves
    model.$pendingSave = false;
    model.$deleted = true;

    // Grab key & encode to JSON
    this.key = model.$key();

    // Make the REST call to remove the model
    db.rest.remove( model, this.success(), this.failure() );
  },

  onSuccess: function(data)
  {
    this.finishRemove();
  },

  onFailure: function(data, status)
  {
    var key = this.key;
    var model = this.model;

    if ( status === 404 || status === 410 )
    {
      Neuro.debug( Neuro.Debugs.REMOVE_MISSING, model, key );

      this.finishRemove();
    }
    else if ( status !== 0 ) 
    {
      Neuro.debug( Neuro.Debugs.REMOVE_ERROR, model, status, key );
    } 
    else 
    {
      // Looks like we're offline!
      Neuro.checkNetworkStatus();

      // If we are offline, wait until we're online again to resume the delete
      if (!Neuro.online) 
      {
        Neuro.once( 'online', this.handleOnline, this );
      }

      Neuro.debug( Neuro.Debugs.REMOVE_OFFLINE, model );
    }
  },

  finishRemove: function()
  {
    var db = this.db;
    var key = this.key;
    var model = this.model;

    Neuro.debug( Neuro.Debugs.REMOVE_REMOTE, model, key );

    // Remove from local storage now
    this.insertNext( NeuroRemoveNow );

    // Publish REMOVE
    Neuro.debug( Neuro.Debugs.REMOVE_PUBLISH, model, key );

    db.live({
      op: NeuroDatabase.Live.Remove,
      key: key
    });
  },

  handleOnline: function()
  {
    var model = this.model;

    Neuro.debug( Neuro.Debugs.REMOVE_RESUME, model );

    model.$addOperation( NeuroRemoveRemote );
  }

});


function NeuroSaveLocal(model)
{
  this.reset( model );
}

extend( new NeuroOperation( false, 'NeuroSaveLocal' ), NeuroSaveLocal,
{

  run: function(db, model)
  {
    // If the model is deleted, return immediately!
    if ( model.$deleted )
    {
      Neuro.debug( Neuro.Debugs.SAVE_LOCAL_DELETED, model );

      return this.finish();
    }

    // Fill the key if need be
    var key = model.$key();
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

    db.store.put( key, model.$local, this.success(), this.failure() );
  },

  onSuccess: function(key, encoded, previousValue)
  {
    var db = this.db;
    var model = this.model;

    Neuro.debug( Neuro.Debugs.SAVE_LOCAL, model );

    this.tryNext( NeuroSaveRemote );
  },

  onFailure: function(e)
  {
    var model = this.model;

    Neuro.debug( Neuro.Debugs.SAVE_LOCAL_ERROR, model, e );

    this.tryNext( NeuroSaveRemote );
  }

});

function NeuroSaveNow(model)
{
  this.reset( model );
}

extend( new NeuroOperation( false, 'NeuroSaveNow' ), NeuroSaveNow,
{

  run: function(db, model)
  {
    if ( db.cachePending && db.cache )
    {
      this.finish();
    }
    else
    {
      db.store.put( model.$key(), model.$local, this.success(), this.failure() );
    }
  }

});
function NeuroSaveRemote(model)
{
  this.reset( model );
}

extend( new NeuroOperation( false, 'NeuroSaveRemote' ), NeuroSaveRemote,
{

  run: function(db, model)
  {
    // If the model is deleted, return immediately!
    if ( model.$deleted )
    {
      Neuro.debug( Neuro.Debugs.SAVE_REMOTE_DELETED, model );

      return this.finish();
    }

    // Grab key & encode to JSON
    var key = this.key = model.$key();

    // The fields that have changed since last save
    var encoded = this.encoded = model.$toJSON( true );
    var changes = this.changes = model.$getChanges( encoded );
    var saving = this.saving = db.fullSave ? encoded : changes;
    var publishing = this.publishing = db.fullPublish ? encoded : changes;

    // If there's nothing to save, don't bother!
    if ( isEmpty( changes ) )
    {
      return this.finish();
    }

    // Make the REST call to save the model
    if ( model.$saved )
    {
      db.rest.update( model, saving, this.success(), this.failure() );
    }
    else
    {
      db.rest.create( model, saving, this.success(), this.failure() );
    }
  },

  onSuccess: function(data)
  {
    var model = this.model;

    Neuro.debug( Neuro.Debugs.SAVE_REMOTE, model );

    this.handleData( data );
  },

  onFailure: function(data, status)
  {
    var operation = this;
    var db = this.db;
    var model = this.model;

    // A non-zero status means a real problem occurred
    if ( status === 409 ) // 409 Conflict
    {
      Neuro.debug( Neuro.Debugs.SAVE_CONFLICT, model, data );

      // Update the model with the data saved and returned
      this.handleData( data, model, this.db );
    }
    else if ( status === 410 || status === 404 ) // 410 Gone, 404 Not Found
    {
      Neuro.debug( Neuro.Debugs.SAVE_UPDATE_FAIL, model );

      this.insertNext( NeuroRemoveNow );
    }
    else if ( status !== 0 ) 
    {          
      Neuro.debug( Neuro.Debugs.SAVE_ERROR, model, status );
    } 
    else 
    {
      // Check the network status right now
      Neuro.checkNetworkStatus();

      // If not online for sure, try saving once online again
      if (!Neuro.online) 
      {
        model.$pendingSave = true;

        Neuro.once( 'online', this.handleOnline, this );
      }

      Neuro.debug( Neuro.Debugs.SAVE_OFFLINE, model );
    }
  },

  handleData: function(data)
  {
    var db = this.db;
    var model = this.model;
    var saving = this.saving;
    var publishing = this.publishing;

    // Check deleted one more time before updating model.
    if ( model.$deleted )
    {
      Neuro.debug( Neuro.Debugs.SAVE_REMOTE_DELETED, model, data );

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

    Neuro.debug( Neuro.Debugs.SAVE_VALUES, model, saving );

    // If the model hasn't been saved before - create the record where the 
    // local and model point to the same object.
    if ( !model.$saved )
    {
      if ( !db.cache )
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
    Neuro.debug( Neuro.Debugs.SAVE_PUBLISH, model, publishing );

    db.live({
      op: NeuroDatabase.Live.Save,
      model: publishing,
      key: this.key
    });

    if ( db.cachePending && db.cache )
    {
      this.insertNext( NeuroRemoveCache );
    }
  },

  handleOnline: function()
  {
    var model = this.model;

    if ( model.$pendingSave )
    { 
      model.$pendingSave = false;
      model.$addOperation( NeuroSaveRemote );

      Neuro.debug( Neuro.Debugs.SAVE_RESUME, model );
    }
  }

});

function NeuroRelation()
{

}

Neuro.Relations = {};

Neuro.Store = {
  None: 0,
  Model: 1,
  Key: 2,
  Keys: 3
};

Neuro.Save = {
  None: 0,
  Model: 4
};

NeuroRelation.Defaults = 
{
  model:      undefined,
  store:      Neuro.Store.None,
  save:       Neuro.Save.None,
  auto:       true,
  property:   true
};

NeuroRelation.prototype =
{

  getDefaults: function(database, field, options)
  {
    return NeuroRelation.Defaults;
  },

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
    applyOptions( this, options, this.getDefaults( database, field, options ) );

    this.database = database;
    this.name = field;
    this.options = options;
    this.pendingLoads = [];
    this.initialized = false;

    this.discriminator = options.discriminator || 'discriminator';
    this.discriminators = options.discriminators || {};
    this.discriminated = !!options.discriminators;
    
    var setNeuro = this.setNeuro( database, field, options );

    if ( !isNeuro( options.model ) )
    {
      Neuro.get( options.model, setNeuro, this );
    }
    else
    {
      setNeuro.call( this, options.model );
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

      if ( this.discriminated )
      {
        this.loadDiscriminators();
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

  finishInitialization: function()
  {
    this.initialized = true;

    var pending = this.pendingLoads;

    for (var i = 0; i < pending.length; i++)
    {
      this.handleLoad( pending[ i ] );
    }

    pending.length = 0;
  },

  /**
   * Loads the model.$relation variable with what is necessary to get, set, 
   * relate, and unrelate models. If property is true, look at model[ name ]
   * to load models/keys. If it contains values that don't exist or aren't 
   * actually related
   * 
   * @param  {[type]} model [description]
   * @return {[type]}       [description]
   */
  load: function(model)
  {
    if ( !this.initialized )
    {
      this.pendingLoads.push( model );
    }
    else
    {
      this.handleLoad( model );
    }
  },

  handleLoad: function(model)
  {

  },

  relate: function(model, input)
  {

  },

  unrelate: function(model, input)
  {

  },

  isRelated: function(model, input)
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
      case Neuro.Save.Model:
        return related.$toJSON( true );

      case Neuro.Store.Model:
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

      case Neuro.Store.Key:
        return related.$key();

      case Neuro.Store.Keys:
        return related.$keys();

      }
    }

    return null;
  },

  /* Polymorphic Relationships */

  loadDiscriminators: function()
  {
    for (var discriminator in this.discriminators)
    {
      var name = this.discriminators[ discriminator ];

      Neuro.get( name, this.setDiscriminated, this );
    }
  },

  setDiscriminated: function(discriminator)
  {
    return function(neuro)
    {
      this.discriminators[ discriminator ] = neuro;
    };
  },

  getDiscriminator: function(model)
  {
    return model[ this.discriminator ];
  },

  getDiscriminatorDatabase: function(model)
  {
    var discriminator = this.getDiscriminator( model );

    if ( discriminator in this.discriminators )
    {
      var model = this.discriminators[ discriminator ];

      return model.Database;
    }

    return false;
  },

  parseDiscriminated: function(input)
  {
    if ( isObject( input ) )
    {
      var db = this.getDiscriminatorDatabase( input );

      return db.parseModel( input );
    }

    return false;
  },

  grabModel: function(isRelated, forModel, input, callback)
  {
    if ( this.discriminated )
    {
      if ( this.grabDiscriminated( input, callback ) )
      {
        return true;
      }
      else
      {
        var discriminator = this.getDiscriminatorByType( forModel );

        
      }
    }
  },

  grabDiscriminated: function(input, callback)
  {
    if ( isObject( input ) )
    {
      var db = this.getDiscriminatorDatabase( input );

      if ( db !== false )
      {
        db.grabModel( input, callack, this );

        return true;
      }
    }

    return true;
  },

  getDiscriminatorByType: function(model)
  {
    for (var discriminator in this.discriminators)
    {
      var type = this.discriminators[ discriminator ];

      if ( model instanceof type )
      {
        return discriminator;
      }
    }

    return false;
  },

  loadAllRelated: function(isRelated, callback)
  {
    if ( this.discriminated )
    {
      this.loadAllDiscriminated( isRelated, callback );
    }
    else
    {
      var relatedDatabase = this.model.Database;

      relatedDatabase.ready( this.loadAllReady( isRelated, callback ), this );
    }
  },

  loadAllReady: function(isRelated, callback)
  {
    return function(db)
    {
      var related = db.models.filter( isRelated );

      callback.call( this, related );
    };
  },

  loadAllDiscriminated: function(isRelated, callback)
  {
    var related = new NeuroMap();
    var callbackContext = this;
    var total = sizeof( this.discriminators );
    var current = 0;

    for (var discriminator in this.discriminators)
    {
      var type = this.discriminators[ discriminator ];
      var db = type.Database;

      db.ready(function(db)
      {
        db.models.filter( isRelated, related );

        if ( ++current === total )
        {
          callback.call( callbackContext, related );
        }
      });
    }
  }

};
function NeuroBelongsTo()
{
  this.type = 'belongsTo';
}

Neuro.Relations.belongsTo = NeuroBelongsTo;

NeuroBelongsTo.Defaults = 
{
  model:      undefined,
  store:      Neuro.Store.None,
  save:       Neuro.Save.None,
  auto:       true,
  property:   true,
  local:      null
};

extend( new NeuroRelation(), NeuroBelongsTo, 
{

  getDefaults: function(database, field, options)
  {
    return NeuroBelongsTo.Defaults;
  },

  onInitialized: function(database, field, options)
  {
    var relatedDatabase = this.model.Database;

    this.local = this.local || ( relatedDatabase.name + '_' + relatedDatabase.key );

    Neuro.debug( Neuro.Debugs.BELONGSTO_INIT, this );

    this.finishInitialization();
  },

  handleLoad: function(model)
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
        Neuro.debug( Neuro.Debugs.BELONGSTO_NINJA_REMOVE, that, model, relation );

        if ( this.cascade !== false )
        {
          model.$remove();
        }
      },
      onSaved: function() 
      {
        Neuro.debug( Neuro.Debugs.BELONGSTO_NINJA_SAVE, that, model, relation );

        if ( !this.hasForeignKey( model, relation.model ) && this.cascade !== false )
        {
          model.$remove();
        }
      }
    };

    if ( isEmpty( initial ) && relatedDatabase.hasFields( model, this.local, isValue ) )
    {
      initial = pull( model, this.local );

      Neuro.debug( Neuro.Debugs.BELONGSTO_INITIAL_PULLED, this, model, initial );
    }

    if ( !isEmpty( initial ) )
    {
      Neuro.debug( Neuro.Debugs.BELONGSTO_INITIAL, this, model, initial );

      relatedDatabase.grabModel( initial, this.handleModel( model, relation ), this );      
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
  isRelated: function(model, input)
  {
    var relatedDatabase = this.model.Database;
    var relation = model.$relations[ this.name ];
    var related = relatedDatabase.parseModel( input );

    return related === relation.model;
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
      Neuro.debug( Neuro.Debugs.BELONGSTO_POSTREMOVE, this, model, relation );

      this.clearModel( relation );
    }
  },

  clearModel: function(relation)
  {
    if ( relation.model )
    {
      Neuro.debug( Neuro.Debugs.BELONGSTO_CLEAR_MODEL, this, relation );

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

    Neuro.debug( Neuro.Debugs.BELONGSTO_SET_MODEL, this, relation );
  },

  // same as HasOne
  handleModel: function(model, relation)
  {
    return function(related) 
    {
      Neuro.debug( Neuro.Debugs.BELONGSTO_LOADED, this, model, relation, related );

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

    Neuro.debug( Neuro.Debugs.BELONGSTO_CLEAR_KEY, this, model, local );

    this.clearFields( model, local );
  },

  // same as HasOne
  updateForeignKey: function(model, related)
  {
    var relatedDatabase = this.model.Database;
    var local = this.local;
    var foreign = relatedDatabase.key;

    Neuro.debug( Neuro.Debugs.BELONGSTO_UPDATE_KEY, this, model, local, related, foreign );

    this.updateFields( model, local, related, foreign );
  },

  // same as HasOne
  setProperty: function(model, relation)
  {
    if ( this.property )
    {
      if ( model[ this.name ] !== relation.model )
      {
        model[ this.name ] = relation.model;
        
        model.$trigger( 'relation-update', [this, relation] );
      }
    }
  }

});
function NeuroHasMany()
{
  this.type = 'hasMany';
}

Neuro.Relations.hasMany = NeuroHasMany;

NeuroHasMany.Defaults = 
{
  model:                undefined,
  store:                Neuro.Store.None,
  save:                 Neuro.Save.None,
  auto:                 true,
  property:             true,
  foreign:              null,
  comparator:           null,
  comparatorNullsFirst: false,
  cascadeRemove:        true,
  cascadeSave:          true
};

extend( new NeuroRelation(), NeuroHasMany, 
{

  getDefaults: function(database, field, options)
  {
    return NeuroHasMany.Defaults;
  },

  onInitialized: function(database, field, options)
  {
    this.foreign = this.foreign || ( database.name + '_' + database.key );
    this.comparator = createComparator( this.comparator, this.comparatorNullsFirst );
    this.clearKey = this.ownsForeignKey();

    Neuro.debug( Neuro.Debugs.HASMANY_INIT, this );

    this.finishInitialization();
  },

  handleLoad: function(model)
  {
    var that = this;
    var relatedDatabase = this.model.Database;
    var isRelated = this.isRelatedFactory( model );
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
        Neuro.debug( Neuro.Debugs.HASMANY_NINJA_REMOVE, that, model, this, relation );

        that.removeModel( relation, this, true );
      },

      onSaved: function() // this = model saved
      {
        if ( relation.saving )
        {
          return;
        }

        Neuro.debug( Neuro.Debugs.HASMANY_NINJA_SAVE, that, model, this, relation );

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

    // Add convenience methods to the underlying array
    var related = relation.models.values;
    
    related.relate = function(input)
    {
      that.relate( model, input );
    };
    
    related.unrelate = function(input)
    {
      that.unrelate( model, input );
    };
    
    related.isRelated = function(input)
    {
      return that.isRelated( model, input );
    };
    
    // If the model's initial value is an array, populate the relation from it!
    if ( isArray( initial ) )
    {
      Neuro.debug( Neuro.Debugs.HASMANY_INITIAL, this, model, relation, initial );

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
      Neuro.debug( Neuro.Debugs.HASMANY_INITIAL_PULLED, this, model, relation );

      relatedDatabase.ready( this.handleLazyLoad( relation ), this );
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

  // TODO set

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

  isRelated: function(model, input)
  {
    var relatedDatabase = this.model.Database;
    var relation = model.$relations[ this.name ];
    var existing = relation.models;
    
    if ( this.isModelArray( input ) )
    {
      for (var i = 0; i < input.length; i++)
      {
        var related = relatedDatabase.parseModel( input[ i ] );

        if ( related && !existing.has( related.$key() ) )
        {
          return false;
        }
      }

      return input.length > 0;
    }
    else if ( isValue( input ) )
    {
      var related = relatedDatabase.parseModel( input );

      return related && existing.has( related.$key() );
    }

    return false;
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
      Neuro.debug( Neuro.Debugs.HASMANY_POSTSAVE, this, model, relation );

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
      Neuro.debug( Neuro.Debugs.HASMANY_PREREMOVE, this, model, relation );

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
      if ( this.store === Neuro.Store.Model || this.save === Neuro.Save.Model )
      {
        Neuro.debug( Neuro.Debugs.HASMANY_AUTO_SAVE, this, relation );

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
        Neuro.debug( Neuro.Debugs.HASMANY_NINJA_ADD, this, relation, related );

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
        Neuro.debug( Neuro.Debugs.HASMANY_INITIAL_GRABBED, this, relation, related );

        this.addModel( relation, related, true );

        delete pending[ key ];
      }
    };
  },

  handleLazyLoad: function(relation)
  {
    return function (relatedDatabase)
    {
      var related = relatedDatabase.models.filter( relation.isRelated );
      var models = related.values;

      Neuro.debug( Neuro.Debugs.HASMANY_LAZY_LOAD, this, relation, models );

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
      Neuro.debug( Neuro.Debugs.HASMANY_ADD, this, relation, related );

      target.put( key, related );

      related.$on( 'removed', relation.onRemoved );
      related.$on( 'saved remote-update', relation.onSaved );

      this.updateForeignKey( relation.parent, related );

      this.sort( relation );

      if ( !skipCheck )
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
      Neuro.debug( Neuro.Debugs.HASMANY_REMOVE, this, relation, related );

      target.remove( key );

      related.$off( 'removed', relation.onRemoved );
      related.$off( 'saved remote-update', relation.onSaved );

      if ( !alreadyRemoved && this.cascadeRemove )
      {
        related.$remove();
      }

      this.clearForeignKey( related );
      this.sort( relation );
      this.checkSave( relation );
    }

    delete pending[ key ];
  },

  ownsForeignKey: function()
  {
    var foreign = this.foreign;
    var relatedKey = this.model.Database.key;

    if ( isString( foreign ) )
    {
      if ( isArray( relatedKey ) )
      {
        return indexOf( relatedKey, foreign ) === false;
      }
      else        
      {
        return relatedKey !== foreign;
      }
    }
    else // if ( isArray( ))
    {
      if ( isArray( relatedKey ) )
      {
        for (var i = 0; i < foreign.length; i++)
        {
          if ( indexOf( relatedKey, foreign[ i ] ) !== false )
          {
            return false;
          }
        }
        return true;
      }
      else
      {
        return indexOf( foreign, relatedKey ) === false;
      }
    }

    return true;
  },

  updateForeignKey: function(model, related)
  {
    var foreign = this.foreign;
    var local = model.$db.key;

    this.updateFields( related, foreign, model, local );
  },

  clearForeignKey: function(related)
  {
    if ( this.clearKey )
    {
      var foreign = this.foreign;

      this.clearFields( related, foreign );
    }
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
        return true;
      }
    }

    return false;
  },

  isRelatedFactory: function(model)
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
    
    if ( !relation.delaySorting )
    {
      if ( !related.isSorted( this.comparator ) )
      {
        Neuro.debug( Neuro.Debugs.HASMANY_SORT, this, relation );

        related.sort( this.comparator );
      }

      relation.parent.$trigger( 'relation-update', [this, relation] );
    }
  }

});
function NeuroHasManyThrough()
{
  this.type = 'hasManyThrough';
}

Neuro.Relations.hasManyThrough = NeuroHasManyThrough;

NeuroHasManyThrough.Defaults = 
{
  model:                undefined,
  store:                Neuro.Store.None,
  save:                 Neuro.Save.None,
  auto:                 true,
  property:             true,
  through:              undefined,
  local:                null,
  foreign:              null,
  comparator:           null,
  comparatorNullsFirst: false,
  cascadeRemove:        true,
  cascadeSave:          false
};

extend( new NeuroRelation(), NeuroHasManyThrough, 
{

  getDefaults: function(database, field, options)
  {
    return NeuroHasManyThrough.Defaults;
  },

  onInitialized: function(database, field, options)
  {
    var relatedDatabase = this.model.Database;

    this.foreign = this.foreign || ( relatedDatabase.name + '_' + relatedDatabase.key );
    this.local = this.local || ( database.name + '_' + database.key );
    this.comparator = createComparator( this.comparator, this.comparatorNullsFirst );

    if ( !isNeuro( options.through ) )
    {
      Neuro.get( options.through, this.setThrough, this );
    }
    else
    {
      this.setThrough( options.through );
    }

    Neuro.debug( Neuro.Debugs.HASMANYTHRU_INIT, this );
  },

  setThrough: function(through)
  {
    this.through = through;

    this.finishInitialization();
  },

  handleLoad: function(model)
  {
    var that = this;
    var relatedDatabase = this.model.Database;
    var throughDatabase = this.through.Database;
    var isRelated = this.isRelatedFactory( model );
    var initial = model[ this.name ];
 
    var relation = model.$relations[ this.name ] =
    {
      parent: model,
      isRelated: isRelated,
      initial: initial,
      pending: {},
      models: new NeuroMap(),
      throughs: new NeuroMap(),
      saving: false,
      delaySorting: false,
      delaySaving: false,

      onRemoved: function() // this = model removed
      {
        Neuro.debug( Neuro.Debugs.HASMANYTHRU_NINJA_REMOVE, that, model, this, relation );

        that.removeModel( relation, this );
      },

      onSaved: function() // this = model saved
      {
        if ( relation.saving )
        {
          return;
        }

        Neuro.debug( Neuro.Debugs.HASMANYTHRU_NINJA_SAVE, that, model, this, relation );

        that.sort( relation );
        that.checkSave( relation );
      },

      onThroughRemoved: function() // this = through removed
      {
        Neuro.debug( Neuro.Debugs.HASMANYTHRU_NINJA_THRU_REMOVE, that, model, this, relation );

        that.removeModelFromThrough( relation, this );
      }

    };

    // Populate the model's key if it's missing
    model.$key();

    // When models are added to the related database, check if it's related to this model
    throughDatabase.on( 'model-added', this.handleModelAdded( relation ), this );

    // Add convenience methods to the underlying array
    var related = relation.models.values;
    
    related.relate = function(input)
    {
      that.relate( model, input );
    };
    
    related.unrelate = function(input)
    {
      that.unrelate( model, input );
    };
    
    related.isRelated = function(input)
    {
      return that.isRelated( model, input );
    };

    // If the model's initial value is an array, populate the relation from it!
    if ( isArray( initial ) )
    {
      Neuro.debug( Neuro.Debugs.HASMANYTHRU_INITIAL, this, model, relation, initial );

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
      Neuro.debug( Neuro.Debugs.HASMANYTHRU_INITIAL_PULLED, this, model, relation );

      throughDatabase.ready( this.handleLazyLoad( relation ), this );
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

  isRelated: function(model, input)
  {
    var relatedDatabase = this.model.Database;
    var relation = model.$relations[ this.name ];
    var existing = relation.models;
    
    if ( this.isModelArray( input ) )
    {
      for (var i = 0; i < input.length; i++)
      {
        var related = relatedDatabase.parseModel( input[ i ] );

        if ( related && !existing.has( related.$key() ) )
        {
          return false;
        }
      }

      return input.length > 0;
    }
    else if ( isValue( input ) )
    {
      var related = relatedDatabase.parseModel( input );

      return related && existing.has( related.$key() );
    }

    return false;
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
      Neuro.debug( Neuro.Debugs.HASMANYTHRU_PRESAVE, this, model, relation );

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
      Neuro.debug( Neuro.Debugs.HASMANYTHRU_PREREMOVE, this, model, relation );

      this.bulk( relation, function()
      {
        var models = relation.throughs.values;

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
      if ( this.store === Neuro.Store.Model || this.save === Neuro.Save.Model )
      {
        Neuro.debug( Neuro.Debugs.HASMANYTHRU_AUTO_SAVE, this, relation );

        relation.parent.$save();
      }
    }
  },

  handleModelAdded: function(relation)
  {
    return function (through)
    {
      if ( relation.isRelated( through ) )
      {
        Neuro.debug( Neuro.Debugs.HASMANYTHRU_NINJA_ADD, this, relation, through );

        this.addModelFromThrough( relation, through );
      }
    };
  },

  handleModel: function(relation)
  {
    return function (related)
    {
      var pending = relation.pending;
      var relatedKey = related.$key();

      if ( relatedKey in pending )
      {
        Neuro.debug( Neuro.Debugs.HASMANYTHRU_INITIAL_GRABBED, this, relation, related );

        this.addModel( relation, related, true );

        delete pending[ relatedKey ];
      }
    };
  },

  handleLazyLoad: function(relation)
  {
    return function (throughDatabase)
    {
      var throughsAll = throughDatabase.models;
      var throughsRelated = throughsAll.filter( relation.isRelated );
      var throughs = throughsRelated.values;

      if ( throughs.length === 0 )
      {
        return;
      }

      Neuro.debug( Neuro.Debugs.HASMANYTHRU_LAZY_LOAD, this, relation, throughs );

      this.bulk( relation, function()
      {
        for (var i = 0; i < throughs.length; i++)
        {
          this.addModelFromThrough( relation, throughs[ i ] );
        }
      });
    };
  },

  addModel: function(relation, related, skipCheck)
  {
    var adding = this.finishAddModel( relation, related, skipCheck );

    if ( adding )
    {
      this.addThrough( relation, related );
    }
    
    return adding;
  },

  addThrough: function(relation, related)
  {
    var throughDatabase = this.through.Database;
    var throughKey = this.createThroughKey( relation, related );

    throughDatabase.grabModel( throughKey, this.onAddThrough( relation ), this, false );
  },

  onAddThrough: function(relation)
  {
    var throughs = relation.throughs;

    return function(through)
    {
      this.finishAddThrough( relation, through, true );
    };
  },

  addModelFromThrough: function(relation, through)
  {
    var relatedDatabase = this.model.Database;
    var relatedKey = relatedDatabase.buildKey( through, this.foreign );

    relatedDatabase.grabModel( relatedKey, this.onAddModelFromThrough( relation, through ), this );
  },

  onAddModelFromThrough: function(relation, through)
  {
    return function(related)
    {
      this.finishAddThrough( relation, through );
      this.finishAddModel( relation, related );
    };
  },

  finishAddThrough: function(relation, through, callSave)
  {
    var throughs = relation.throughs;
    var throughKey = through.$key();

    if ( !throughs.has( throughKey ) )
    {
      Neuro.debug( Neuro.Debugs.HASMANYTHRU_THRU_ADD, this, relation, through );

      throughs.put( throughKey, through );

      through.$on( 'removed', relation.onThroughRemoved );

      if ( callSave )
      {
        through.$save();
      }
    }
  },

  finishAddModel: function(relation, related, skipCheck)
  {
    var relateds = relation.models;
    var relatedKey = related.$key();
    var adding = !relateds.has( relatedKey );

    if ( adding )
    {
      Neuro.debug( Neuro.Debugs.HASMANYTHRU_ADD, this, relation, related );

      relateds.put( relatedKey, related );

      related.$on( 'removed', relation.onRemoved );
      related.$on( 'saved remote-update', relation.onSaved );

      this.sort( relation );

      if ( !skipCheck )
      {
        this.checkSave( relation );
      }
    }

    return adding;
  },

  removeModel: function(relation, related, alreadyRemoved)
  {
    var relatedKey = related.$key();

    if ( this.finishRemoveRelated( relation, relatedKey ) )
    {
      this.removeThrough( relation, related, alreadyRemoved );
    }
  },

  removeThrough: function(relation, related, alreadyRemoved)
  {
    var throughDatabase = this.through.Database;
    var keyObject = this.createThroughKey( relation, related );
    var key = throughDatabase.getKey( keyObject );
    var throughs = relation.throughs;
    var through = throughs.get( key );

    this.finishRemoveThrough( relation, through, related, true );
  },

  removeModelFromThrough: function(relation, through)
  {
    var relatedDatabase = this.model.Database;
    var relatedKey = relatedDatabase.buildKey( through, this.foreign );
    
    if ( this.finishRemoveThrough( relation, through ) )
    {
      this.finishRemoveRelated( relation, relatedKey );
    }
  },

  finishRemoveThrough: function(relation, through, related, callRemove)
  {
    var removing = !!through;

    if ( removing )
    {
      Neuro.debug( Neuro.Debugs.HASMANYTHRU_THRU_REMOVE, this, relation, through, related );

      var throughs = relation.throughs;
      var throughKey = through.$key();

      through.$off( 'removed', relation.onThroughRemoved );

      if ( callRemove )
      {
        through.$remove();
      }

      throughs.remove( throughKey );
    }

    return removing;
  },

  finishRemoveRelated: function(relation, relatedKey)
  {
    var pending = relation.pending;
    var relateds = relation.models;
    var related = relateds.get( relatedKey );

    if ( related )
    {
      Neuro.debug( Neuro.Debugs.HASMANYTHRU_REMOVE, this, relation, related );

      relateds.remove( relatedKey );

      related.$off( 'removed', relation.onRemoved );
      related.$off( 'saved remote-update', relation.onSaved );

      this.sort( relation );
      this.checkSave( relation );
    }

    delete pending[ relatedKey ];

    return related;
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
        return true;
      }
    }

    return false;
  },

  isRelatedFactory: function(model)
  {
    var foreign = model.$db.key;
    var local = this.local;

    return function(through)
    {
      return propsMatch( through, local, model, foreign );
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
    
    if ( !relation.delaySorting )
    {
      if ( !related.isSorted( this.comparator ) )
      {
        Neuro.debug( Neuro.Debugs.HASMANYTHRU_SORT, this, relation );

        related.sort( this.comparator );
      }

      relation.parent.$trigger( 'relation-update', [this, relation] );
    }
  },

  createThroughKey: function(relation, related)
  {
    var model = relation.parent;
    var modelDatabase = model.$db;
    var relatedDatabase = this.model.Database;
    var throughDatabase = this.through.Database;
    var throughKey = throughDatabase.key;
    var key = {};

    for (var i = 0; i < throughKey.length; i++)
    {
      var prop = throughKey[ i ];

      if ( prop === this.foreign )
      {
        key[ prop ] = related.$key();
      }
      else if ( prop === this.local )
      {
        key[ prop ] = model.$key();
      }
      else if ( isArray( this.foreign ) )
      {
        var keyIndex = indexOf( this.foreign, prop );
        var keyProp = relatedDatabase.key[ keyIndex ];

        key[ prop ] = related[ keyProp ];
      }
      else if ( isArray( this.local ) )
      {
        var keyIndex = indexOf( this.local, prop );
        var keyProp = modelDatabase.key[ keyIndex ];

        key[ prop ] = model[ keyProp ];
      }
    }

    return key;
  }

});
function NeuroHasOne()
{
  this.type = 'hasOne';
}

Neuro.Relations.hasOne = NeuroHasOne;

NeuroHasOne.Defaults = 
{
  model:      undefined,
  store:      Neuro.Store.None,
  save:       Neuro.Save.None,
  auto:       true,
  property:   true,
  local:      null
}

extend( new NeuroRelation(), NeuroHasOne, 
{

  getDefaults: function(database, field, options)
  {
    return NeuroHasOne.Defaults;
  },

  onInitialized: function(database, field, options)
  {
    var relatedDatabase = this.model.Database;

    this.local = this.local || ( relatedDatabase.name + '_' + relatedDatabase.key );

    Neuro.debug( Neuro.Debugs.HASONE_INIT, this );
    
    this.finishInitialization();
  },

  handleLoad: function(model)
  {
    var that = this;
    var isRelated = this.isRelatedFactory( model );
    var relatedDatabase = this.model.Database;
    var initial = model[ this.name ];

    var relation = model.$relations[ this.name ] = 
    {
      initial: initial,
      isRelated: isRelated,
      model: null,
      loaded: false,
      dirty: false,
      saving: false,

      onRemoved: function() 
      {
        Neuro.debug( Neuro.Debugs.HASONE_NINJA_REMOVE, that, model, relation );

        this.clearModel( relation, true );
        this.clearForeignKey( model );
      },
      onSaved: function() 
      {
        if ( relation.saving )
        {
          return;
        }

        Neuro.debug( Neuro.Debugs.HASONE_NINJA_SAVE, that, model, relation );

        if ( !isRelated( relation.model ) )
        {
          this.clearModel( relation );
          this.clearForeignKey( model );
        }
      }
    };

    if ( isEmpty( initial ) && relatedDatabase.hasFields( model, this.local, isValue ) )
    {
      initial = pull( model, this.local );

      Neuro.debug( Neuro.Debugs.HASONE_INITIAL_PULLED, this, model, initial );
    }

    if ( !isEmpty( initial ) )
    {
      Neuro.debug( Neuro.Debugs.HASONE_INITIAL, this, model, initial );

      relatedDatabase.grabModel( initial, this.handleModel( model, relation ), this );      
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

      if ( related && !relation.isRelated( related ) )
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

  isRelated: function(model, input)
  {
    var relatedDatabase = this.model.Database;
    var relation = model.$relations[ this.name ];
    var related = relatedDatabase.parseModel( input );

    return related === relation.model;
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

      if ( !relation.isRelated( related ) )
      {
        // this.set( model, model[ this.local ] ) ?
      }

      if ( relation.dirty || related.$hasChanges() )
      {
        Neuro.debug( Neuro.Debugs.HASONE_PRESAVE, this, model, relation );

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
        Neuro.debug( Neuro.Debugs.HASONE_POSTREMOVE, this, model, relation );

        this.clearModel( relation );
      }
    }
  },

  clearModel: function(relation, dontRemove)
  {
    if ( relation.model )
    {
      Neuro.debug( Neuro.Debugs.HASONE_CLEAR_MODEL, this, relation );

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

    Neuro.debug( Neuro.Debugs.HASONE_SET_MODEL, this, relation );
  },

  handleModel: function(model, relation)
  {
    return function(related) 
    {
      Neuro.debug( Neuro.Debugs.HASONE_LOADED, this, model, relation, related );

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

  isRelatedFactory: function(model)
  {
    var relatedDatabase = this.model.Database;
    var local = this.local;
    var foreign = relatedDatabase.key;

    return function hasForeignKey(related)
    {
      return propsMatch( model, local, related, foreign );
    };
  },

  clearForeignKey: function(model)
  {
    var local = this.local;

    Neuro.debug( Neuro.Debugs.HASONE_CLEAR_KEY, this, model, local );

    this.clearFields( model, local );
  },

  updateForeignKey: function(model, related)
  {
    var relatedDatabase = this.model.Database;
    var local = this.local;
    var foreign = relatedDatabase.key;

    Neuro.debug( Neuro.Debugs.HASONE_UPDATE_KEY, this, model, local, related, foreign );

    this.updateFields( model, local, related, foreign );
  },

  setProperty: function(model, relation)
  {
    if ( this.property )
    {
      if ( model[ this.name ] !== relation.model )
      {
        model[ this.name ] = relation.model;
        
        model.$trigger( 'relation-update', [this, relation] );
      }
    }
  }

});

  /* Top-Level Function */
  global.Neuro = Neuro;

  /* Classes */
  global.Neuro.Model = NeuroModel;
  global.Neuro.Database = NeuroDatabase;
  global.Neuro.Relation = NeuroRelation;
  global.Neuro.Operation = NeuroOperation;
  global.Neuro.Map = NeuroMap;

  /* Utility Functions */
  global.Neuro.uuid = uuid;
  global.Neuro.indexOf = indexOf;
  global.Neuro.propsMatch = propsMatch;
  global.Neuro.extend = extend;
  global.Neuro.transfer = transfer;
  global.Neuro.swap = swap;
  global.Neuro.grab = grab;
  global.Neuro.pull = pull;
  global.Neuro.copy = copy;
  global.Neuro.diff = diff;
  global.Neuro.sizeof = sizeof;
  global.Neuro.isEmpty = isEmpty;
  global.Neuro.compare = compare;
  global.Neuro.equals = equals;
  global.Neuro.equalsStrict = equalsStrict;
  global.Neuro.createComparator = createComparator;

})(window);