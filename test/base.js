
// Configuration

Rekord.autoload = true;
Rekord.Database.Defaults.load = Rekord.Load.All;

QUnit.config.reorder = false;

// Extra Assertions

function isInstance(model, Class, message)
{
  ok( model instanceof Class, message );
}

function isType(value, type, message)
{
  strictEqual( typeof value, type, message );
}

function hasModel(rekord, key, model, message)
{
  strictEqual( rekord.get( key ), model, message );
}

function pushChanges(target, changes)
{
  var previous = {};

  for (var prop in changes)
  {
    previous[ prop ] = target[ prop ];
    target[ prop ] = changes[ prop ];
  }

  return function()
  {
    Rekord.transfer( previous, target );
  };
};

function currentTime()
{
  var counter = 1;

  return function newDefaultTime()
  {
    return counter++;
  };
}

function currentDate()
{
  var start = new Date();

  return function newDefaultDate()
  {
    start.setDate( start.getDate() + 1 );

    return new Date( start.getTime() );
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

// Mock File

function TestFile(name, size, type, contents)
{
  this.name = name;
  this.size = size;
  this.type = type;
  this.contents = contents;
}

function TestFileReader()
{
  this.onload = Rekord.noop;
}

TestFileReader.prototype =
{
  readAsText: function(file)
  {
    if ( TestFileReader.IMMEDIATE )
    {
      this.readAsTextNow( file );
    }
    else
    {
      TestFileReader.pending.push( [this, 'readAsTextNow', file] );
    }
  },
  readAsTextNow: function(file)
  {
    this.onload( {target:{result: file.contents}} );
  },
  readAsDataURL: function(file)
  {
    if ( TestFileReader.IMMEDIATE )
    {
      this.readAsDataURLNow( file );
    }
    else
    {
      TestFileReader.pending.push( [this, 'readAsDataURLNow', file] );
    }
  },
  readAsDataURLNow: function(file)
  {
    this.onload( {target:{result: 'data:text/plain;base64,' + btoa(file.contents)}} );
  }
};

TestFileReader.IMMEDIATE = true;
TestFileReader.pending = [];

TestFileReader.executePending = function()
{
  for (var i = 0; i < TestFileReader.pending.length; i++)
  {
    var pair = TestFileReader.pending[ i ];

    pair[ 0 ][ pair[ 1 ] ]( pair[ 2 ] );
  }

  TestFileReader.pending.length = 0;
};

window.File = TestFile;
window.FileList = Array;
window.FileReader = TestFileReader;

// Utility Methods

function offline()
{
  Rekord.setOffline();
  Rekord.forceOffline = true;
}

function online()
{
  Rekord.forceOffline = false;
  Rekord.setOnline();
}

function noline()
{
  Rekord.off( 'online offline' );
  online();
}

function restart()
{
  Rekord.promises = {};
  noline();
  online();
}

// Rekord.store."database name".(put|remove|all)

Rekord.store = function(database)
{
  var store = Rekord.store[ database.name ];

  if ( !store )
  {
    store = Rekord.store[ database.name ] = new TestStore();
  }

  return store;
};

function TestStore()
{
  this.map = new Rekord.Map();
  this.valid = true;
  this.delay = 0;
  this.lastKey = this.lastRecord = this.lastOperation = null;
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
    this.lastOperation = 'get';

    var map = this.map;
    function onGet()
    {
      var model = map.get( key );
      if ( model ) {
        success.call( this, key, model );
      } else {
        failure.apply( this, 404 );
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
    this.lastOperation = 'put';

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
    this.lastOperation = 'remove';

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
    this.lastOperation = 'all';
    this.finishDelayed( success, failure, this.map.values, this.map.keys );
  }
};


// Rekord.live."database name".(save|remove)

Rekord.live = function(database)
{
  var live = Rekord.live[ database.name ];

  if ( !live )
  {
    live = Rekord.live[ database.name ] = new TestLive( database );
  }

  return live;
};

function TestLive(database)
{
  this.database = database;
  this.onHandleMessage = null;
  this.lastMessage = null;
}

TestLive.prototype =
{
  save: function(model, data)
  {
    this.lastMessage = {
      op: 'SAVE',
      key: model.$key(),
      model: data
    };

    if ( this.onHandleMessage )
    {
      this.onHandleMessage( this.lastMessage );
    }
  },
  remove: function(model)
  {
    this.lastMessage = {
      op: 'REMOVE',
      key: model.$key()
    };

    if ( this.onHandleMessage )
    {
      this.onHandleMessage( this.lastMessage );
    }
  },
  liveSave: function(data)
  {
    var key = this.database.buildKeyFromInput( data );

    this.database.liveSave( key, data );
  },
  liveRemove: function(input)
  {
    var key = this.database.buildKeyFromInput( input );

    this.database.liveRemove( key );
  }
};

// Rekord.rest."database name".(all|create|update|remove)

Rekord.rest = function(database)
{
  var rest = Rekord.rest[ database.name ];

  if ( !rest )
  {
    rest = Rekord.rest[ database.name ] = new TestRest();
  }

  return rest;
};

function TestRest()
{
  this.map = new Rekord.Map();
  this.queries = new Rekord.Map();
  this.status = 200;
  this.returnValue = false;
  this.delay = 0;
  this.lastModel = this.lastRecord = this.lastOperation = null;
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
    var offline = !Rekord.online || Rekord.forceOffline;
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
    this.lastOperation = 'get';
    this.lastModel = model;

    var map = this.map;
    function onGet()
    {
      var cached = map.get( model.$key() );
      if ( cached ) {
        success.call( this, cached );
      } else {
        failure.call( this, null, 404 );
      }
    }

    this.finishDelayed( onGet, failure, null );
  },
  create: function(model, encoded, success, failure)
  {
    this.lastOperation = 'create';
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
    this.lastOperation = 'update';
    this.lastModel = model;
    this.lastRecord = encoded;

    var map = this.map;
    function onUpdate()
    {
      var existing = map.get( model.$key() );
      Rekord.transfer( encoded, existing );
      success.apply( this, arguments );
    }

    this.finishDelayed( onUpdate, failure, {} );
  },
  remove: function(model, success, failure)
  {
    this.lastOperation = 'remove';
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
    this.lastOperation = 'all';
    this.finishDelayed( success, failure, this.map.values );
  },
  query: function(url, data, success, failure)
  {
    this.lastOperation = 'query';
    this.lastRecord = data;
    this.finishDelayed( success, failure, this.queries.get( url ) );
  }
};
