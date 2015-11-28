function NeuroRemoteQuery(database, query)
{
  this.init( database );
  this.query = query;
  this.status = NeuroRemoteQuery.Status.Pending;
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

  sync: function(clearPending)
  {
    this.status = NeuroRemoteQuery.Status.Pending;

    if ( clearPending )
    {
      this.off( NeuroRemoteQuery.Events.Ready );
      this.off( NeuroRemoteQuery.Events.Success );
      this.off( NeuroRemoteQuery.Events.Failure );
    }

    this.database.rest.query( this.query, this.onSuccess(), this.onFailure() );
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
  },

  onSuccess: function()
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

  onFailure: function()
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