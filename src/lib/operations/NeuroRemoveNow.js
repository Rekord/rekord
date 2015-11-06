function NeuroRemoveNow(model)
{
  this.reset( model );
}

NeuroRemoveNow.prototype = new NeuroOperation( true, 'NeuroRemoveNow' );

NeuroRemoveNow.prototype.run = function(db, model)
{
  var key = model.$key();

  if ( db.models.has( key ) )
  {
    db.models.remove( key );
    db.trigger( 'model-removed', [model] );
    
    db.updated();

    model.$trigger('removed');
  }

  db.store.remove( key, this.success(), this.failure() );
};