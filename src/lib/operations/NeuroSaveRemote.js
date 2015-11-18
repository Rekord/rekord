function NeuroSaveRemote(model)
{
  this.reset( model );
}

extend( new NeuroOperation( false, 'NeuroSaveRemote' ), NeuroSaveRemote,
{

  run: function(db, model)
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
    var encoded = this.encoded = model.$toJSON( true );
    var changes = this.changes = model.$getChanges( encoded );
    var saving = this.saving = db.fullSave ? encoded : changes;
    var publishing = this.publishing = db.fullPublish ? encoded : changes;

    // If there's nothing to save, don't bother!
    if ( isEmpty( changes ) )
    {
      return this.finish();
    }

    // Make the REST call to save the model
    if ( model.$saved )
    {
      db.rest.update( model, saving, this.success(), this.failure() );
    }
    else
    {
      db.rest.create( model, saving, this.success(), this.failure() );
    }
  },

  onSuccess: function(data)
  {
    var model = this.model;

    Neuro.debug( Neuro.Events.SAVE_REMOTE, this, model );

    this.handleData( data );
  },

  onFailure: function(data, status)
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

        Neuro.once( 'online', this.handleOnline, this );
      }

      Neuro.debug( Neuro.Events.SAVE_OFFLINE, this, model );
    }
  },

  handleData: function(data)
  {
    var db = this.db;
    var model = this.model;
    var saving = this.saving;
    var publishing = this.publishing;

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
      op: NeuroDatabase.Live.Save,
      model: publishing,
      key: this.key
    });

    if ( db.cachePending && db.cache !== false )
    {
      this.insertNext( NeuroRemoveCache );
    }
  },

  handleOnline: function()
  {
    var model = this.model;

    if ( model.$pendingSave )
    { 
      model.$pendingSave = false;
      model.$addOperation( NeuroSaveRemote );

      Neuro.debug( Neuro.Events.SAVE_RESUME, this, model );
    }
  }

});