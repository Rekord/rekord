function HasOne()
{
}

Rekord.Relations.hasOne = HasOne;

HasOne.Defaults =
{
  model:                null,
  lazy:                 false,
  query:                false,
  store:                Store.None,
  save:                 Save.None,
  saveCascade:          Cascade.All,
  saveOptions:          null,
  auto:                 true,
  autoCascade:          Cascade.All,
  autoOptions:          null,
  property:             true,
  preserve:             true,
  clearKey:             true,
  dynamic:              false,
  local:                null,
  cascade:              Cascade.All,
  cascadeRemoveOptions: null,
  discriminator:        'discriminator',
  discriminators:       {},
  discriminatorToModel: {}
};

Class.extend( RelationSingle, HasOne,
{

  type: 'hasOne',

  debugInit:          Rekord.Debugs.HASONE_INIT,
  debugClearModel:    Rekord.Debugs.HASONE_CLEAR_MODEL,
  debugSetModel:      Rekord.Debugs.HASONE_SET_MODEL,
  debugLoaded:        Rekord.Debugs.HASONE_LOADED,
  debugClearKey:      Rekord.Debugs.HASONE_CLEAR_KEY,
  debugUpdateKey:     Rekord.Debugs.HASONE_UPDATE_KEY,
  debugQuery:         Rekord.Debugs.HASONE_QUERY,
  debugQueryResults:  Rekord.Debugs.HASONE_QUERY_RESULTS,

  getDefaults: function(database, field, options)
  {
    return HasOne.Defaults;
  },

  load: Gate(function(model, initialValue, remoteData)
  {
    var relation = model.$relations[ this.name ] =
    {
      parent: model,
      isRelated: this.isRelatedFactory( model ),
      related: null,
      loaded: false,
      dirty: false,
      saving: false,
      child: equals( this.local, model.$db.key ),

      onRemoved: function()
      {
        Rekord.debug( Rekord.Debugs.HASONE_NINJA_REMOVE, this, model, relation );

        this.clearRelated( relation, false, true );
      }
    };

    model.$on( Model.Events.PreSave, this.preSave, this );
    model.$on( Model.Events.PostRemove, this.postRemove, this );

    if ( isEmpty( initialValue ) )
    {
      initialValue = this.grabInitial( model, this.local );

      if ( initialValue )
      {
        Rekord.debug( Rekord.Debugs.HASONE_INITIAL_PULLED, this, model, initialValue );
      }
    }

    if ( !isEmpty( initialValue ) )
    {
      Rekord.debug( Rekord.Debugs.HASONE_INITIAL, this, model, initialValue );

      this.populateInitial( initialValue, relation, model );
      this.grabModel( initialValue, this.handleModel( relation, remoteData ), remoteData );
    }
    else if ( this.query )
    {
      relation.query = this.executeQuery( model );
    }
  }),

  populateInitial: function(initialValue, relation, model)
  {
    if ( isObject( initialValue ) && relation.child )
    {
      var src = toArray( this.local );
      var dst = toArray( this.model.Database.key );

      for (var k = 0; k < src.length; k++)
      {
        initialValue[ dst[ k ] ] = model[ src[ k ] ];
      }
    }
  },

  sync: function(model, removeUnrelated)
  {
    var relation = model.$relations[ this.name ];
    var relatedValue = this.grabInitial( model, this.local );
    var remoteData = true;
    var ignoreLoaded = true;
    var dontClear = true;

    if ( relation )
    {
      if ( !isEmpty( relatedValue ) )
      {
        this.populateInitial( relatedValue, relation, model );
        this.grabModel( relatedValue, this.handleModel( relation, remoteData, ignoreLoaded ), remoteData );
      }
      else if ( removeUnrelated )
      {
        this.clearRelated( relation, remoteData, dontClear );
      }
    }
  },

  isDependent: function(relation, related)
  {
    return !relation.child;
  },

  preClone: function(model, clone, properties)
  {
    var related = this.get( model );

    if ( related )
    {
      var relatedClone = related.$clone( properties );

      updateFieldsReturnChanges( clone, this.local, relatedClone, relatedClone.$db.key );

      clone[ this.name ] = relatedClone;
    }
  },

  preSave: function(model)
  {
    var relation = model.$relations[ this.name ];

    if ( relation && relation.related )
    {
      var related = relation.related;

      if ( relation.dirty || related.$hasChanges() )
      {
        Rekord.debug( Rekord.Debugs.HASONE_PRESAVE, this, model, relation );

        relation.saving = true;

        related.$save( this.saveCascade, this.saveOptions );

        relation.saving = false;
        relation.dirty = false;
      }
    }
  },

  postRemove: function(model)
  {
    var relation = model.$relations[ this.name ];

    if ( relation )
    {
      if ( this.cascade )
      {
        Rekord.debug( Rekord.Debugs.HASONE_POSTREMOVE, this, model, relation );

        this.clearModel( relation );
      }
    }
  },

  clearModel: function(relation, remoteData)
  {
    var related = relation.related;

    if ( related )
    {
      Rekord.debug( this.debugClearModel, this, relation );

      related.$off( Model.Events.Removed, relation.onRemoved );

      if ( this.cascade && !related.$isDeleted() )
      {
        related.$remove( this.cascade, this.cascadeRemoveOptions );
      }

      relation.related = null;
      relation.dirty = true;
      relation.loaded = true;

      relation.parent.$dependents.remove( related );

      if ( this.clearKey )
      {
        this.clearForeignKey( relation.parent, remoteData );
      }
    }
  }

});
