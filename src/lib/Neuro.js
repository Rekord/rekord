
/**
 * Creates a Neuro object given a set of options. A Neuro object is also the 
 * constructor for creating instances of the Neuro object defined.
 * 
 * @namespace 
 * @param {Object} options
 *        The options of 
 */
function Neuro(options)
{
  if ( options.name in Neuro.cache )
  {
    return Neuro.cache[ options.name ];
  }

  var database = new NeuroDatabase( options );

  var model = new Function('return function ' + database.className + '(props, remoteData) { this.$init( props, remoteData ) }')();
  model.prototype = new NeuroModel( database );

  database.Model = model;
  model.Database = database;

  Neuro.trigger( Neuro.Events.Plugins, [model, database, options] );

  Neuro.cache[ database.name ] = model;
  Neuro.cache[ database.className ] = model;

  if ( Neuro.autoload )
  {
    database.loadBegin(function onLoadFinish(success)
    {
      if ( success )
      {
        database.loadFinish();
      }
    });  
  }
  else
  {
    Neuro.unloaded.push( database );    
  }

  Neuro.trigger( Neuro.Events.Initialized, [model] );

  Neuro.debug( Neuro.Debugs.CREATION, database, options );

  return model;
}

Neuro.autoload = false;

Neuro.unloaded = [];

Neuro.load = function(callback, context)
{
  var callbackContext = context || this;
  var loading = Neuro.unloaded.slice();
  var loaded = [];
  var loadedSuccess = [];

  Neuro.unloaded.length = 0;

  function onLoadFinish(success, db)
  {
    loadedSuccess.push( success );
    loaded.push( db );

    if ( loaded.length === loading.length )
    {
      for (var k = 0; k < loaded.length; k++)
      {
        var db = loaded[ k ];
        var success = loadedSuccess[ k ];

        if ( success )
        {
          db.loadFinish();
        }
      }

      if ( callback )
      {
        callback.call( callbackContext );
      }
    }
  }

  for (var i = 0; i < loading.length; i++)
  {
    loading[ i ].loadBegin( onLoadFinish );
  }
};

Neuro.Events = 
{
  Initialized:  'initialized',
  Plugins:      'plugins',
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
          off();
        }
      }

      var off = Neuro.on( Neuro.Events.Initialized, checkNeuro );
    }
  }

  return cached;
};

eventize( Neuro );
