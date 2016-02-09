
function NeuroSearch(database, options)
{
  this.$init( database, options );
}

NeuroSearch.Events =
{
  Ready:      'ready',
  Success:    'success',
  Failure:    'failure'
};

NeuroSearch.Status =
{
  Pending:    'pending',
  Success:    'success',
  Failure:    'failure'
};

NeuroSearch.Defaults =
{
  $method:     'create'
};

NeuroSearch.prototype =
{

  $init: function(database, options)
  {
    applyOptions( this, options, NeuroSearch.Defaults, true );

    this.$db = database;
    this.$results = new NeuroModelCollection( database );
    this.$status = NeuroSearch.Status.Success;
    this.$concurrent = 0;
  },

  $run: function()
  {
    var encoded = this.$encode();

    this.$status = NeuroSearch.Status.Pending;
    this.$concurrent++;

    var success = bind( this, this.$handleSuccess( this.$concurrent ) );
    var failure = bind( this, this.$handleFailure( this.$concurrent ) );

    switch (this.$method) {
      case 'create':
        this.$db.rest.create( this, encoded, success, failure );
        break;
      case 'update':
        this.$db.rest.update( this, encoded, success, failure );
        break;
      case 'query':
        this.$db.rest.query( encoded, success, failure );
        break;
      default:
        throw 'Invalid search method: ' + this.$method;
    }
  },

  $ready: function(callback, context)
  {
    if ( this.$status === NeuroSearch.Status.Pending )
    {
      this.$once( NeuroSearch.Events.Ready, callback, context );
    }
    else
    {
      callback.call( context, this );
    }

    return this;
  },

  $success: function(callback, context)
  {
    if ( this.$status === NeuroSearch.Status.Pending )
    {
      this.$once( NeuroSearch.Events.Success, callback, context );
    }
    else if ( this.$status === NeuroSearch.Status.Success )
    {
      callback.call( context, this );
    }

    return this;
  },

  $failure: function(callback, context)
  {
    if ( this.$status === NeuroSearch.Status.Pending )
    {
      this.$once( NeuroSearch.Events.Failure, callback, context );
    }
    else if ( this.$status === NeuroSearch.Status.Failure )
    {
      callback.call( context, this );
    }

    return this;
  },

  $handleSuccess: function(concurrentCount)
  {
    return function onSuccess()
    {
      if (this.$concurrent === concurrentCount)
      {
        var models = this.$decode.apply( this, arguments );

        this.$concurrent = 0;
        this.$status = NeuroSearch.Status.Success;
        this.$results.reset( models, true );
        this.$trigger( NeuroSearch.Events.Ready, [this] );
        this.$trigger( NeuroSearch.Events.Success, [this] );
      }
    };
  },

  $handleFailure: function(concurrentCount)
  {
    return function onFailure()
    {
      if (this.$concurrent === concurrentCount)
      {
        this.$concurrent = 0;
        this.$status = NeuroSearch.Status.Failure;
        this.$trigger( NeuroSearch.Events.Ready, [this] );
        this.$trigger( NeuroSearch.Events.Failure, [this] );
      }
    };
  },

  $encode: function()
  {
    return cleanFunctions(copy(this));
  },

  $decode: function(models)
  {
    return models;
  },

  $key: function()
  {
    return '';
  }

};

eventize( NeuroSearch.prototype, true );
