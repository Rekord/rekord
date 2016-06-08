function HasList()
{
}

Rekord.Relations.hasList = HasList;

HasList.Defaults =
{
  model:                undefined,
  lazy:                 false,
  store:                Store.Model,
  save:                 Save.Model,
  auto:                 false,
  property:             true,
  dynamic:              false,
  comparator:           null,
  comparatorNullsFirst: false
};

extend( RelationMultiple, HasList,
{

  type: 'hasList',

  debugSort:            Rekord.Debugs.HASLIST_SORT,

  getDefaults: function(database, field, options)
  {
    return HasList.Defaults;
  },

  onInitialized: function(database, field, options)
  {
    this.comparator = createComparator( this.comparator, this.comparatorNullsFirst );

    Rekord.debug( Rekord.Debugs.HASLIST_INIT, this );

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
        Rekord.debug( Rekord.Debugs.HASLIST_NINJA_REMOVE, relator, model, this, relation );

        relator.removeModel( relation, this, true );
      },

      onSaved: function() // this = model saved
      {
        Rekord.debug( Rekord.Debugs.HASLIST_NINJA_SAVE, relator, model, this, relation );

        relator.sort( relation );
        relator.checkSave( relation );
      }

    };

    // If the model's initial value is an array, populate the relation from it!
    if ( isArray( initialValue ) )
    {
      Rekord.debug( Rekord.Debugs.HASLIST_INITIAL, this, model, relation, initialValue );

      this.grabModels( relation, initialValue, this.handleModel( relation, remoteData ), remoteData );
    }

    // We only need to set the property once since the underlying array won't change.
    this.setProperty( relation );
  }),

  addModel: function(relation, related, remoteData)
  {
    if ( related.$isDeleted() )
    {
      return;
    }

    var model = relation.parent;
    var target = relation.related;
    var key = related.$key();
    var adding = !target.has( key );

    if ( adding )
    {
      Rekord.debug( Rekord.Debugs.HASLIST_ADD, this, relation, related );

      target.put( key, related );

      related.$on( Model.Events.Removed, relation.onRemoved );
      related.$on( Model.Events.SavedRemoteUpdate, relation.onSaved );

      this.sort( relation );

      if ( !remoteData )
      {
        this.checkSave( relation );
      }
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
      Rekord.debug( Rekord.Debugs.HASLIST_REMOVE, this, relation, related );

      target.remove( key );

      related.$off( Model.Events.Removed, relation.onRemoved );
      related.$off( Model.Events.SavedRemoteUpdate, relation.onSaved );

      this.sort( relation );
      this.checkSave( relation );
    }

    delete pending[ key ];
  },

  postClone: function(model, clone, properties)
  {
    var related = this.get( model );

    if ( related )
    {
      var relatedClones = [];

      for (var i = 0; i < related.length; i++)
      {
        relatedClones.push( related[ i ].$clone() );
      }

      clone[ this.name ] = relatedClones;
    }
  }

});
