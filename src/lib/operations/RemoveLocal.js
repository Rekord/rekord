function RemoveLocal(model, cascade)
{
  this.reset( model, cascade );
}

extend( Operation, RemoveLocal,
{

  cascading: Rekord.Cascade.Local,

  interrupts: true,

  type: 'RemoveLocal',

  run: function(db, model)
  {
    model.$status = Model.Status.RemovePending;

    if ( db.cache === Rekord.Cache.None || !model.$local || !this.canCascade() )
    {
      Rekord.debug( Rekord.Debugs.REMOVE_LOCAL_NONE, model );

      model.$trigger( Model.Events.LocalRemove, [model] );

      this.insertNext( RemoveRemote );
      this.finish();
    }
    else if ( model.$saved )
    {
      model.$local.$status = model.$status;

      db.store.put( model.$key(), model.$local, this.success(), this.failure() );
    }
    else
    {
      Rekord.debug( Rekord.Debugs.REMOVE_LOCAL_UNSAVED, model );

      db.store.remove( model.$key(), this.success(), this.failure() );
    }
  },

  onSuccess: function(key, encoded, previousValue)
  {
    var model = this.model;

    Rekord.debug( Rekord.Debugs.REMOVE_LOCAL, model );

    model.$trigger( Model.Events.LocalRemove, [model] );

    if ( model.$saved && this.canCascade( Rekord.Cascade.Remote ) )
    {
      model.$addOperation( RemoveRemote, this.cascade );
    }
  },

  onFailure: function(e)
  {
    var model = this.model;

    Rekord.debug( Rekord.Debugs.REMOVE_LOCAL_ERROR, model, e );

    model.$trigger( Model.Events.LocalRemoveFailure, [model] );

    if ( model.$saved && this.canCascade( Rekord.Cascade.Remote ) )
    {
      model.$addOperation( RemoveRemote, this.cascade );
    }
  }

});
