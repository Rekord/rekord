function NeuroGetLocal(model, cascade)
{
  this.reset( model, cascade );
}

extend( new NeuroOperation( false, 'NeuroGetLocal' ), NeuroGetLocal,
{

  run: function(db, model)
  {
    if ( db.cache === Neuro.Cache.All && this.canCascade( Neuro.Cascade.Local ) )
    {
      db.store.get( model.$key(), this.success(), this.failure() );
    }
    else if ( this.canCascade( Neuro.Cascade.Rest ) )
    {
      Neuro.debug( Neuro.Debugs.GET_LOCAL_SKIPPED, model );

      this.insertNext( NeuroGetRemote, this.cascade ); 
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

    if ( this.canCascade( Neuro.Cascade.Rest ) )
    {
      this.insertNext( NeuroGetRemote, this.cascade );
    }
  },

  onFailure: function(e)
  {
    var model = this.model;

    Neuro.debug( Neuro.Debugs.GET_LOCAL, model, e );

    if ( this.canCascade( Neuro.Cascade.Rest ) )
    {
      this.insertNext( NeuroGetRemote, this.cascade );
    }
  }

});
