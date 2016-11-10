function SaveLocal(model, cascade)
{
  this.reset( model, cascade );
}

Class.extend( Operation, SaveLocal,
{

  cascading: Cascade.Local,

  interrupts: false,

  type: 'SaveLocal',

  run: function(db, model)
  {
    if ( model.$isDeleted() )
    {
      Rekord.debug( Rekord.Debugs.SAVE_LOCAL_DELETED, model );

      model.$trigger( Model.Events.LocalSaveFailure, [model] );

      this.finish();
    }
    else if ( db.cache === Cache.None || !this.canCascade() )
    {
      if ( this.canCascade( Cascade.Remote ) )
      {
        if ( this.tryNext( SaveRemote ) )
        {
          this.markSaving( db, model );
        }
      }

      model.$trigger( Model.Events.LocalSave, [model] );

      this.finish();
    }
    else
    {
      var key = model.$key();
      var local = model.$toJSON( false );

      this.markSaving( db, model );

      if ( model.$local )
      {
        transfer( local, model.$local );
      }
      else
      {
        model.$local = local;

        if ( model.$saved )
        {
          model.$local.$saved = model.$saved;
        }
      }

      model.$local.$status = model.$status;
      model.$local.$saving = model.$saving;
      model.$local.$publish = model.$publish;

      db.store.put( key, model.$local, this.success(), this.failure() );
    }
  },

  markSaving: function(db, model)
  {
    var remote = model.$toJSON( true );
    var changes = model.$getChanges( remote );

    var saving = db.fullSave ? remote : this.grabAlways( db.saveAlways, changes, remote );
    var publish = db.fullPublish ? remote : this.grabAlways( db.publishAlways, changes, remote );

    model.$status = Model.Status.SavePending;
    model.$saving = saving;
    model.$publish = publish;
  },

  grabAlways: function(always, changes, encoded)
  {
    var changesCopy = null;

    if ( always.length )
    {
      for (var i = 0; i < always.length; i++)
      {
        var prop = always[ i ];

        if ( !(prop in changes) )
        {
          if ( !changesCopy )
          {
            changesCopy = copy( changes );
          }

          changesCopy[ prop ] = encoded[ prop ];
        }
      }
    }

    return changesCopy || changes;
  },

  clearLocal: function(model)
  {
    model.$status = Model.Status.Synced;

    model.$local.$status = model.$status;

    delete model.$local.$saving;
    delete model.$local.$publish;

    this.insertNext( SaveNow );
  },

  onSuccess: function(key, encoded, previousValue)
  {
    var model = this.model;

    Rekord.debug( Rekord.Debugs.SAVE_LOCAL, model );

    if ( this.cascade )
    {
      this.tryNext( SaveRemote );
    }
    else
    {
      this.clearLocal( model );
    }

    model.$trigger( Model.Events.LocalSave, [model] );
  },

  onFailure: function(e)
  {
    var model = this.model;

    Rekord.debug( Rekord.Debugs.SAVE_LOCAL_ERROR, model, e );

    if ( this.cascade )
    {
      this.tryNext( SaveRemote );
    }
    else
    {
      this.clearLocal( model );
    }

    model.$trigger( Model.Events.LocalSaveFailure, [model] );
  }

});
