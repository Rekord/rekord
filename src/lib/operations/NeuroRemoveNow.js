function NeuroRemoveNow(model)
{
  this.reset( model );
}

NeuroRemoveNow.prototype = new NeuroOperation( true );

NeuroRemoveNow.prototype.run = function(db, model)
{
  var key = model.$key();

  if ( db.models.has( key ) )
  {
    db.models.remove( key );

    model.trigger('removed');
  }

  db.store.remove( key, this.success(), this.failure() );
};