
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
    this.$request = new NeuroRequest( this, this.$handleSuccess, this.$handleFailure );
  },

  $run: function()
  {
    var encoded = this.$encode();

    this.$status = NeuroSearch.Status.Pending;

    var success = this.$request.onSuccess();
    var failure = this.$request.onFailure();

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

  $cancel: function()
  {
    this.$off( NeuroSearch.Events.Ready );
    this.$off( NeuroSearch.Events.Success );
    this.$off( NeuroSearch.Events.Failure );

    this.$request.cancel();

    return this;
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

  $handleSuccess: function(response)
  {
    var models = this.$decode.apply( this, arguments );

    this.$status = NeuroSearch.Status.Success;
    this.$results.reset( models, true );
    this.$trigger( NeuroSearch.Events.Ready, [this, response] );
    this.$trigger( NeuroSearch.Events.Success, [this, response] );
  },

  $handleFailure: function(response)
  {
    this.$status = NeuroSearch.Status.Failure;
    this.$trigger( NeuroSearch.Events.Ready, [this, response] );
    this.$trigger( NeuroSearch.Events.Failure, [this, response] );
  },

  $encode: function()
  {
    return cleanFunctions( copy( this ) );
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
