function GetRemote(model, cascade)
{
  this.reset( model, cascade );
}

extend( Operation, GetRemote,
{

  cascading: Cascade.Rest,

  interrupts: false,

  type: 'GetRemote',

  run: function(db, model)
  {
    if ( model.$isDeleted() )
    {
      model.$trigger( Model.Events.RemoteGetFailure, [model] );

      this.finish();
    }
    else if ( this.canCascade() )
    {
      batchExecute(function()
      {
        db.rest.get( model, this.success(), this.failure() );

      }, this );
    }
    else
    {
      model.$trigger( Model.Events.RemoteGet, [model] );

      this.finish();
    }
  },

  onSuccess: function(response)
  {
    var db = this.db;
    var data = db.resolveModel( response );
    var model = this.model;

    if ( isObject( data ) )
    {
      db.putRemoteData( data, model.$key(), model, true );
    }

    Rekord.debug( Rekord.Debugs.GET_REMOTE, model, data );

    model.$trigger( Model.Events.RemoteGet, [model] );
  },

  onFailure: function(response, status)
  {
    var db = this.db;
    var model = this.model;

    Rekord.debug( Rekord.Debugs.GET_REMOTE_ERROR, model, response, status );

    if ( status === 410 || status === 404 )
    {
      this.insertNext( RemoveNow );

      db.destroyModel( model );

      model.$trigger( Model.Events.RemoteGetFailure, [model, response] );
    }
    else if ( status === 0 )
    {
      model.$trigger( Model.Events.RemoteGetOffline, [model, response] );
    }
    else
    {
      model.$trigger( Model.Events.RemoteGetFailure, [model, response] );
    }
  }

});
