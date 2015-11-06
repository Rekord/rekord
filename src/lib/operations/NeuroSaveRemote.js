function NeuroSaveRemote(model)
{
  this.reset( model );
}

NeuroSaveRemote.prototype = new NeuroOperation( false, 'NeuroSaveRemote' );

NeuroSaveRemote.prototype.run = function(db, model)
{
  // If the model is deleted, return immediately!
  if ( model.$deleted )
  {
    Neuro.debug( Neuro.Events.SAVE_REMOTE_DELETED, this, model );

    return this.finish();
  }

  // Grab key & encode to JSON
  var key = this.key = model.$key();

  // The fields that have changed since last save
  var saving = this.saving = model.$getChanges( true );

  // If there's nothing to save, don't bother!
  if ( isEmpty( saving ) )
  {
    return this.finish();
  }

  // Make the REST call to remove the model
  var options = {
    method: model.$saved ? 'PUT' : 'POST',
    url:    model.$saved ? db.api + key : db.api,
    data:   saving
  };

  db.rest( options, this.success(), this.failure() );
};

NeuroSaveRemote.prototype.onSuccess = function(data)
{
  var model = this.model;

  Neuro.debug( Neuro.Events.SAVE_REMOTE, this, model );

  this.handleData( data );
};

NeuroSaveRemote.prototype.onFailure = function(data, status)
{
  var operation = this;
  var db = this.db;
  var model = this.model;

  // A non-zero status means a real problem occurred
  if ( status === 409 ) // 409 Conflict
  {
    Neuro.debug( Neuro.Events.SAVE_CONFLICT, this, data, model );

    // Update the model with the data saved and returned
    this.handleData( data, model, this.db );
  }
  else if ( status === 410 || status === 404 ) // 410 Gone, 404 Not Found
  {
    Neuro.debug( Neuro.Events.SAVE_UPDATE_FAIL, this, model );

    this.insertNext( NeuroRemoveNow );
  }
  else if ( status !== 0 ) 
  {          
    Neuro.debug( Neuro.Events.SAVE_ERROR, this, model, status );
  } 
  else 
  {
    // Check the network status right now
    Neuro.checkNetworkStatus();

    // If not online for sure, try saving once online again
    if (!Neuro.online) 
    {
      model.$pendingSave = true;

      Neuro.once('online', function() 
      {
        if ( model.$pendingSave )
        { 
          model.$pendingSave = false;
          model.$addOperation( NeuroSaveRemote );

          Neuro.debug( Neuro.Events.SAVE_RESUME, operation, model );
        }
      });
    }

    Neuro.debug( Neuro.Events.SAVE_OFFLINE, this, model );
  }
};

NeuroSaveRemote.prototype.handleData = function(data)
{
  var db = this.db;
  var model = this.model;
  var saving = this.saving;

  // Check deleted one more time before updating model.
  if ( model.$deleted )
  {
    Neuro.debug( Neuro.Events.SAVE_REMOTE_DELETED, this, model, data );

    return;
  }

  // If data was returned, place it in saving to update the model and publish
  for (var prop in data)
  {
    if ( !(prop in saving ) )
    {
      saving[ prop ] = data[ prop ];
    }
  }

  Neuro.debug( Neuro.Events.SAVE_VALUES, this, saving, model );

  // If the model hasn't been saved before - create the record where the 
  // local and model point to the same object.
  if ( !model.$saved )
  {
    if ( db.cache === false )
    {
      model.$saved = {};
    }
    else
    {
      model.$saved = model.$local.$saved = {}; 
    }
  }
  
  // Update the model with the return data
  db.putRemoteData( saving, this.key, model );

  // Publish saved data to everyone else
  Neuro.debug( Neuro.Events.SAVE_PUBLISH, this, saving, model );

  db.live({
    op: 'SAVE',
    model: saving,
    key: this.key
  });
};