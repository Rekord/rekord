function NeuroSaveNow(model, cascade)
{
  this.reset( model, cascade );
}

extend( NeuroOperation, NeuroSaveNow,
{

  cascading: Neuro.Cascade.Local,

  interrupts: false,

  type: 'NeuroSaveNow',

  run: function(db, model)
  {
    var key = model.$key();
    var local = model.$local;

    if ( db.cache === Neuro.Cache.All && key && local && this.canCascade() )
    {
      db.store.put( key, local, this.success(), this.failure() );
    }
    else
    {
      this.finish();
    }
  }

});