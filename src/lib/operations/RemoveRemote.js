function RemoveRemote(model, cascade)
{
  this.reset( model, cascade );
}

extend( Operation, RemoveRemote,
{

  cascading: Rekord.Cascade.Remote,

  interrupts: true,

  type: 'RemoveRemote',

  run: function(db, model)
  {
    if ( this.notCascade( Rekord.Cascade.Rest ) )
    {
      this.liveRemove();

      model.$trigger( Model.Events.RemoteRemove, [model] );

      this.finish();
    }
    else
    {
      model.$status = Model.Status.RemovePending;

      db.rest.remove( model, this.success(), this.failure() );
    }
  },

  onSuccess: function(data)
  {
    this.finishRemove();
  },

  onFailure: function(response, status)
  {
    var model = this.model;
    var key = model.$key();

    if ( status === 404 || status === 410 )
    {
      Rekord.debug( Rekord.Debugs.REMOVE_MISSING, model, key );

      this.finishRemove();
    }
    else if ( status !== 0 )
    {
      Rekord.debug( Rekord.Debugs.REMOVE_ERROR, model, status, key, response );

      model.$trigger( Model.Events.RemoteRemoveFailure, [model, response] );
    }
    else
    {
      // Looks like we're offline!
      Rekord.checkNetworkStatus();

      // If we are offline, wait until we're online again to resume the delete
      if (!Rekord.online)
      {
        Rekord.once( Rekord.Events.Online, this.handleOnline, this );

        model.$trigger( Model.Events.RemoteRemoveOffline, [model, response] );
      }
      else
      {
        model.$trigger( Model.Events.RemoteRemoveFailure, [model, response] );
      }

      Rekord.debug( Rekord.Debugs.REMOVE_OFFLINE, model, response );
    }
  },

  finishRemove: function()
  {
    var db = this.db;
    var model = this.model;
    var key = model.$key();

    Rekord.debug( Rekord.Debugs.REMOVE_REMOTE, model, key );

    // Successfully removed!
    model.$status = Model.Status.Removed;

    // Successfully Removed!
    model.$trigger( Model.Events.RemoteRemove, [model] );

    // Remove from local storage now
    this.insertNext( RemoveNow );

    // Remove it live!
    this.liveRemove();

    // Remove the model reference for good!
    delete db.all[ key ];
  },

  liveRemove: function()
  {
    if ( this.canCascade( Rekord.Cascade.Live ) )
    {
      var db = this.db;
      var model = this.model;
      var key = model.$key();

      // Publish REMOVE
      Rekord.debug( Rekord.Debugs.REMOVE_PUBLISH, model, key );

      db.live.remove( model );
    }
  },

  handleOnline: function()
  {
    var model = this.model;

    Rekord.debug( Rekord.Debugs.REMOVE_RESUME, model );

    model.$addOperation( RemoveRemote );
  }

});
