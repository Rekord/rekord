
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

  database.init();

  Neuro.trigger( Neuro.Events.Initialized, [model] );

  Neuro.debug( Neuro.Debugs.CREATION, database, options );

  return model;
}

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

          Neuro.off( Neuro.Events.Initialized, checkNeuro );
        }
      }

      Neuro.on( Neuro.Events.Initialized, checkNeuro );
    }
  }

  return cached;
};

eventize( Neuro );
