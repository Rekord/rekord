
var batchDepth = 0;
var batches = [];
var batchHandlers = [];

function batch(namesInput, operationsInput, handler)
{
  var names = toArray( namesInput, /\s*,\s/ );
  var operations = toArray( operationsInput, /\s*,\s/ );
  var batchID = batchHandlers.push( handler ) - 1;

  for (var i = 0; i < names.length; i++)
  {
    var modelName = names[ i ];
    var modelHandler = createModelHandler( operations, batchID );

    if ( isString( modelName ) )
    {
      if ( modelName in Rekord.classes )
      {
        modelHandler( Rekord.classes[ modelName ] );
      }
      else
      {
        (function(name, modelHandler)
        {
          Rekord.on( Rekord.Events.Plugins, function(model, database)
          {
            if ( database.name === name )
            {
              modelHandler( model );
            }
          });

        })( modelName, modelHandler );
      }
    }
    else if ( isRekord( modelName ) )
    {
      modelHandler( modelName );
    }
    else if ( modelName === true )
    {
      for (databaseName in Rekord.classes)
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

function createModelHandler(operations, batchID)
{
  return function(modelClass)
  {
    var db = modelClass.Database;
    var rest = db.rest;
    var currentBatch = batches[ batchID ] = new Collection();

    for (var i = 0; i < operations.length; i++)
    {
      var op = operations[ i ];

      switch (op)
      {
        case 'all':
          rest.all = function(success, failure)
          {
            currentBatch.push({
              database: db,
              class: modelClass,
              operation: 'all',
              success: success,
              failure: failure
            });
          };
          break;
        case 'get':
          rest.get = function(model, success, failure)
          {
            currentBatch.push({
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
          rest.create = function(model, encoded, success, failure)
          {
            currentBatch.push({
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
          rest.update = function(model, encoded, success, failure)
          {
            currentBatch.push({
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
          rest.remove = function(model, success, failure)
          {
            currentBatch.push({
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
          rest.query = function(url, query, success, failure)
          {
            currentBatch.push({
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

Rekord.batch = batch;
Rekord.batchRun = batchRun;
Rekord.batchStart = batchStart;
Rekord.batchEnd = batchEnd;
