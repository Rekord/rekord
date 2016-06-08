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
  auto:                 true,
  property:             true,
  preserve:             true,
  dynamic:              false,
  local:                null,
  cascade:              Cascade.All,
  discriminator:        'discriminator',
  discriminators:       {},
  discriminatorToModel: {}
};

extend( RelationSingle, HasOne,
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

        this.clearRelated( relation );
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

      if ( isObject( initialValue ) && relation.child )
      {
        var src = toArray( this.local );
        var dst = toArray( this.model.Database.key );

        for (var k = 0; k < src.length; k++)
        {
          initialValue[ dst[ k ] ] = model[ src[ k ] ];
        }
      }

      this.grabModel( initialValue, this.handleModel( relation ), remoteData );
    }
    else if ( this.query )
    {
      relation.query = this.executeQuery( model );
    }
  }),

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

        related.$save();

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

  clearModel: function(relation)
  {
    var related = relation.related;

    if ( related )
    {
      Rekord.debug( this.debugClearModel, this, relation );

      related.$off( Model.Events.Removed, relation.onRemoved );

      if ( this.cascade && !related.$isDeleted() )
      {
        related.$remove( this.cascade );
      }

      relation.related = null;
      relation.dirty = true;
      relation.loaded = true;

      delete relation.parent.$dependents[ related.$uid() ];
    }
  }

});
