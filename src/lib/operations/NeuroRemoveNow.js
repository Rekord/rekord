function NeuroRemoveNow(model)
{
  this.reset( model );
}

extend( new NeuroOperation( true, 'NeuroRemoveNow' ), NeuroRemoveNow,
{

  run: function(db, model)
  {
    var key = model.$key();

    model.$pendingSave = false;

    if ( db.models.has( key ) )
    {
      db.models.remove( key );
      db.trigger( 'model-removed', [model] );
      
      db.updated();

      model.$trigger('removed');
    }

    db.store.remove( key, this.success(), this.failure() );
  }

});