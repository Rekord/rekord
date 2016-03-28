function NeuroRemoteQuery(database, query)
{
  this.init( database );
  this.query = query;
  this.status = NeuroRemoteQuery.Status.Success;
  this.request = new NeuroRequest( this, this.handleSuccess, this.handleFailure );
}

NeuroRemoteQuery.Status =
{
  Pending:    'pending',
  Success:    'success',
  Failure:    'failure'
};

NeuroRemoteQuery.Events =
{
  Ready:      'ready',
  Success:    'success',
  Failure:    'failure'
};

extendArray( NeuroQuery, NeuroRemoteQuery,
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
    this.status = NeuroRemoteQuery.Status.Pending;

    if ( clearPending )
    {
      this.cancel();
    }

    this.database.rest.query( this.query, this.request.onSuccess(), this.request.onFailure() );

    return this;
  },

  cancel: function()
  {
    this.off( NeuroRemoteQuery.Events.Ready );
    this.off( NeuroRemoteQuery.Events.Success );
    this.off( NeuroRemoteQuery.Events.Failure );

    this.request.cancel();

    return this;
  },

  ready: function(callback, context)
  {
    if ( this.status === NeuroRemoteQuery.Status.Pending )
    {
      this.once( NeuroRemoteQuery.Events.Ready, callback, context );
    }
    else
    {
      callback.call( context, this );
    }

    return this;
  },

  success: function(callback, context)
  {
    if ( this.status === NeuroRemoteQuery.Status.Pending )
    {
      this.once( NeuroRemoteQuery.Events.Success, callback, context );
    }
    else if ( this.status === NeuroRemoteQuery.Status.Success )
    {
      callback.call( context, this );
    }

    return this;
  },

  failure: function(callback, context)
  {
    if ( this.status === NeuroRemoteQuery.Status.Pending )
    {
      this.once( NeuroRemoteQuery.Events.Failure, callback, context );
    }
    else if ( this.status === NeuroRemoteQuery.Status.Failure )
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

    this.status = NeuroRemoteQuery.Status.Success;
    this.reset( models, true );
    this.off( NeuroRemoteQuery.Events.Failure, this.onFailure );
    this.trigger( NeuroRemoteQuery.Events.Ready, [this, response] );
    this.trigger( NeuroRemoteQuery.Events.Success, [this, response] );
  },

  handleFailure: function(response, error)
  {
    this.status = NeuroRemoteQuery.Status.Failure;
    this.off( NeuroRemoteQuery.Events.Success, this.onSuccess );
    this.trigger( NeuroRemoteQuery.Events.Ready, [this, response] );
    this.trigger( NeuroRemoteQuery.Events.Failure, [this, response] );
  }

});
