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
      Neuro.debug( Neuro.Events.REMOVE_MISSING, this, key, model );

      this.finishRemove();
    }
    else if ( status !== 0 ) 
    {
      Neuro.debug( Neuro.Events.REMOVE_ERROR, this, status, key, model );
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

      Neuro.debug( Neuro.Events.REMOVE_OFFLINE, this, model );
    }
  },

  finishRemove: function()
  {
    var db = this.db;
    var key = this.key;
    var model = this.model;

    Neuro.debug( Neuro.Events.REMOVE_REMOTE, this, key, model );

    // Remove from local storage now
    this.insertNext( NeuroRemoveNow );

    // Publish REMOVE
    Neuro.debug( Neuro.Events.REMOVE_PUBLISH, this, key, model );

    db.live({
      op: NeuroDatabase.Live.Remove,
      key: key
    });
  },

  handleOnline: function()
  {
    var model = this.model;

    Neuro.debug( Neuro.Events.REMOVE_RESUME, this, model );

    model.$addOperation( NeuroRemoveRemote );
  }

});

