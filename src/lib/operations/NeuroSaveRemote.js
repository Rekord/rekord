function NeuroSaveRemote(model, cascade)
{
  this.reset( model, cascade );
}

extend( NeuroOperation, NeuroSaveRemote,
{

  cascading: Neuro.Cascade.Remote,

  interrupts: false,

  type: 'NeuroSaveRemote',

  run: function(db, model)
  {
    if ( model.$isDeleted() )
    {
      Neuro.debug( Neuro.Debugs.SAVE_REMOTE_DELETED, model );

      this.markSynced( model, true, NeuroModel.Events.RemoteSaveFailure );
      this.finish();
    }
    else if ( !model.$isDependentsSaved( this.tryAgain, this ) )
    {
      this.finish();
    }
    else if ( !db.hasData( model.$saving ) || this.notCascade( Neuro.Cascade.Rest ) )
    {
      this.liveSave();
      this.markSynced( model, true, NeuroModel.Events.RemoteSave );
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

      model.$trigger( NeuroModel.Events.RemoteSaveFailure, [model] );
    }
    else if ( status !== 0 ) 
    {          
      Neuro.debug( Neuro.Debugs.SAVE_ERROR, model, status );

      this.markSynced( model, true, NeuroModel.Events.RemoteSaveFailure );
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
        this.markSynced( model, true, NeuroModel.Events.RemoteSaveFailure );
      }

      Neuro.debug( Neuro.Debugs.SAVE_OFFLINE, model );
    }
  },

  markSynced: function(model, saveNow, eventType)
  {
    model.$status = NeuroModel.Status.Synced;

    this.clearPending( model );

    if ( saveNow )
    {
      this.insertNext( NeuroSaveNow ); 
    }

    if ( eventType )
    {
      model.$trigger( eventType, [model] );
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

    // Tranfer all saved fields into the saved object
    transfer( saving, model.$saved );
    
    // Update the model with the return data
    if ( !isEmpty( data ) )
    {
      db.putRemoteData( data, model.$key(), model );
    }    

    this.liveSave();
    this.markSynced( model, false, NeuroModel.Events.RemoteSave );
    
    if ( db.cache === Neuro.Cache.Pending )
    {
      this.insertNext( NeuroRemoveCache );
    }
    else
    {
      this.insertNext( NeuroSaveNow ); 
    }
  },

  liveSave: function()
  {
    var db = this.db;
    var model = this.model;

    if ( this.canCascade( Neuro.Cascade.Live ) && db.hasData( model.$publish ) )
    {
      // Publish saved data to everyone else
      Neuro.debug( Neuro.Debugs.SAVE_PUBLISH, model, model.$publish );

      db.live(
      {
        op:     NeuroDatabase.Live.Save,
        model:  model.$publish,
        key:    model.$key()
      });
    }
  },

  handleOnline: function()
  {
    var model = this.model;

    if ( model.$status === NeuroModel.Status.SavePending )
    { 
      model.$addOperation( NeuroSaveRemote, this.cascade );

      Neuro.debug( Neuro.Debugs.SAVE_RESUME, model );
    }
  },

  tryAgain: function()
  {
    var model = this.model;

    model.$addOperation( NeuroSaveRemote, this.cascade );
  }

});