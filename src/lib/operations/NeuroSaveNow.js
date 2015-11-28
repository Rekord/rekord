function NeuroSaveNow(model, cascade)
{
  this.reset( model, cascade );
}

extend( NeuroOperation, NeuroSaveNow,
{

  interrupts: false,

  type: 'NeuroSaveNow',

  run: function(db, model)
  {
    var key = model.$key();
    var local = model.$local;

    if ( db.cache === Neuro.Cache.All && key && local )
    {
      db.store.put( key, local, this.success(), this.failure() );
    }
    else
    {
      this.finish();
    }
  }

});