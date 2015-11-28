function NeuroRemoveCache(model, cascade)
{
  this.reset( model, cascade );
}

extend( NeuroOperation, NeuroRemoveCache,
{

  interrupts: true,

  type: 'NeuroRemoveCache',

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