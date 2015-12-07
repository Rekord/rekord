function NeuroGetRemote(model, cascade)
{
  this.reset( model, cascade );
}

extend( NeuroOperation, NeuroGetRemote,
{

  cascading: Neuro.Cascade.Rest,

  interrupts: false,

  type: 'NeuroGetRemote',

  run: function(db, model)
  {
    if ( model.$isDeleted() )
    {
      model.$trigger( NeuroModel.Events.RemoteGetFailure, [model] );

      this.finish();
    }
    else if ( this.canCascade() )
    {
      db.rest.get( model, this.success(), this.failure() );
    }
    else
    {
      model.$trigger( NeuroModel.Events.RemoteGet, [model] );

      this.finish();
    }
  },

  onSuccess: function(data)
  {
    var db = this.db;
    var model = this.model;

    if ( isObject( data ) )
    {
      db.putRemoteData( data, model.$key(), model, true );
    }

    Neuro.debug( Neuro.Debugs.GET_REMOTE, model, data );

    model.$trigger( NeuroModel.Events.RemoteGet, [model] );
  },

  onFailure: function(data, status)
  {
    var model = this.model;

    Neuro.debug( Neuro.Debugs.GET_REMOTE_ERROR, model, data, status );

    model.$trigger( NeuroModel.Events.RemoteGetFailure, [model] );
  }

});
