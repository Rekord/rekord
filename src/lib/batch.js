
var batchDepth = 0;
var batches = [];
var batchHandlers = [];
var batchOverwrites = [];

function batch(namesInput, operationsInput, handler)
{
  var names = toArray( namesInput, /\s*,\s/ );
  var operations = toArray( operationsInput, /\s*,\s/ );
  var batchID = batchHandlers.push( handler ) - 1;
  var batch = batches[ batchID ] = new Collection();

  for (var i = 0; i < names.length; i++)
  {
    var modelName = names[ i ];
    var modelHandler = createModelHandler( operations, batch );

    if ( isString( modelName ) )
    {
      if ( modelName in Rekord.classes )
      {
        modelHandler( Rekord.classes[ modelName ] );
      }
      else
      {
        earlyModelHandler( modelName, modelHandler );
      }
    }
    else if ( isRekord( modelName ) )
    {
      modelHandler( modelName );
    }
    else if ( modelName === true )
    {
      for (var databaseName in Rekord.classes)
      {
        modelHandler( Rekord.classes[ databaseName ] );
      }

      Rekord.on( Rekord.Events.Plugins, modelHandler );
    }
    else
    {
      throw modelName + ' is not a valid input for batching';
    }
  }
}

function earlyModelHandler(name, modelHandler)
{
  var off = Rekord.on( Rekord.Events.Plugins, function(model, database)
  {
    if ( database.name === name )
    {
      modelHandler( model );

      off();
    }
  });
}

function createModelHandler(operations, batch)
{
  return function(modelClass)
  {
    var db = modelClass.Database;
    var rest = db.rest;

    for (var i = 0; i < operations.length; i++)
    {
      var op = operations[ i ];

      batchOverwrites.push( rest, op, rest[ op ] );

      switch (op)
      {
        case 'all':
          rest.all = function(success, failure) // jshint ignore:line
          {
            batch.push({
              database: db,
              class: modelClass,
              operation: 'all',
              success: success,
              failure: failure
            });
          };
          break;
        case 'get':
          rest.get = function(model, success, failure) // jshint ignore:line
          {
            batch.push({
              database: db,
              class: modelClass,
              operation: 'get',
              success: success,
              failure: failure,
              model: model
            });
          };
          break;
        case 'create':
          rest.create = function(model, encoded, success, failure) // jshint ignore:line
          {
            batch.push({
              database: db,
              class: modelClass,
              operation: 'create',
              success: success,
              failure: failure,
              model: model,
              encoded: encoded
            });
          };
          break;
        case 'update':
          rest.update = function(model, encoded, success, failure) // jshint ignore:line
          {
            batch.push({
              database: db,
              class: modelClass,
              operation: 'update',
              success: success,
              failure: failure,
              model: model,
              encoded: encoded
            });
          };
          break;
        case 'remove':
          rest.remove = function(model, success, failure) // jshint ignore:line
          {
            batch.push({
              database: db,
              class: modelClass,
              operation: 'remove',
              success: success,
              failure: failure,
              model: model
            });
          };
          break;
        case 'query':
          rest.query = function(url, query, success, failure) // jshint ignore:line
          {
            batch.push({
              database: db,
              class: modelClass,
              operation: 'query',
              success: success,
              failure: failure,
              url: url,
              encoded: query
            });
          };
          break;
        default:
          throw op + ' is not a valid operation you can batch';
      }
    }
  };
}

function batchRun()
{
  for (var i = 0; i < batches.length; i++)
  {
    var batch = batches[ i ];
    var handler = batchHandlers[ i ];

    if ( batch.length )
    {
      handler( batch );

      batch.clear();
    }
  }
}

function batchStart()
{
  batchDepth++;
}

function batchEnd()
{
  batchDepth--;

  if ( batchDepth === 0 )
  {
    batchRun();
  }
}

function batchClear()
{
  for (var i = 0; i < batchOverwrites.length; i += 3)
  {
    var rest = batchOverwrites[ i + 0 ];
    var prop = batchOverwrites[ i + 1 ];
    var func = batchOverwrites[ i + 2 ];

    rest[ prop ] = func;
  }

  batches.length = 0;
  batchHandlers.length = 0;
  batchOverwrites.length = 0;
}

function batchExecute(func, context)
{
  try
  {
    batchStart();

    func.apply( context );
  }
  catch (ex)
  {
    Rekord.trigger( Rekord.Events.Error, [ex] );

    throw ex;
  }
  finally
  {
    batchEnd();
  }
}

Rekord.batch = batch;
Rekord.batchRun = batchRun;
Rekord.batchStart = batchStart;
Rekord.batchEnd = batchEnd;
Rekord.batchClear = batchClear;
Rekord.batchExecute = batchExecute;
Rekord.batchDepth = function() { return batchDepth; };
