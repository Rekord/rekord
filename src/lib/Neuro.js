
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

  Neuro.debug( Neuro.Events.CREATION, database, options );

  model.Database = database;
  model.Model = model;

  Neuro.cache[ options.name ] = model;
  Neuro.cache[ options.className ] = model;

  Neuro.trigger( 'initialized', [model] );

  return model;
}

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
      function checkNeuro(neuro)
      {
        if ( neuro.name === name || neuro.className === name )
        {
          callback.call( callbackContext, neuro );

          Neuro.off( 'initialized', checkNeuro );
        }
      }

      Neuro.on( 'initialized', checkNeuro );
    }
  }

  return cached;
};

Neuro.RELATIONS = {};

eventize( Neuro );
