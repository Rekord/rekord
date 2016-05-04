
/**
 * Creates a Rekord object given a set of options. A Rekord object is also the
 * constructor for creating instances of the Rekord object defined.
 *
 * @namespace
 * @param {Object} options
 *        The options of
 */
function Rekord(options)
{
  if ( options.name in Rekord.cache )
  {
    return Rekord.cache[ options.name ];
  }

  Rekord.trigger( Rekord.Events.Options, [options] );

  var database = new Database( options );

  var model = new Function('return function ' + database.className + '(props, remoteData) { this.$init( props, remoteData ) }')();
  model.prototype = new Model( database );

  database.Model = model;
  model.Database = database;

  Rekord.trigger( Rekord.Events.Plugins, [model, database, options] );

  Rekord.cache[ database.name ] = model;
  Rekord.cache[ database.className ] = model;

  if ( Rekord.autoload )
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
    Rekord.unloaded.push( database );
  }

  Rekord.trigger( Rekord.Events.Initialized, [model] );

  Rekord.debug( Rekord.Debugs.CREATION, database, options );

  return model;
}

Rekord.autoload = false;

Rekord.unloaded = [];

Rekord.load = function(callback, context)
{
  var callbackContext = context || this;
  var loading = Rekord.unloaded.slice();
  var loaded = [];
  var loadedSuccess = [];

  Rekord.unloaded.length = 0;

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

Rekord.cache = {};

Rekord.get = function(name, callback, context)
{
  var cached = Rekord.cache[ name ];
  var callbackContext = context || global;

  if ( isFunction( callback ) )
  {
    if ( cached )
    {
      callback.call( callbackContext, cached );
    }
    else
    {
      function checkRekord()
      {
        var cached = Rekord.cache[ name ];

        if ( cached )
        {
          callback.call( callbackContext, cached );
          off();
        }
      }

      var off = Rekord.on( Rekord.Events.Initialized, checkRekord );
    }
  }

  return cached;
};

/**
 * A value which identifies a model instance. This can be the key of the model,
 * an array of values (if the model has composite keys), an object which at
 * least contains fields which identify the model, an instance of a model, the
 * reference to a Rekord instance, or a function.
 *
 * If a plain object is given and it shares the same key as an existing model -
 * the other fields on the object will be applied to the existing instance. If
 * a plain object is given and it's key doesn't map to an existing model - a new
 * one is created.
 *
 * If a reference to a Rekord instance is given - a new model instance is created
 * with default values.
 *
 * If a function is given - it's invoked and the returning value is used as the
 * value to identify the model instance.
 *
 * @typedef {String|Number|String[]|Number[]|Object|Rekord|Rekord.Model|Function} modelInput
 */

 /**
  * A key to a model instance.
  *
  * @typedef {String|Number} modelKey
  */

addEventful( Rekord );

Rekord.Events =
{
  Initialized:  'initialized',
  Plugins:      'plugins',
  Options:      'options',
  Online:       'online',
  Offline:      'offline'
};

var Cascade =
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

function canCascade(cascade, type)
{
  return !isNumber( cascade ) || (cascade & type) === type;
};

var Cache =
{
  None:       'none',
  Pending:    'pending',
  All:        'all'
};

var Store =
{
  None:   0,
  Model:  1,
  Key:    2,
  Keys:   3
};

var Save =
{
  None:   0,
  Model:  4,
  Key:    5,
  Keys:   6
};
