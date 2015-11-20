function NeuroRemoveRemote(model)
{
  this.reset( model );
}

extend( new NeuroOperation( true, 'NeuroRemoveRemote' ), NeuroRemoveRemote,
{

  run: function(db, model)
  {
    // Cancel any pending saves
    model.$pendingSave = false;
    model.$deleted = true;

    // Grab key & encode to JSON
    this.key = model.$key();

    // Make the REST call to remove the model
    db.rest.remove( model, this.success(), this.failure() );
  },

  onSuccess: function(data)
  {
    this.finishRemove();
  },

  onFailure: function(data, status)
  {
    var key = this.key;
    var model = this.model;

    if ( status === 404 || status === 410 )
    {
      Neuro.debug( Neuro.Debugs.REMOVE_MISSING, model, key );

      this.finishRemove();
    }
    else if ( status !== 0 ) 
    {
      Neuro.debug( Neuro.Debugs.REMOVE_ERROR, model, status, key );
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

      Neuro.debug( Neuro.Debugs.REMOVE_OFFLINE, model );
    }
  },

  finishRemove: function()
  {
    var db = this.db;
    var key = this.key;
    var model = this.model;

    Neuro.debug( Neuro.Debugs.REMOVE_REMOTE, model, key );

    // Remove from local storage now
    this.insertNext( NeuroRemoveNow );

    // Publish REMOVE
    Neuro.debug( Neuro.Debugs.REMOVE_PUBLISH, model, key );

    db.live({
      op: NeuroDatabase.Live.Remove,
      key: key
    });
  },

  handleOnline: function()
  {
    var model = this.model;

    Neuro.debug( Neuro.Debugs.REMOVE_RESUME, model );

    model.$addOperation( NeuroRemoveRemote );
  }

});

