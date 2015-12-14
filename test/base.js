
// Configuration

Neuro.autoload = true;

// Extra Assertions

function isInstance(model, Class, message)
{
  ok( model instanceof Class, message );
}

function isType(value, type, message)
{
  strictEqual( typeof value, type, message );
}

function hasModel(neuro, key, model, message)
{
  strictEqual( neuro.get( key ), model, message );
}

function currentTime()
{
  var counter = 0;

  return function()
  {
    return counter++;
  };
}

// Extending Assert

QUnit.assert.timer = function()
{
  return QUnit.assert.currentTimer = new TestTimer();
};

function TestTimer()
{
  this.callbacks = [];
  this.time = 0;
}

TestTimer.prototype = 
{
  wait: function(millis, func)
  {
    var callbacks = this.callbacks;
    var at = millis + this.time;

    if ( callbacks[ at ] )
    {
      callbacks[ at ].push( func );
    }
    else
    {
      callbacks[ at ] = [ func ];
    }
  },
  run: function()
  {
    var callbacks = this.callbacks;

    for (var i = 0; i < callbacks.length; i++)
    {
      var calls = callbacks[ i ];

      this.time = i;

      if ( calls )
      {
        for (var k = 0; k < calls.length; k++)
        {
          calls[ k ]();
        }
      }
    }
  }
};

function wait(millis, func)
{
  QUnit.assert.currentTimer.wait( millis, func );
}

// Utility Methods

function offline()
{
  Neuro.setOffline();
  Neuro.forceOffline = true;
}

function online()
{
  Neuro.forceOffline = false;
  Neuro.setOnline();
}

function noline()
{
  Neuro.off( 'online offline' );
  online();
}

function restart()
{
  Neuro.cache = {};
  noline();
  online();
}

// Neuro.store."database name".(put|remove|all)

Neuro.store = function(database)
{
  var store = Neuro.store[ database.name ];

  if ( !store )
  {
    store = Neuro.store[ database.name ] = new TestStore();
  }

  return store;
};

function TestStore()
{
  this.map = new Neuro.Map();
  this.valid = true;
  this.delay = 0;
  this.lastKey = this.lastRecord = null;
}

TestStore.prototype = 
{
  finishDelayed: function(success, failure, arg0, arg1)
  {
    var store = this;

    if ( store.delay > 0 )
    {
      wait( store.delay, function()
      {
        store.finish( success, failure, arg0, arg1 );

      });
    }
    else
    {
      store.finish( success, failure, arg0, arg1 );
    }
  },
  finish: function(success, failure, arg0, arg1)
  {
    if ( this.valid )
    {
      if ( success ) success( arg0, arg1 );
    }
    else
    {
      if ( failure ) failure( arg0, arg1 );
    }
  },
  get: function(key, success, failure)
  {
    this.lastKey = key;

    var map = this.map;
    function onGet()
    {
      var model = map.get( key );
      if ( model ) {
        success.call( this, key, model );
      } else {
        failure.apply( this );
      }
    }

    this.finishDelayed( onGet, failure );
  },
  save: function(model, success, failure)
  {
    this.put( model.$key(), model, success, failure );
  },
  put: function(key, record, success, failure)
  {
    this.lastKey = key;
    this.lastRecord = record;

    var map = this.map;
    function onPut()
    {
      map.put( key, record );
      success.apply( this, arguments );
    }

    this.finishDelayed( onPut, failure, key, record );
  },
  remove: function(key, success, failure)
  {
    this.lastKey = key;

    var map = this.map;
    var removed = map.get( key );
    function onRemove()
    {
      map.remove( key );
      success.apply( this, arguments );
    }

    this.finishDelayed( onRemove, failure, key, removed );
  },
  all: function(success, failure)
  {
    this.finishDelayed( success, failure, this.map.values, this.map.keys );
  }
};


// Neuro.live."database name".(save|remove)

Neuro.live = function(database, onPublish)
{
  var live = Neuro.live[ database.name ];

  if ( !live )
  {
    live = Neuro.live[ database.name ] = new TestLive( database, onPublish );
  }

  live.onPublish = onPublish;

  return live.handleMessage();
};

function TestLive(database, onPublish)
{
  this.database = database;
  this.onPublish = onPublish;
  this.onHandleMessage = null;
  this.lastMessage = null;
}

TestLive.prototype = 
{
  save: function(data)
  {
    var key = this.database.buildKeyFromInput( data );

    this.onPublish({
      op: Neuro.Database.Live.Save,
      model: data,
      key: key
    });
  },
  remove: function(input)
  {
    var key = this.database.buildKeyFromInput( input );

    this.onPublish({
      op: Neuro.Database.Live.Remove,
      key: key
    });
  },
  handleMessage: function()
  {
    var live = this;

    var onMessage = function(message)
    {
      live.lastMessage = message;
      
      if ( live.onHandleMessage )
      {
        live.onHandleMessage( message );
      }
    };

    onMessage.live = live;

    return onMessage;
  }
};

// Neuro.rest."database name".(all|create|update|remove)
 
Neuro.rest = function(database)
{
  var rest = Neuro.rest[ database.name ];

  if ( !rest )
  {
    rest = Neuro.rest[ database.name ] = new TestRest();
  }

  return rest;
};

function TestRest()
{
  this.map = new Neuro.Map();
  this.queries = new Neuro.Map();
  this.status = 200;
  this.returnValue = false;
  this.delay = 0;
  this.lastModel = this.lastRecord = null;
}

TestRest.prototype =
{
  finishDelayed: function(success, failure, returnValue)
  {
    var rest = this;

    if ( rest.delay > 0 )
    {
      wait( rest.delay, function()
      {
        rest.finish( success, failure, returnValue );

      });
    }
    else
    {
      rest.finish( success, failure, returnValue );
    }
  },
  finish: function(success, failure, returnValue)
  {
    var offline = !Neuro.online || Neuro.forceOffline;
    var status = offline ? 0 : this.status;
    var successful = status >= 200 && status < 300;
    var returnedValue = this.returnValue || returnValue;

    if ( successful )
    {
      if ( success ) success( returnedValue, status );        
    }
    else
    {
      if ( failure ) failure( returnedValue, status );
    }
  },
  get: function(model, success, failure)
  {
    this.lastModel = model;

    var map = this.map;
    function onGet()
    {
      var cached = map.get( model.$key() );
      if ( cached ) {
        success.call( this, cached );
      } else {
        failure.call( this, null, -1 );
      }
    }

    this.finishDelayed( onGet, failure, null );
  },
  create: function(model, encoded, success, failure)
  {
    this.lastModel = model;
    this.lastRecord = encoded;

    var map = this.map;
    function onCreate() 
    {
      map.put( model.$key(), encoded );
      success.apply( this, arguments );
    }

    this.finishDelayed( onCreate, failure, {} );
  },
  update: function(model, encoded, success, failure)
  {
    this.lastModel = model;
    this.lastRecord = encoded;

    var map = this.map;
    function onUpdate()
    {
      var existing = map.get( model.$key() );
      Neuro.transfer( encoded, existing );
      success.apply( this, arguments );
    }

    this.finishDelayed( onUpdate, failure, {} );
  },
  remove: function(model, success, failure)
  {
    this.lastModel = model;

    var map = this.map;
    function onRemove()
    {
      map.remove( model.$key() );
      success.apply( this, arguments );
    }

    this.finishDelayed( onRemove, failure, {} );
  },
  all: function(success, failure)
  {
    this.finishDelayed( success, failure, this.map.values );
  },
  query: function(query, success, failure)
  {
    this.finishDelayed( success, failure, this.queries.get( query ) );
  }
};
