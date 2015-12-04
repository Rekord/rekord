function NeuroRemoteQuery(database, query)
{
  this.init( database );
  this.query = query;
  this.status = NeuroRemoteQuery.Status.Success;

  this.onSuccess = this.handleSuccess();
  this.onFailure = this.handleFailure();
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

    this.database.rest.query( this.query, this.onSuccess, this.onFailure );

    return this;
  },

  cancel: function()
  {
    this.off( NeuroRemoteQuery.Events.Ready );
    this.off( NeuroRemoteQuery.Events.Success );
    this.off( NeuroRemoteQuery.Events.Failure );

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

  handleSuccess: function()
  {
    var query = this;

    return function(models)
    {
      query.status = NeuroRemoteQuery.Status.Success;
      query.reset( models, true );
      query.trigger( NeuroRemoteQuery.Events.Success, [query] );
      query.trigger( NeuroRemoteQuery.Events.Ready, [query] );
    };
  },

  handleFailure: function()
  {
    var query = this;

    return function(models, error)
    {
      query.status = NeuroRemoteQuery.Status.Failure;
      query.trigger( NeuroRemoteQuery.Events.Failure, [query] );
      query.trigger( NeuroRemoteQuery.Events.Ready, [query] );
    };
  }

});