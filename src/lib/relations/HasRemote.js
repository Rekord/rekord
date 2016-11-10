function HasRemote()
{
}

Rekord.Relations.hasRemote = HasRemote;

HasRemote.Defaults =
{
  model:                undefined,
  lazy:                 false,
  query:                false,
  store:                Store.None,
  save:                 Save.None,
  auto:                 false,
  property:             true,
  dynamic:              false,
  comparator:           null,
  comparatorNullsFirst: false,
  where:                false,
  autoRefresh:          false // Model.Events.RemoteGets
};

Class.extend( RelationMultiple, HasRemote,
{

  type: 'hasRemote',

  debugSort:            Rekord.Debugs.HASREMOTE_SORT,
  debugQuery:           Rekord.Debugs.HASREMOTE_QUERY,
  debugQueryResults:    Rekord.Debugs.HASREMOTE_QUERY_RESULTS,

  getDefaults: function(database, field, options)
  {
    return HasRemote.Defaults;
  },

  onInitialized: function(database, field, options)
  {
    this.comparator = createComparator( this.comparator, this.comparatorNullsFirst );

    Rekord.debug( Rekord.Debugs.HASREMOTE_INIT, this );

    this.finishInitialization();
  },

  load: Gate(function(model, initialValue, remoteData)
  {
    var relator = this;
    var relation = model.$relations[ this.name ] =
    {
      parent: model,
      pending: {},
      related: this.createRelationCollection( model ),
      delaySorting: false,
      delaySaving: false,

      onRemoved: function() // this = model removed
      {
        Rekord.debug( Rekord.Debugs.HASREMOTE_NINJA_REMOVE, relator, model, this, relation );

        relator.removeModel( relation, this, true );
      },

      onSaved: function() // this = model saved
      {
        Rekord.debug( Rekord.Debugs.HASREMOTE_NINJA_SAVE, relator, model, this, relation );

        relator.sort( relation );
        relator.checkSave( relation );
      },

      onChange: function()
      {
        if ( relation.saving )
        {
          return;
        }

        if ( relator.where && !relator.where( this ) )
        {
          relator.removeModel( relation, this, true );
        }
      }

    };

    // Populate the model's key if it's missing
    model.$key();

    // If auto refresh was specified, execute the query on refresh
    if ( this.autoRefresh )
    {
      model.$on( this.autoRefresh, this.onRefresh( relation ), this );
    }

    // Execute query!
    relation.query = this.executeQuery( model );

    // We only need to set the property once since the underlying array won't change.
    this.setProperty( relation );
  }),

  onRefresh: function(relation)
  {
    return function handleRefresh()
    {
      relation.query = this.executeQuery( relation.parent );
    };
  },

  addModel: function(relation, related, remoteData)
  {
    if ( related.$isDeleted() || (this.where && !this.where( related ) ) )
    {
      return;
    }

    var model = relation.parent;
    var target = relation.related;
    var key = related.$key();
    var adding = !target.has( key );

    if ( adding )
    {
      Rekord.debug( Rekord.Debugs.HASMANY_ADD, this, relation, related );

      target.put( key, related );

      related.$on( Model.Events.Removed, relation.onRemoved );
      related.$on( Model.Events.SavedRemoteUpdate, relation.onSaved );

      if ( this.where )
      {
        related.$on( Model.Events.Change, relation.onChange );
      }

      this.sort( relation );
      this.checkSave( relation, remoteData );
    }

    return adding;
  },

  removeModel: function(relation, related, remoteData)
  {
    if ( !this.canRemoveRelated( related, remoteData ) )
    {
      return;
    }

    var model = relation.parent;
    var target = relation.related;
    var pending = relation.pending;
    var key = related.$key();

    if ( target.has( key ) )
    {
      Rekord.debug( Rekord.Debugs.HASMANY_REMOVE, this, relation, related );

      target.remove( key );

      related.$off( Model.Events.Removed, relation.onRemoved );
      related.$off( Model.Events.SavedRemoteUpdate, relation.onSaved );
      related.$off( Model.Events.Change, relation.onChange );

      this.sort( relation );
      this.checkSave( relation, remoteData );
    }

    delete pending[ key ];
  }

});
