function NeuroGetRemote(model, cascade)
{
  this.reset( model, cascade );
}

extend( new NeuroOperation( false, 'NeuroGetRemote' ), NeuroGetRemote,
{

  run: function(db, model)
  {
    db.rest.get( model, this.success(), this.failure() );
  },

  onSuccess: function(data)
  {
    var model = this.model;

    if ( isObject( data ) )
    {
      model.$set( data );
    }

    Neuro.debug( Neuro.Debugs.GET_REMOTE, model, data );
  },

  onFailure: function(data, status)
  {
    var model = this.model;

    Neuro.debug( Neuro.Debugs.GET_REMOTE_ERROR, model, data, status )
  }

});
