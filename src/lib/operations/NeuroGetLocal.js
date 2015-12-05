function NeuroGetLocal(model, cascade)
{
  this.reset( model, cascade );
}

extend( NeuroOperation, NeuroGetLocal,
{

  cascading: Neuro.Cascade.Local,

  interrupts: false,

  type: 'NeuroGetLocal',

  run: function(db, model)
  {
    if ( model.$isDeleted() )
    {
      model.$trigger( NeuroModel.Events.LocalGetFailure, [model] );

      this.finish();
    }
    else if ( this.canCascade() && db.cache === Neuro.Cache.All )
    {
      db.store.get( model.$key(), this.success(), this.failure() );
    }
    else
    {
      Neuro.debug( Neuro.Debugs.GET_LOCAL_SKIPPED, model );

      model.$trigger( NeuroModel.Events.LocalGet, [model] );

      this.insertNext( NeuroGetRemote ); 
      this.finish();
    }
  },

  onSuccess: function(key, encoded)
  {
    var model = this.model;

    if ( isObject( encoded ) )
    {
      model.$set( encoded );
    }

    Neuro.debug( Neuro.Debugs.GET_LOCAL, model, encoded );

    model.$trigger( NeuroModel.Events.LocalGet, [model] );

    if ( this.canCascade( Neuro.Cascade.Rest ) && !model.$isDeleted() )
    {
      this.insertNext( NeuroGetRemote );
    }
  },

  onFailure: function(e)
  {
    var model = this.model;

    Neuro.debug( Neuro.Debugs.GET_LOCAL, model, e );

    model.$trigger( NeuroModel.Events.LocalGetFailure, [model] );

    if ( this.canCascade( Neuro.Cascade.Rest ) && !model.$isDeleted()  )
    {
      this.insertNext( NeuroGetRemote );
    }
  }

});
