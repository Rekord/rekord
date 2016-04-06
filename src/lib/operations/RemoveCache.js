function RemoveCache(model, cascade)
{
  this.reset( model, cascade );
}

extend( Operation, RemoveCache,
{

  cascading: Rekord.Cascade.None,

  interrupts: true,

  type: 'RemoveCache',

  run: function(db, model)
  {
    if ( db.cache == Rekord.Cache.None )
    {
      this.finish();
    }
    else
    {
      db.store.remove( model.$key(), this.success(), this.failure() );
    }
  }

});
