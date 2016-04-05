function RemoteQuery(database, query)
{
  this.init( database );
  this.query = query;
  this.status = RemoteQuery.Status.Success;
  this.request = new Request( this, this.handleSuccess, this.handleFailure );
}

RemoteQuery.Status =
{
  Pending:    'pending',
  Success:    'success',
  Failure:    'failure'
};

RemoteQuery.Events =
{
  Ready:      'ready',
  Success:    'success',
  Failure:    'failure'
};

extendArray( Query, RemoteQuery,
{

  setQuery: function(query, skipSync, clearPending)
  {
    this.query = query;

    if ( !skipSync )
    {
      this.sync( clearPending );
    }

    return this;
  },

  sync: function(clearPending)
  {
    this.status = RemoteQuery.Status.Pending;

    if ( clearPending )
    {
      this.cancel();
    }

    this.database.rest.query( this.query, this.request.onSuccess(), this.request.onFailure() );

    return this;
  },

  cancel: function()
  {
    this.off( RemoteQuery.Events.Ready );
    this.off( RemoteQuery.Events.Success );
    this.off( RemoteQuery.Events.Failure );

    this.request.cancel();

    return this;
  },

  ready: function(callback, context)
  {
    if ( this.status === RemoteQuery.Status.Pending )
    {
      this.once( RemoteQuery.Events.Ready, callback, context );
    }
    else
    {
      callback.call( context, this );
    }

    return this;
  },

  success: function(callback, context)
  {
    if ( this.status === RemoteQuery.Status.Pending )
    {
      this.once( RemoteQuery.Events.Success, callback, context );
    }
    else if ( this.status === RemoteQuery.Status.Success )
    {
      callback.call( context, this );
    }

    return this;
  },

  failure: function(callback, context)
  {
    if ( this.status === RemoteQuery.Status.Pending )
    {
      this.once( RemoteQuery.Events.Failure, callback, context );
    }
    else if ( this.status === RemoteQuery.Status.Failure )
    {
      callback.call( context, this );
    }

    return this;
  },

  parse: function(models)
  {
    return models;
  },

  handleSuccess: function(response)
  {
    var models = this.parse.apply( this, arguments );

    this.status = RemoteQuery.Status.Success;
    this.reset( models, true );
    this.off( RemoteQuery.Events.Failure, this.onFailure );
    this.trigger( RemoteQuery.Events.Ready, [this, response] );
    this.trigger( RemoteQuery.Events.Success, [this, response] );
  },

  handleFailure: function(response, error)
  {
    this.status = RemoteQuery.Status.Failure;
    this.off( RemoteQuery.Events.Success, this.onSuccess );
    this.trigger( RemoteQuery.Events.Ready, [this, response] );
    this.trigger( RemoteQuery.Events.Failure, [this, response] );
  }

});
