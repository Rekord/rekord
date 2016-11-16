function RemoveLocal(model, cascade)
{
  this.reset( model, cascade );
}

Class.extend( Operation, RemoveLocal,
{

  cascading: Cascade.Local,

  interrupts: true,

  type: 'RemoveLocal',

  run: function(db, model)
  {
    model.$status = Model.Status.RemovePending;

    if ( db.cache === Cache.None || !model.$local || !this.canCascade() )
    {
      Rekord.debug( Rekord.Debugs.REMOVE_LOCAL_NONE, model );

      model.$trigger( Model.Events.LocalRemove, [model] );

      this.insertNext( RemoveRemote );
      this.finish();
    }
    else if ( model.$saved && this.canCascade( Cascade.Rest ) )
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

    if ( model.$saved && this.canCascade( Cascade.Remote ) )
    {
      model.$addOperation( RemoveRemote, this.cascade, this.options );
    }
  },

  onFailure: function(e)
  {
    var model = this.model;

    Rekord.debug( Rekord.Debugs.REMOVE_LOCAL_ERROR, model, e );

    model.$trigger( Model.Events.LocalRemoveFailure, [model] );

    if ( model.$saved && this.canCascade( Cascade.Remote ) )
    {
      model.$addOperation( RemoveRemote, this.cascade, this.options );
    }
  }

});
