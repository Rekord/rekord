function NeuroRemoteQuery(database, query)
{
  this.init( database );
  this.query = query;
  this.status = NeuroRemoteQuery.Status.Pending;

  this.onSuccess = this.handleSuccess();
  this.onFailure = this.handleFailure();
}

NeuroRemoteQuery.Status =
{
  Pending:  0,
  Success:  1,
  Failure:  2
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
    var that = this;

    return function(models)
    {
      that.status = NeuroRemoteQuery.Status.Success;
      that.reset( models, true );
      that.trigger( NeuroRemoteQuery.Events.Success, [that] );
      that.trigger( NeuroRemoteQuery.Events.Ready, [that] );
    };
  },

  handleFailure: function()
  {
    var that = this;

    return function(models, error)
    {
      that.status = NeuroRemoteQuery.Status.Failure;
      that.trigger( NeuroRemoteQuery.Events.Failure, [that] );
      that.trigger( NeuroRemoteQuery.Events.Ready, [that] );
    };
  }

});