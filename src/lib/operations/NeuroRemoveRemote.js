function NeuroRemoveRemote(model)
{
  this.reset( model );
}

NeuroRemoveRemote.prototype = new NeuroOperation( true );

NeuroRemoveRemote.prototype.run = function(db, model)
{
  // Cancel any pending saves
  model.$pendingSave = false;
  model.$deleted = true;

  // Grab key & encode to JSON
  this.key = model.$key();

  // Make the REST call to remove the model
  var options = {
    method: 'DELETE',
    url:    db.api + this.key
  };

  db.rest( options, this.success(), this.failure() );
};

NeuroRemoveRemote.prototype.onSuccess = function(data)
{
  this.finishRemove();
};

NeuroRemoveRemote.prototype.onFailure = function(data, status)
{
  var key = this.key;
  var model = this.model;

  if ( status === 404 || status === 410 )
  {
    Neuro.debug( Neuro.Events.REMOVE_MISSING, key, model );

    this.finishRemove();
  }
  else if ( status !== 0 ) 
  {
    Neuro.debug( Neuro.Events.REMOVE_ERROR, status, key, model );
  } 
  else 
  {
    // Looks like we're offline!
    Neuro.checkNetworkStatus();

    // If we are offline, wait until we're online again to resume the delete
    if (!Neuro.online) 
    {
      Neuro.once('online', function() 
      {
        Neuro.debug( Neuro.Events.REMOVE_RESUME, model );

        model.$addOperation( NeuroRemoveRemote );
      });
    }

    Neuro.debug( Neuro.Events.REMOVE_OFFLINE, model );
  }
};

NeuroRemoveRemote.prototype.finishRemove = function()
{
  var db = this.db;
  var key = this.key;
  var model = this.model;

  Neuro.debug( Neuro.Events.REMOVE_REMOTE, key, model );

  // Remove from local storage now
  this.insertNext( NeuroRemoveNow );

  // Publish REMOVE
  Neuro.debug( Neuro.Events.REMOVE_PUBLISH, key, model );

  db.live({
    op: 'REMOVE',
    key: key
  });
};