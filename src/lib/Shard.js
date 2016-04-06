
Rekord.shard = function(methods)
{
  return function createRestSharding(database)
  {
    var shard = new Shard( database );

    transfer( methods, shard );

    shard.initialize( database );

    return shard;
  };
};

function Shard(database)
{
  this.database = database;
}

Shard.prototype =
{

  STATUS_FAIL_ALL: 500,
  STATUS_FAIL_GET: 500,
  STATUS_FAIL_CREATE: 500,
  STATUS_FAIL_UPDATE: 500,
  STATUS_FAIL_REMOVE: 500,
  STATUS_FAIL_QUERY: 500,

  ATOMIC_ALL: false,
  ATOMIC_GET: false,
  ATOMIC_CREATE: true,
  ATOMIC_UPDATE: true,
  ATOMIC_REMOVE: false,
  ATOMIC_QUERY: true,

  getShards: function(forRead)
  {
    throw 'getShards not implemented';
  },

  getShardForModel: function(model, forRead)
  {
    throw 'getShardForModel not implemented';
  },

  getShardsForModel: function(model, forRead)
  {
    var single = this.getShardForModel( model, forRead );

    return single ? [ single ] : this.getShards( forRead );
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
    var shards = this.getShards( true );
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
      if ( successful || (all.length && !this.ATOMIC_ALL) )
      {
        success( all );
      }
      else if ( !alreadyFailed )
      {
        failure( all, isDefined( failedStatus ) ? failedStatus : this.STATUS_FAIL_ALL );
      }
    }

    this.multiplex( shards, this.ATOMIC_ALL, invoke, onSuccess, failure, onComplete );
  },

  get: function(model, success, failure)
  {
    var shards = this.getShardsForModel( model, true );
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

    this.multiplex( shards, this.ATOMIC_GET, invoke, onSuccess, noop, onComplete );
  },

  create: function( model, encoded, success, failure )
  {
    var shards = this.getShardsForModel( model, false );
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

    this.multiplex( shards, this.ATOMIC_CREATE, invoke, onSuccess, noop, onComplete );
  },

  update: function( model, encoded, success, failure )
  {
    var shards = this.getShardsForModel( model, false );
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

    this.multiplex( shards, this.ATOMIC_UPDATE, invoke, onSuccess, noop, onComplete );
  },

  remove: function( model, success, failure )
  {
    var shards = this.getShardsForModel( model, false );
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

    this.multiplex( shards, this.ATOMIC_REMOVE, invoke, onSuccess, noop, onComplete );
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
      if ( successful || (results.length && !this.ATOMIC_QUERY) )
      {
        success( results );
      }
      else if ( !alreadyFailed )
      {
        failure( results, isDefined( failedStatus ) ? failedStatus : this.STATUS_FAIL_QUERY );
      }
    }

    this.multiplex( shards, this.ATOMIC_QUERY, invoke, onSuccess, noop, onComplete );
  },

  multiplex: function(shards, atomic, invoke, onSuccess, onFailure, onComplete)
  {
    var successful = true;
    var failureCalled = false;
    var failedStatus = undefined;
    var total = 0;

    function onShardComplete()
    {
      if ( ++total === shards.length )
      {
        onComplete.call( this, successful, failureCalled, failedStatus );
      }
    }
    function onShardSuccess(data)
    {
      if ( successful || !atomic )
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

        if ( atomic )
        {
          failureCalled = true;
          onFailure.apply( this, arguments );
        }
      }

      if ( isNumber( status ) && (failedStatus === undefined || status < failedStatus) )
      {
        failedStatus = status;
      }

      onShardComplete();
    }

    if ( !isArray( shards ) || shards.length === 0 )
    {
      onComplete.call( this, false, false, failedStatus );
    }
    else
    {
      for (var i = 0; i < shards.length; i++)
      {
        invoke.call( this, shards[ i ], onShardSuccess, onShardFailure );
      }
    }
  }

};
