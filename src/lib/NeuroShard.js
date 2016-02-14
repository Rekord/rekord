
Neuro.shard = function(methods)
{
  return function createRestSharding(database)
  {
    var shard = new NeuroShard( database );

    transfer( methods, shard );

    shard.initialize( database );

    return shard;
  };
};

function NeuroShard(database)
{
  this.database = database;
}

NeuroShard.prototype =
{

  STATUS_FAIL_ALL: 500,
  STATUS_FAIL_GET: 500,
  STATUS_FAIL_CREATE: 500,
  STATUS_FAIL_UPDATE: 500,
  STATUS_FAIL_REMOVE: 500,
  STATUS_FAIL_QUERY: 500,

  getShards: function()
  {
    throw 'getShards not implemented';
  },

  getShardForModel: function(model)
  {
    throw 'getShardForModel not implemented';
  },

  getShardsForModel: function(model)
  {
    var single = this.getShardForModel( model );

    return single ? [ single ] : this.getShards();
  },

  getShardsForQuery: function(query)
  {
    return this.getShards();
  },

  initialize: function(database)
  {

  },

  all: function(success, failure)
  {
    var shards = this.getShards();
    var all = [];

    function invoke(shard, onShardSuccess, onShardFailure)
    {
      shard.all( onShardSuccess, onShardFailure );
    }
    function onSuccess(models)
    {
      if ( isArray( models ) )
      {
        all.push.apply( all, models );
      }
    }
    function onComplete(successful, alreadyFailed, failedStatus)
    {
      if ( successful )
      {
        success( all );
      }
      else if ( !alreadyFailed )
      {
        failure( all, isDefined( failedStatus ) ? failedStatus : this.STATUS_FAIL_ALL );
      }
    }

    this.multiplex( shards, invoke, onSuccess, failure, onComplete );
  },

  get: function(model, success, failure)
  {
    var shards = this.getShardsForModel( model );
    var gotten = null;

    function invoke(shard, onShardSuccess, onShardFailure)
    {
      shard.get( model, onShardSuccess, onShardFailure );
    }
    function onSuccess(data)
    {
      if ( gotten === null && isObject( data ) )
      {
        gotten = data;
      }
    }
    function onComplete(successful, alreadyFailed, failedStatus)
    {
      if ( gotten !== null )
      {
        success( gotten );
      }
      else
      {
        failure( gotten, isDefined( failedStatus ) ? failedStatus : this.STATUS_FAIL_GET );
      }
    }

    this.multiplex( shards, invoke, onSuccess, noop, onComplete );
  },

  create: function( model, encoded, success, failure )
  {
    var shards = this.getShardsForModel( model );
    var returned = null;

    function invoke(shard, onShardSuccess, onShardFailure)
    {
      shard.create( model, encoded, onShardSuccess, onShardFailure );
    }
    function onSuccess(data)
    {
      if ( returned === null && isObject( returned ) )
      {
        returned = data;
      }
    }
    function onComplete(successful, alreadyFailed, failedStatus)
    {
      if ( successful )
      {
        success( returned );
      }
      else
      {
        failure( returned, isDefined( failedStatus ) ? failedStatus : this.STATUS_FAIL_CREATE );
      }
    }

    this.multiplex( shards, invoke, onSuccess, noop, onComplete );
  },

  update: function( model, encoded, success, failure )
  {
    var shards = this.getShardsForModel( model );
    var returned = null;

    function invoke(shard, onShardSuccess, onShardFailure)
    {
      shard.update( model, encoded, onShardSuccess, onShardFailure );
    }
    function onSuccess(data)
    {
      if ( returned === null && isObject( returned ) )
      {
        returned = data;
      }
    }
    function onComplete(successful, alreadyFailed, failedStatus)
    {
      if ( successful )
      {
        success( returned );
      }
      else
      {
        failure( returned, isDefined( failedStatus ) ? failedStatus : this.STATUS_FAIL_UPDATE );
      }
    }

    this.multiplex( shards, invoke, onSuccess, noop, onComplete );
  },

  remove: function( model, success, failure )
  {
    var shards = this.getShardsForModel( model );
    var returned = null;

    function invoke(shard, onShardSuccess, onShardFailure)
    {
      shard.remove( model, onShardSuccess, onShardFailure );
    }
    function onSuccess(data)
    {
      if ( returned === null && isObject( returned ) )
      {
        returned = data;
      }
    }
    function onComplete(successful, alreadyFailed, failedStatus)
    {
      if ( successful )
      {
        success( returned );
      }
      else
      {
        failure( returned, isDefined( failedStatus ) ? failedStatus : this.STATUS_FAIL_REMOVE );
      }
    }

    this.multiplex( shards, invoke, onSuccess, noop, onComplete );
  },

  query: function( query, success, failure )
  {
    var shards = this.getShardsForQuery( query );
    var results = [];

    function invoke(shard, onShardSuccess, onShardFailure)
    {
      shard.query( query, onShardSuccess, onShardFailure );
    }
    function onSuccess(models)
    {
      if ( isArray( models ) )
      {
        results.push.apply( results, models );
      }
    }
    function onComplete(successful, alreadyFailed, failedStatus)
    {
      if ( successful )
      {
        success( results );
      }
      else if ( !alreadyFailed )
      {
        failure( results, isDefined( failedStatus ) ? failedStatus : this.STATUS_FAIL_QUERY );
      }
    }

    this.multiplex( shards, invoke, onSuccess, noop, onComplete );
  },

  multiplex: function(shards, invoke, onSuccess, onFailure, onComplete)
  {
    var successful = true;
    var failedStatus = undefined;
    var total = 0;

    function onShardComplete()
    {
      if ( ++total === shards.length )
      {
        onComplete.call( this, successful, !successful, failedStatus );
      }
    }
    function onShardSuccess(data)
    {
      if ( successful )
      {
        onSuccess.apply( this, arguments );
      }

      onShardComplete();
    }
    function onShardFailure(data, status)
    {
      if ( successful )
      {
        successful = false;

        onFailure.apply( this, arguments );
      }

      if ( isNumber( status ) && (failedStatus === undefined || status < failedStatus) )
      {
        failedStatus = status;
      }

      onShardComplete();
    }

    for (var i = 0; i < shards.length; i++)
    {
      invoke.call( this, shards[ i ], onShardSuccess, onShardFailure );
    }
  }

};
