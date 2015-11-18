function NeuroRemoveCache(model)
{
  this.reset( model );
}

extend( new NeuroOperation( true, 'NeuroRemoveCache' ), NeuroRemoveCache,
{

  run: function(db, model)
  {
    model.$pendingSave = false;

    db.store.remove( model.$key(), this.success(), this.failure() );
  }

});