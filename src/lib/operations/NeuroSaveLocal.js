function NeuroSaveLocal(model, cascade)
{
  this.reset( model, cascade );
}

extend( NeuroOperation, NeuroSaveLocal,
{

  cascading: Neuro.Cascade.Local,

  interrupts: false,

  type: 'NeuroSaveLocal',

  run: function(db, model)
  {
    if ( model.$isDeleted() )
    {
      Neuro.debug( Neuro.Debugs.SAVE_LOCAL_DELETED, model );
    
      model.$trigger( NeuroModel.Events.LocalSaveFailure, [model] );

      this.finish();
    }
    else if ( db.cache === Neuro.Cache.None || !this.canCascade() )
    {
      if ( this.canCascade( Neuro.Cascade.Remote ) )
      {
        if ( this.tryNext( NeuroSaveRemote ) )
        {
          this.markSaving( db, model );  
        }
      }

      model.$trigger( NeuroModel.Events.LocalSave, [model] );

      this.finish();
    }
    else
    {
      var key = model.$key();
      var local = model.$toJSON( false );
      
      this.markSaving( db, model );

      if ( model.$local )
      {
        transfer( local, model.$local );
      }
      else
      {
        model.$local = local;

        if ( model.$saved )
        {
          model.$local.$saved = model.$saved;
        }
      }

      model.$local.$status = model.$status;
      model.$local.$saving = model.$saving;
      model.$local.$publish = model.$publish;

      db.store.put( key, model.$local, this.success(), this.failure() );
    }
  },

  markSaving: function(db, model)
  {
    var remote = model.$toJSON( true );
    var changes = model.$getChanges( remote );

    var saving = db.fullSave ? remote : changes;
    var publish = db.fullPublish ? remote : changes;

    model.$status = NeuroModel.Status.SavePending;
    model.$saving = saving;
    model.$publish = publish;
  },

  clearLocal: function(model)
  {
    model.$status = NeuroModel.Status.Synced;

    model.$local.$status = model.$status;
    
    delete model.$local.$saving;
    delete model.$local.$publish;

    this.insertNext( NeuroSaveNow );
  },

  onSuccess: function(key, encoded, previousValue)
  {
    var model = this.model;

    Neuro.debug( Neuro.Debugs.SAVE_LOCAL, model );

    if ( this.cascade )
    {
      this.tryNext( NeuroSaveRemote );
    }
    else
    {
      this.clearLocal( model );
    }

    model.$trigger( NeuroModel.Events.LocalSave, [model] );
  },

  onFailure: function(e)
  {
    var model = this.model;

    Neuro.debug( Neuro.Debugs.SAVE_LOCAL_ERROR, model, e );

    if ( this.cascade )
    {
      this.tryNext( NeuroSaveRemote );
    }
    else
    {
      this.clearLocal( model );
    }
    
    model.$trigger( NeuroModel.Events.LocalSaveFailure, [model] );
  }

});
