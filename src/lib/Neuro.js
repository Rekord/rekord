
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
