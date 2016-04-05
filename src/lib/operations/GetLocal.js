function GetLocal(model, cascade)
{
  this.reset( model, cascade );
}

extend( Operation, GetLocal,
{

  cascading: Neuro.Cascade.Local,

  interrupts: false,

  type: 'GetLocal',

  run: function(db, model)
  {
    if ( model.$isDeleted() )
    {
      model.$trigger( Model.Events.LocalGetFailure, [model] );

      this.finish();
    }
    else if ( this.canCascade() && db.cache === Neuro.Cache.All )
    {
      db.store.get( model.$key(), this.success(), this.failure() );
    }
    else
    {
      Neuro.debug( Neuro.Debugs.GET_LOCAL_SKIPPED, model );

      model.$trigger( Model.Events.LocalGet, [model] );

      this.insertNext( GetRemote );
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

    model.$trigger( Model.Events.LocalGet, [model] );

    if ( this.canCascade( Neuro.Cascade.Rest ) && !model.$isDeleted() )
    {
      this.insertNext( GetRemote );
    }
  },

  onFailure: function(e)
  {
    var model = this.model;

    Neuro.debug( Neuro.Debugs.GET_LOCAL, model, e );

    model.$trigger( Model.Events.LocalGetFailure, [model] );

    if ( this.canCascade( Neuro.Cascade.Rest ) && !model.$isDeleted()  )
    {
      this.insertNext( GetRemote );
    }
  }

});
