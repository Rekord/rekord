function NeuroRemoveNow(model, cascade)
{
  this.reset( model, cascade );
}

extend( new NeuroOperation( true, 'NeuroRemoveNow' ), NeuroRemoveNow,
{

  run: function(db, model)
  {
    var key = model.$key();

    model.$deleted = true;
    model.$pendingSave = false;

    if ( db.models.has( key ) )
    {
      db.models.remove( key );
      db.trigger( NeuroDatabase.Events.ModelRemoved, [model] );
      
      db.updated();

      model.$trigger( NeuroModel.Events.Removed );
    }

    if ( db.cache )
    {
      db.store.remove( key, this.success(), this.failure() );
    }
    else
    {
      this.finish();
    }
  }

});