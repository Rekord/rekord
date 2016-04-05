function RemoveCache(model, cascade)
{
  this.reset( model, cascade );
}

extend( Operation, RemoveCache,
{

  cascading: Neuro.Cascade.None,

  interrupts: true,

  type: 'RemoveCache',

  run: function(db, model)
  {
    if ( db.cache == Neuro.Cache.None )
    {
      this.finish();
    }
    else
    {
      db.store.remove( model.$key(), this.success(), this.failure() );
    }
  }

});
