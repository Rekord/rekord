
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

  Neuro.trigger( Neuro.Events.Options, [options] );

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

Neuro.Events =
{
  Initialized:  'initialized',
  Plugins:      'plugins',
  Options:      'options',
  Online:       'online',
  Offline:      'offline'
};

Neuro.Cascade =
{
  None:       0,
  Local:      1,
  Rest:       2,
  NoLive:     3,
  Live:       4,
  NoRest:     5,
  Remote:     6,
  All:        7
};

Neuro.Cache =
{
  None:       'none',
  Pending:    'pending',
  All:        'all'
};

Neuro.Store =
{
  None:   0,
  Model:  1,
  Key:    2,
  Keys:   3
};

Neuro.Save =
{
  None:   0,
  Model:  4,
  Key:    5,
  Keys:   6
};
