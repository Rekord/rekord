function GetLocal(model, cascade)
{
  this.reset( model, cascade );
}

extend( Operation, GetLocal,
{

  cascading: Cascade.Local,

  interrupts: false,

  type: 'GetLocal',

  run: function(db, model)
  {
    if ( model.$isDeleted() )
    {
      model.$trigger( Model.Events.LocalGetFailure, [model] );

      this.finish();
    }
    else if ( this.canCascade() && db.cache === Cache.All )
    {
      db.store.get( model.$key(), this.success(), this.failure() );
    }
    else
    {
      Rekord.debug( Rekord.Debugs.GET_LOCAL_SKIPPED, model );

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

    Rekord.debug( Rekord.Debugs.GET_LOCAL, model, encoded );

    model.$trigger( Model.Events.LocalGet, [model] );

    if ( this.canCascade( Cascade.Rest ) && !model.$isDeleted() )
    {
      this.insertNext( GetRemote );
    }
  },

  onFailure: function(e)
  {
    var model = this.model;

    Rekord.debug( Rekord.Debugs.GET_LOCAL, model, e );

    model.$trigger( Model.Events.LocalGetFailure, [model] );

    if ( this.canCascade( Cascade.Rest ) && !model.$isDeleted()  )
    {
      this.insertNext( GetRemote );
    }
  }

});
