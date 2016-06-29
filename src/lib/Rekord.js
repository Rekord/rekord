
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
  var promise = Rekord.get( options.name );

  if ( promise.isComplete() )
  {
    return promise.results[0];
  }

  Rekord.trigger( Rekord.Events.Options, [options] );

  var database = new Database( options );

  var model = new Function('return function ' + database.className + '(props, remoteData) { this.$init( props, remoteData ) }')(); // jshint ignore:line
  model.prototype = new Model( database );

  database.Model = model;
  model.Database = database;

  Rekord.classes[ database.name ] = model;

  Rekord.trigger( Rekord.Events.Plugins, [model, database, options] );

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

  Rekord.get( database.name ).resolve( model );
  Rekord.get( database.className ).resolve( model );

  Rekord.debug( Rekord.Debugs.CREATION, database, options );

  return model;
}

Rekord.classes = {};

Rekord.autoload = false;

Rekord.unloaded = [];

Rekord.loadPromise = null;

Rekord.load = function(callback, context)
{
  var promise = Rekord.loadPromise = Rekord.loadPromise || new Promise( null, false );
  var loading = Rekord.unloaded.slice();
  var loaded = [];
  var loadedSuccess = [];

  promise.success( callback, context || this );

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

      promise.reset().resolve();
    }
  }

  for (var i = 0; i < loading.length; i++)
  {
    loading[ i ].loadBegin( onLoadFinish );
  }

  return promise;
};

Rekord.promises = {};

Rekord.get = function(name)
{
  var existing = Rekord.promises[ name ];

  if ( !existing )
  {
    existing = Rekord.promises[ name ] = new Promise( null, false );
  }

  return existing;
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
  Offline:      'offline',
  Error:        'error'
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
}

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

var Load =
{
  None:   0,
  All:    1,
  Lazy:   2,
  Both:   3
};

var RestStatus =
{
  Conflict:   {409: true},
  NotFound:   {404: true, 410: true},
  Offline:    {0: true}
};
