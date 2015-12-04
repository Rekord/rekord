function NeuroRemoveLocal(model, cascade)
{
  this.reset( model, cascade );
}

extend( NeuroOperation, NeuroRemoveLocal, 
{

  interrupts: true,

  type: 'NeuroRemoveLocal',

  run: function(db, model)
  {
    model.$status = NeuroModel.Status.RemovePending;

    if ( db.cache === Neuro.Cache.None || !model.$local )
    {
      Neuro.debug( Neuro.Debugs.REMOVE_LOCAL_NONE, model );

      model.$trigger( NeuroModel.Events.LocalRemove, [model] );

      this.insertNext( NeuroRemoveRemote );
      this.finish();
    }
    else if ( model.$saved )
    {
      model.$local.$status = model.$status;

      db.store.put( model.$key(), model.$local, this.success(), this.failure() );
    }
    else
    {
      Neuro.debug( Neuro.Debugs.REMOVE_LOCAL_UNSAVED, model );

      db.store.remove( model.$key(), this.success(), this.failure() );
    }
  },

  onSuccess: function(key, encoded, previousValue)
  {
    var model = this.model;

    Neuro.debug( Neuro.Debugs.REMOVE_LOCAL, model );

    model.$trigger( NeuroModel.Events.LocalRemove, [model] );

    if ( model.$saved && this.cascade )
    {
      model.$addOperation( NeuroRemoveRemote );
    }
  },

  onFailure: function(e)
  {
    var model = this.model;

    Neuro.debug( Neuro.Debugs.REMOVE_LOCAL_ERROR, model, e );

    model.$trigger( NeuroModel.Events.LocalRemoveFailure, [model] );

    if ( model.$saved && this.cascade )
    {
      model.$addOperation( NeuroRemoveRemote );
    }
  }

});