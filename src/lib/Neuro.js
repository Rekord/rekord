
function Neuro(options)
{
  if ( options.name in Neuro.cache )
  {
    return Neuro.cache[ options.name ];
  }

  var database = new NeuroDatabase( options );

  var model = new Function('return function ' + database.className + '(props, exists) { this.$init( props, exists ) }')();

  model.prototype = new NeuroModel( database );

  if ( isObject( options.methods ) )
  {
    transfer( options.methods, model.prototype );
  }

  if ( isObject( options.dynamic ) )
  {
    for ( var property in options.dynamic )
    {
      var definition = options.dynamic[ property ];

      addDynamicProperty( model.prototype, property, definition );
    }
  }

  database.model = model;
  database.init();

  Neuro.debug( Neuro.Debugs.CREATION, database, options );

  model.Database = database;
  model.Model = model;

  model.all = function()
  {
    return database.getModels();
  };

  model.create = function( props )
  {
    return database.create( props );
  };

  model.fetch = function( input )
  {
    var key = database.buildKeyFromInput( input );
    var instance = database.getModel( key );

    if ( !instance )
    {
      instance = database.buildObjectFromKey( key );

      if ( isObject( input ) )
      {
        instance.$set( input );
      }
    }

    instance.$refresh();

    return instance;
  };

  model.boot = function( input )
  {
    var instance = new model( input );

    instance.$local = instance.$toJSON( false );
    instance.$local.$saved = instance.$saved = instance.$toJSON( true );
    instance.$addOperation( NeuroSaveNow );

    return instance;
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
