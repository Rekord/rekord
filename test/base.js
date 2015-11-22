
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
  strictEqual( neuro.Database.getModel( key ), model, message );
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
}

TestStore.prototype = 
{
  finishDelayed: function(success, failure, arg0, arg1)
  {
    var store = this;

    if ( store.delay > 0 )
    {
      setTimeout(function()
      {
        store.finish( success, failure, arg0, arg1 );

      }, store.delay );
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
  save: function(model, success, failure)
  {
    this.map.put( model.$key(), model );
    this.finishDelayed( success, failure, model.$key(), model );
  },
  put: function(key, record, success, failure)
  {
    this.map.put( key, record );
    this.finishDelayed( success, failure, key, record );
  },
  remove: function(key, success, failure)
  {
    var removed = this.map.get( key );
    this.map.remove( key );
    this.finishDelayed( success, failure, key, removed );
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
  this.onHandleMessage
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

    return function (message)
    {
      if ( live.onHandleMessage )
      {
        live.onHandleMessage( message );
      }
    };
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
  this.status = 200;
  this.returnValue = false;
  this.delay = 0;
  this.lastArguments = [];
}

TestRest.prototype =
{
  finishDelayed: function(success, failure, returnValue)
  {
    var rest = this;

    if ( rest.delay > 0 )
    {
      setTimeout(function()
      {
        rest.finish( success, failure, returnValue );

      }, rest.delay );
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
  create: function(model, encoded, success, failure)
  {
    this.lastArguments = Array.prototype.slice.call( arguments );

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
    this.lastArguments = Array.prototype.slice.call( arguments );

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
    this.lastArguments = Array.prototype.slice.call( arguments );

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
    this.lastArguments = Array.prototype.slice.call( arguments );
    this.finishDelayed( success, failure, this.map.values );
  }
};
