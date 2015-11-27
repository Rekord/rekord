function NeuroSaveRemote(model, cascade)
{
  this.reset( model, cascade );
}

extend( new NeuroOperation( false, 'NeuroSaveRemote' ), NeuroSaveRemote,
{

  run: function(db, model)
  {
    if ( model.$isDeleted() )
    {
      Neuro.debug( Neuro.Debugs.SAVE_REMOTE_DELETED, model );

      this.finish();
    }
    else if ( isEmpty( model.$saving ) )
    {
      this.markSynced( model, true );

      this.finish();
    }
    else
    {
      model.$status = NeuroModel.Status.SavePending;

      if ( model.$saved )
      {
        db.rest.update( model, model.$saving, this.success(), this.failure() );
      }
      else
      {
        db.rest.create( model, model.$saving, this.success(), this.failure() );
      }
    }
  },

  onSuccess: function(data)
  {
    var model = this.model;

    Neuro.debug( Neuro.Debugs.SAVE_REMOTE, model );

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
      Neuro.debug( Neuro.Debugs.SAVE_CONFLICT, model, data );

      this.handleData( data );
    }
    else if ( status === 410 || status === 404 ) // 410 Gone, 404 Not Found
    {
      Neuro.debug( Neuro.Debugs.SAVE_UPDATE_FAIL, model );

      this.insertNext( NeuroRemoveNow );
    }
    else if ( status !== 0 ) 
    {          
      Neuro.debug( Neuro.Debugs.SAVE_ERROR, model, status );

      this.markSynced( model, true );
    } 
    else 
    {
      // Check the network status right now
      Neuro.checkNetworkStatus();

      // If not online for sure, try saving once online again
      if (!Neuro.online) 
      {
        Neuro.once( 'online', this.handleOnline, this );
      }
      else
      {
        this.markSynced( model, true );
      }

      Neuro.debug( Neuro.Debugs.SAVE_OFFLINE, model );
    }
  },

  markSynced: function(model, saveNow)
  {
    model.$status = NeuroModel.Status.Synced;

    this.clearPending( model );

    if ( saveNow )
    {
      this.insertNext( NeuroSaveNow ); 
    }
  },

  clearPending: function(model)
  {
    delete model.$saving;
    delete model.$publish;

    if ( model.$local )
    {
      model.$local.$status = model.$status;

      delete model.$local.$saving;
      delete model.$local.$publish;
    }
  },

  handleData: function(data)
  {
    var db = this.db;
    var model = this.model;
    var saving = model.$saving;
    var publishing = model.$publish;

    // Check deleted one more time before updating model.
    if ( model.$isDeleted() )
    {
      Neuro.debug( Neuro.Debugs.SAVE_REMOTE_DELETED, model, data );

      return this.clearPending( model );
    }

    Neuro.debug( Neuro.Debugs.SAVE_VALUES, model, saving );

    // If the model hasn't been saved before - create the record where the 
    // local and model point to the same object.
    if ( !model.$saved )
    {
      model.$saved = model.$local ? (model.$local.$saved = {}) : {}; 
    }

    transfer( saving, model.$saved );
    
    // Update the model with the return data
    if ( !isEmpty( data ) )
    {
      db.putRemoteData( data, model.$key(), model );
    }    

    // Publish saved data to everyone else
    Neuro.debug( Neuro.Debugs.SAVE_PUBLISH, model, publishing );

    db.live(
    {
      op:     NeuroDatabase.Live.Save,
      model:  model.$publish,
      key:    model.$key()
    });

    this.markSynced( model, false );
    
    if ( db.cache === Neuro.Cache.Pending )
    {
      this.insertNext( NeuroRemoveCache );
    }
    else
    {
      this.insertNext( NeuroSaveNow ); 
    }
  },

  handleOnline: function()
  {
    var model = this.model;

    if ( model.$status === NeuroModel.Status.SavePending )
    { 
      model.$addOperation( NeuroSaveRemote );

      Neuro.debug( Neuro.Debugs.SAVE_RESUME, model );
    }
  }

});