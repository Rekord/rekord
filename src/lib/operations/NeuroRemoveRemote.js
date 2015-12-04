function NeuroRemoveRemote(model, cascade)
{
  this.reset( model, cascade );
}

extend( NeuroOperation, NeuroRemoveRemote,
{

  interrupts: true,

  type: 'NeuroRemoveRemote',

  run: function(db, model)
  {
    model.$status = NeuroModel.Status.RemovePending;

    db.rest.remove( model, this.success(), this.failure() );
  },

  onSuccess: function(data)
  {
    this.finishRemove();
  },

  onFailure: function(data, status)
  {
    var model = this.model;
    var key = model.$key();

    if ( status === 404 || status === 410 )
    {
      Neuro.debug( Neuro.Debugs.REMOVE_MISSING, model, key );

      this.finishRemove();
    }
    else if ( status !== 0 ) 
    {
      Neuro.debug( Neuro.Debugs.REMOVE_ERROR, model, status, key );

      model.$trigger( NeuroModel.Events.RemoteRemoveFailure, [model] );
    }
    else
    {
      // Looks like we're offline!
      Neuro.checkNetworkStatus();

      // If we are offline, wait until we're online again to resume the delete
      if (!Neuro.online) 
      {
        Neuro.once( 'online', this.handleOnline, this );
      }
      else
      {
        model.$trigger( NeuroModel.Events.RemoteRemoveFailure, [model] );
      }

      Neuro.debug( Neuro.Debugs.REMOVE_OFFLINE, model );
    }
  },

  finishRemove: function()
  {
    var db = this.db;
    var model = this.model;
    var key = model.$key();

    Neuro.debug( Neuro.Debugs.REMOVE_REMOTE, model, key );

    // Successfully removed!
    model.$status = NeuroModel.Status.Removed;

    // Successfully Removed!
    model.$trigger( NeuroModel.Events.RemoteRemove, [model] );

    // Remove from local storage now
    this.insertNext( NeuroRemoveNow );

    // Publish REMOVE
    Neuro.debug( Neuro.Debugs.REMOVE_PUBLISH, model, key );

    db.live(
    {
      op:   NeuroDatabase.Live.Remove,
      key:  key
    });
  },

  handleOnline: function()
  {
    var model = this.model;

    Neuro.debug( Neuro.Debugs.REMOVE_RESUME, model );

    model.$addOperation( NeuroRemoveRemote );
  }

});

