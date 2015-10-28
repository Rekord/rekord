(function(global, undefined)
{



function isDefined(x)
{
  return typeof x !== 'undefined';
}

function isFunction(x)
{
  return !!(x && x.constructor && x.call && x.apply);
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

function S4() 
{
  return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
}

function uuid() 
{
    return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
}

function transfer(from, to)
{
  for (var prop in from)
  {
    to[ prop ] = from[ prop ];
  }

  return to;
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

    if (p in curr && p in old && !comparator( curr[ p ], old[ p ] ) )
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
  if (isArray(x)) 
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
 *     target.trigger( event, [argument] )
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
function eventize(target)
{
  /**
   * **See:** {{#crossLink "Core/eventize:method"}}{{/crossLink}}
   * 
   * @class eventize
   */

  // Adds a listener to $this
  var onListeners = function($this, property, events, callback, context)
  {
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
  target.on = function(events, callback, context)
  {
    onListeners( this, '$on', events, callback, context );

    return this;
  };
  
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
  target.once = function(events, callback, context)
  {
    onListeners( this, '$once', events, callback, context );

    return this;
  };
  
  // Removes a listener from an array of listeners.
  var offListeners = function(listeners, event, callback)
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
  };

  // Deletes a property from the given object if it exists
  var deleteProperty = function(obj, prop)
  {
    if ( obj && prop in obj )
    {
      delete obj[ prop ];
    }
  };
  
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
  target.off = function(events, callback)
  {
    // Remove ALL listeners
    if ( !isDefined( events ) )
    {
      deleteProperty( this, '$on' );
      deleteProperty( this, '$once' );
    }
    else
    {
      var events = toArray( events, ' ' );

      // Remove listeners for given events
      if ( !isFunction( callback ) )
      {
        for (var i = 0; i < events.length; i++)
        {
          deleteProperty( this.$on, events[i] );
          deleteProperty( this.$once, events[i] );
        }
      }
      // Remove specific listener
      else
      {
        for (var i = 0; i < events.length; i++)
        {
          offListeners( this.$on, events[i], callback );
          offListeners( this.$once, events[i], callback );
        }
      }
    }

    return this;
  };
  
  // Triggers listeneers for the given event
  var triggerListeners = function(listeners, event, argument, clear)
  {
    if (listeners && event in listeners)
    {
      var eventListeners = listeners[ event ];
      var max = eventListeners.length;
     
      for (var i = 0; i < max; i++)
      {
        var callback = eventListeners[ i ];
        
        callback[0].call( callback[1], argument );
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
  };
  
  /**
   * Triggers a single event optionally passing an argument to any listeners.
   * 
   * @method trigger
   * @for eventize
   * @param {String} event
   * @param {Any} argument
   * @chainable
   */
  target.trigger = function(events, argument)
  {
    var events = toArray( events, ' ' );

    for (var i = 0; i < events.length; i++)
    {
      var e = events[ i ];

      triggerListeners( this.$on, e, argument, false );
      triggerListeners( this.$once, e, argument, true );
    }

    return this;
  };
};

/*
new Neuro({
  name: 'name',
  rest: 'http://api/name',
  pubsub: 'http://url:port',
  channel: 'houseid',
  token: 'userid',
  timestamp: 'updated_at',              // server returns new updated_at & old, old is compared against current
  key: 'id',
  fields: ['id', 'name', 'updated_at'],
//  encode: function() {},
//  decode: function() {}
});
*/

function Neuro(options)
{
  var database = new NeuroDatabase( options );

  var model = new Function('return function ' + options.className + '(props) { this.$reset( props ) }')();
  model.prototype = new NeuroModel( database );
  model.db = database;

  database.model = model;
  database.init();

  Neuro.debug( Neuro.Events.CREATION, options, database );

  return {
    Database: database, 
    Model: model
  };
}

eventize( Neuro );


Neuro.debug = function(event, data)
{
  // up to the user
};

Neuro.Events = {

  CREATION: 0,                // options, NeuroDatabase

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

  REALTIME_SAVE: 13,          // encoded
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

  PUBSUB_CREATED: 37          // PubSub

};

// Neuro.rest = function(options, success(data), failure(data, status))

Neuro.rest = function(options, promise)
{
  // success ( data )
  // failure ( data, status )
  promise.$failure( [{}, 0] );
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

  this.stork = new Stork( options );
  this.models = new Stork.FastMap();

  this.live = Neuro.live( this, this.handlePublish( this ) );
}

NeuroDatabase.prototype =
{

  // Whether or not there's a load pending until we're online again
  $pendingLoad: false,

  // The method responsible for generating a key for the models in the database.
  generateKey: function()
  {
    return uuid();
  },

  // Sorts the models & notifies listeners that the database has been updated.
  updated: function()
  {
    var cmp = this.comparator;

    if ( isFunction( cmp ) )
    {
      this.models.sort( cmp );
    }
    else if ( isString( cmp ) )
    {
      var order = 1;

      if ( cmp.charAt(0) === '-' )
      {
        cmp = cmp.substring( 1 );
        order = -1;
      }

      this.models.sort(function(a, b)
      {
        return order * compare( a[ cmp ], b[ cmp ] );
      });
    }

    this.trigger( 'updated' );
  },

  // Handles when we receive data from the server - either from
  // a publish, refresh, or values being returned on a save.
  putRemoteData: function(encoded, key, model)
  {
    var db = this;
    var key = key || encoded[ db.key ];
    var model = model || db.models.get( key );
    var decoded = db.decode( copy( encoded ) );

    if ( model && model.$saved )
    {
      var current = model.$toJSON();

      for (var prop in encoded)
      {
        var currentValue = current[ prop ];
        var savedValue = model.$saved[ prop ];

        if ( equals( currentValue, savedValue ) )
        {
          model[ prop ] = decoded[ prop ];
          model.$local[ prop ] = encoded[ prop ];
        }

        model.$saved[ prop ] = copy( encoded[ prop ] );
      }

      model.$queue(function()
      {
        Neuro.debug( Neuro.Events.REMOTE_UPDATE, encoded, model );

        return db.stork.save( model.$local );
      });
    }
    else
    {
      model = db.instantiate( decoded );

      model.$local = encoded;
      model.$saved = model.$local.$saved = copy( encoded );

      model.$queue(function()
      {
        Neuro.debug( Neuro.Events.REMOTE_CREATE, encoded, model );

        return db.stork.save( model.$local );
      });

      db.models.put( key, model );
    }

    model.trigger('saved');

    return model;
  },

  // Destroys a model locally because it doesn't exist remotely
  destroyLocalModel: function(key)
  {
    var db = this;
    var model = db.models.get( key );

    if ( model )
    {
      if ( model.$hasChanges() )
      {
        // Removed saved history and the current ID
        delete model.$saved;
        delete model.$local.$saved;
        delete model[ db.key ];
        delete model.$local[ db.key ];

        model.$queue(function()
        {
          return db.stork.save( model.$local );
        });
     
        return false;
      }

      model.$queue(function()
      {
        return db.stork.remove( key );

      }, true );

      db.models.remove( key );

      model.trigger('removed');

      Neuro.debug( Neuro.Events.REMOTE_REMOVE, model );
    }
    else
    {
      db.stork.remove( key, function(removedValue)
      {
        if (removedValue) 
        {
          Neuro.debug( Neuro.Events.REMOTE_REMOVE, removedValue );
        }
      });

      // The model didn't exist
      return false;
    }

    return true;
  },

  // Initialize the database by loading local values and on success load
  // remove values.
  init: function()
  {
    var db = this;

    db.PROMISED = new Stork.Promise( db ).$success();

    db.stork.all(function(records, keys)
    {
      Neuro.debug( Neuro.Events.LOCAL_LOAD, records );

      db.models.reset();

      for (var i = 0; i < records.length; i++) 
      {
        var encoded = records[ i ];
        var key = keys[ i ];
        var decoded = db.decode( copy( encoded, true ) );
        var inst = db.instantiate( decoded );

        inst.$local = encoded;

        if ( encoded.$deleted )
        {
          Neuro.debug( Neuro.Events.LOCAL_RESUME_DELETE, inst );

          db.removeRemote( inst );
        }
        else
        {
          if ( !encoded.$saved )
          {
            Neuro.debug( Neuro.Events.LOCAL_RESUME_SAVE, inst );

            db.saveRemote( inst );
          }
          else
          {
            Neuro.debug( Neuro.Events.LOCAL_LOAD_SAVED, inst );
          }

          db.models.put( key, inst );
        }
      }

      db.updated();

      db.loadRemote();
    });    
  },

  // Loads all data remotely
  loadRemote: function()
  {
    var db = this;

    var loadPromise = new Stork.Promise( this );

    var options = {
      method: 'GET',
      url: this.rest
    };

    Neuro.rest( options, loadPromise );

    loadPromise.then(
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
              Neuro.debug( Neuro.Events.REMOTE_LOAD_REMOVE, k );

              db.destroyLocalModel( k );
            }
          }
        }

        db.updated();

        Neuro.debug( Neuro.Events.REMOTE_LOAD, models );
      },
      function onLoadError(models, status) 
      {
        if ( status === 0 )
        {
          Neuro.checkNetworkStatus();

          if ( !Neuro.online )
          {
            db.$pendingLoad = true;

            Neuro.once('online', function()
            {
              Neuro.debug( Neuro.Events.REMOTE_LOAD_RESUME );

              if ( db.$pendingLoad )
              {
                db.$pendingLoad = false;

                db.loadRemote(); 
              }
            })
          }

          Neuro.debug( Neuro.Events.REMOTE_LOAD_OFFLINE );
        }
        else
        {
          Neuro.debug( Neuro.Events.REMOTE_LOAD_ERROR, status );
        }
      }
    );
  },

  // The reference to all of the models in the database
  getModels: function()
  {
    return this.models.values;
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

        Neuro.debug( Neuro.Events.REALTIME_SAVE, message.model );
        break;

      case 'REMOVE':

        if ( db.destroyLocalModel( key ) )
        {
          db.updated(); 
        }

        Neuro.debug( Neuro.Events.REALTIME_REMOVE, key );
        break;
      }
    };
  },

  // Return an instance of the model with the data as initial values
  instantiate: function(data)
  {
    return new this.model( data );
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

  // Waits for the given promise to finish before proceeding with the method
  waitForPending: function(promise, method, args)
  {
    var db = this;

    if ( promise.$pending() )
    {
      promise.either(function()
      {
        method.apply( db, args );
      });

      return true;
    }
    else
    {
      promise.$reset();

      return false;
    }
  },

  // Interrupt a pending promise
  interruptPending: function(promise)
  {
    promise.$clear();
  },

  // Save a model remotely
  saveRemote: function(model)
  {
    var db = this;
    var promise = model.$promise;
    var promiseRest = new Stork.Promise( model );

    // If the model is deleted, return immediately!
    if ( model.$deleted )
    {
      Neuro.debug( Neuro.Events.SAVE_REMOTE_DELETED, model );

      return promise;
    }

    // Wait for other methods to finish executing
    if ( db.waitForPending( promise, this.saveRemote, arguments ) )
    {
      Neuro.debug( Neuro.Events.SAVE_REMOTE_BLOCKED, model );

      return promise;
    }

    var encoded = model.$toJSON();

    // The fields that have changed since last save
    var $saving = model.$saved ? 
      diff( encoded, model.$saved, db.fields, equals ) :
      encoded;

    // If there's nothing to save, don't bother!
    if ( isEmpty( $saving ) )
    {
      return promise.$success();
    }

    var key = model.$key();

    // Make the REST call to remove the mdoel
    var options = {
      method: model.$saved ? 'PUT' : 'POST',
      url:    model.$saved ? db.rest + key : db.rest,
      data:   $saving
    };
    Neuro.rest( options, promiseRest );

    // FInish saving the model
    var finishSave = function(data)
    {
      // Check deleted one more time before updating model.
      if ( model.$deleted )
      {
        Neuro.debug( Neuro.Events.SAVE_REMOTE_DELETED, model, data );

        return promise.$failure();
      }

      // If data was returned, place it in saving to update the model and publish
      for (var prop in data)
      {
        if ( !(prop in $saving ) )
        {
          $saving[ prop ] = data[ prop ];
        }
      }

      Neuro.debug( Neuro.Events.SAVE_VALUES, $saving, model );

      // If the model hasn't been saved before - create the record where the 
      // local and model point to the same object.
      if ( !model.$saved )
      {
        model.$saved = model.$local.$saved = {};
      }
       
      // Update the model with the return data
      db.putRemoteData( $saving, key, model );

      // Success!
      promise.$success();

      Neuro.debug( Neuro.Events.SAVE_PUBLISH, $saving, model );

      // Publish saved data to everyone else
      db.live({
        op: 'SAVE',
        model: $saving,
        key: key
      });
    };

    promiseRest.then(
      function onRemoteSave(data) 
      {
        Neuro.debug( Neuro.Events.SAVE_REMOTE, model );

        // Update the model with the data saved and returned
        finishSave( data );
      },
      function onRemoteFailure(data, status) 
      {
        // A non-zero status means a real problem occurred
        if ( status === 409 ) // 409 Conflict
        {
          Neuro.debug( Neuro.Events.SAVE_CONFLICT, data, model );

          // Update the model with the data saved and returned
          finishSave( data );
        }
        else if ( status === 410 || status === 404 ) // 410 Gone, 404 Not Found
        {
          Neuro.debug( Neuro.Events.SAVE_UPDATE_FAIL, model );

          promise.$failure();

          model.$queue(function()
          {
            db.models.remove( key );

            return db.stork.remove( key );
          });
        }
        else if ( status !== 0 ) 
        {          
          Neuro.debug( Neuro.Events.SAVE_ERROR, model, status );

          promise.$failure();
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

                Neuro.debug( Neuro.Events.SAVE_RESUME, model );

                db.saveRemote( model, true );
              }
            });

            promise.$success();
          } 
          else 
          {
            promise.$failure();
          }

          Neuro.debug( Neuro.Events.SAVE_OFFLINE, model );
        }
      }
    );

    return promise;
  },

  // Save the model locally then try remotely
  save: function(model)
  {
    var db = this;
    var promise = model.$promise;
    var key = model.$key();

    // If the model is deleted, return immediately!
    if ( model.$deleted )
    {
      Neuro.debug( Neuro.Events.SAVE_DELETED, model );

      return promise;
    }

    // Place the model and trigger a database update.
    if ( !db.models.has( key ) )
    {
      db.models.put( key, model );
      db.updated();
    }

    return db.saveLocal( model );
  },

  // Saves the model locally
  saveLocal: function(model)
  {
    var db = this;
    var promise = model.$promise;
    var encoded = model.$toJSON();

    // If the model is deleted, return immediately!
    if ( model.$deleted )
    {
      Neuro.debug( Neuro.Events.SAVE_LOCAL_DELETED, model );

      return promise;
    }

    // Wait for other methods to finish executing
    if ( db.waitForPending( promise, this.saveLocal, arguments ) )
    {
      Neuro.debug( Neuro.Events.SAVE_LOCAL_BLOCKED, mdoel );

      return promise;
    }

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

    // Save the local copy of the model.
    var localSave = db.stork.save( model.$local );

    // Finishes the local saving
    var finishSave = function()
    {
      promise.$success();

      db.saveRemote( model );
    };

    localSave.then(
      function onLocalSave(encoded) 
      {
        Neuro.debug( Neuro.Events.SAVE_LOCAL, model );

        finishSave();
      },
      function onLocalFailure(e) 
      {
        Neuro.debug( Neuro.Events.SAVE_LOCAL_ERROR, model, e );

        finishSave();
      }
    );

    return promise;
  },

  // Remove remotely
  removeRemote: function(model)
  {
    var db = this;
    var promise = model.$promise;
    var promiseRest = new Stork.Promise( model );
    var key = model.$key();
    
    // Cancel any pending saves
    model.$pendingSave = false;
    model.$deleted = true;

    // Removals cancel other operations
    db.interruptPending( promise );

    // Wait for an existing promise to finish
    if ( db.waitForPending( promise, this.removeRemote, arguments ) )
    {
      Neuro.debug( Neuro.Events.REMOVE_REMOTE_BLOCKED, model );

      return promise;
    }

    // Make the REST call to remove the model
    var options = {
      method: 'DELETE',
      url:    this.rest + key
    };
    Neuro.rest( options, promiseRest );

    // Finish removing the model
    var removeModel = function()
    {
      Neuro.debug( Neuro.Events.REMOVE_LOCAL, key, model ); 

      // We're done removing when it's removed locally.
      promise.$bindTo( db.stork.remove( key ) );

      // Notify the model that it's been removed
      model.trigger('removed');

      // Publish REMOVE
      Neuro.debug( Neuro.Events.REMOVE_PUBLISH, key, model );

      db.live({
        op: 'REMOVE',
        key: key
      });
    };

    promiseRest.then(
      function onRemoteRemove(data) 
      {
        Neuro.debug( Neuro.Events.REMOVE_REMOTE, model );

        removeModel();
      },
      function onRemoteFailure(data, status) 
      {
        if ( status === 404 || status === 410 )
        {
          Neuro.debug( Neuro.Events.REMOVE_MISSING, key, model );

          removeModel();
        }
        else if ( status !== 0 ) 
        {
          Neuro.debug( Neuro.Events.REMOVE_ERROR, status, key, model );

          promise.$failure();
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
              Neuro.debug( Neuro.Events.REMOVE_RESUME, model );
            });

            promise.$success();
          } 
          else
          {
            promise.$failure();
          }

          Neuro.debug( Neuro.Events.REMOVE_OFFLINE, model );
        }
      }
    );

    return promise;
  },

  removeLocal: function(model)
  {
    var db = this;
    var promise = model.$promise;
    var key = model.$key();

    // Removals cancel other operations
    db.interruptPending( promise );

    // Wait for an existing promise to finish
    if ( db.waitForPending( promise, this.removeLocal, arguments ) )
    {
      Neuro.debug( Neuro.Events.REMOVE_LOCAL_BLOCKED, model );

      return promise;
    }

    // If there is no local there's nothing to remove from anywhere!
    if ( !model.$local )
    {
      Neuro.debug( Neuro.Events.REMOVE_LOCAL_NONE, model );

      return promise.$success();
    }

    // If this model hasn't been saved we only need to remove it from local
    // storage.
    if ( !model.$saved )
    {
      Neuro.debug( Neuro.Events.REMOVE_LOCAL_UNSAVED, model );

      promise.$bindTo( db.stork.remove( key ) );
    }
    else
    {
      // Mark local copy as deleted in the event we're not online
      model.$local.$deleted = true;

      var localSave = db.stork.save( model.$local );

      var localRemove = function()
      {
        // If the model is saved, make sure we call removeRemote immediately.
        if ( model.$saved )
        {
          db.interruptPending( promise );

          promise.$success();

          db.removeRemote( model ); 
        }
        else
        {
          promise.$success();
        }
      };

      localSave.then(
        function onLocalRemove(encoded) 
        {
          Neuro.debug( Neuro.Events.REMOVE_LOCAL, model );

          localRemove();          
        },
        function onLocalFailure(e) 
        {
          Neuro.debug( Neuro.Events.REMOVE_LOCAL_ERROR, model, e );

          localRemove();
        }
      );
    }

    return promise;
  },

  remove: function(model)
  {
    var db = this;
    var key = model.$key();

    // If we have it in the models, remove it!
    if ( db.models.has( key ) )
    {
      db.models.remove( key );
      db.updated();
    }

    // Mark as deleted right away
    model.$deleted = true;

    // If we're offline and we have a pending save - cancel the pending save.
    // TODO Add Debug here?
    if ( model.$pendingSave )
    {
      Neuro.debug( Neuro.Events.REMOVE_CANCEL_SAVE, model );

      model.$pendingSave = false; 
    }

    // Remove it locally
    return db.removeLocal( model );
  }

};

eventize( NeuroDatabase.prototype );

function NeuroModel(db)
{
  this.$db = db;
  this.$promise = Stork.Promise.Done( this );
  this.$pendingSave = false;
  this.$pendingRemove = false;

  /**
   * @property {NeuroDatabase} $db
   *           The reference to the database this model is stored in.
   */

  /**
   * @property {Stork.Promise} $promise
   *           The last promise on the model. When this promise completes 
   *           another action can be performed on the model.
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

  $set: function(props, value)
  {
    if ( isObject( props ) )
    {
      transfer( props, this );
    }
    else if ( isString( props ) && value !== void 0 )
    {
      this[ props ] = value;
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
      return copyValues ? copy( this[ props ] ) : this[ props ];
    }
  },

  $save: function(setProperties, setValue)
  {
    this.$set( setProperties, setValue );

    return this.$db.save( this );
  },

  $remove: function()
  {
    return this.$db.remove( this );
  },

  $queue: function(callback, interrupt)
  {
    var p = this.$promise;

    if (interrupt)
    {
      p.$clear();
    }

    p.either(function()
    {
      p.$reset();
      p.$bindTo( callback() );
    });

    return p;
  },

  $reset: function(props)
  {
    var def = this.$db.defaults;
    var fields = this.$db.fields;

    if ( isObject( def ) )
    {
      for (var i = 0; i < fields.length; i++)
      {
        var prop = fields[ i ];

        if ( prop in def )
        {
          var defaultValue = def[ prop ];

          if ( isFunction( defaultValue ) )
          {
            this[ prop ] = defaultValue();
          }
          else
          {
            this[ prop ] = copy( defaultValue );
          }
        }
        else
        {
          this[ prop ] = undefined;
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

  $toJSON: function()
  {
    return this.$db.encode( grab( this, this.$db.fields, true ) );
  },

  $key: function()
  {
    var k = this.$db.key;

    return k in this ? this[ k ] : (this[ k ] = this.$db.generateKey());
  },

  $isSaved: function()
  {
    return !!this.$saved;
  },

  $isSavedLocally: function()
  {
    return !!this.$local;
  },

  $hasChanges: function()
  {
    if (!this.$saved) 
    {
      return true;
    }

    var encoded = this.$toJSON();
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

eventize( NeuroModel.prototype );

  global.Neuro = Neuro;

})(window);