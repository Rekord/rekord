function BelongsTo()
{
}

Rekord.Relations.belongsTo = BelongsTo;

BelongsTo.Defaults =
{
  model:                null,
  lazy:                 false,
  query:                false,
  store:                Store.None,
  save:                 Save.None,
  auto:                 true,
  property:             true,
  preserve:             true,
  clearKey:             true,
  dynamic:              false,
  local:                null,
  cascade:              Cascade.Local,
  discriminator:        'discriminator',
  discriminators:       {},
  discriminatorToModel: {}
};

extend( RelationSingle, BelongsTo,
{

  type: 'belongsTo',

  debugInit:          Rekord.Debugs.BELONGSTO_INIT,
  debugClearModel:    Rekord.Debugs.BELONGSTO_CLEAR_MODEL,
  debugSetModel:      Rekord.Debugs.BELONGSTO_SET_MODEL,
  debugLoaded:        Rekord.Debugs.BELONGSTO_LOADED,
  debugClearKey:      Rekord.Debugs.BELONGSTO_CLEAR_KEY,
  debugUpdateKey:     Rekord.Debugs.BELONGSTO_UPDATE_KEY,
  debugQuery:         Rekord.Debugs.BELONGSTO_QUERY,
  debugQueryResults:  Rekord.Debugs.BELONGSTO_QUERY_RESULTS,

  getDefaults: function(database, field, options)
  {
    return BelongsTo.Defaults;
  },

  load: Gate(function(model, initialValue, remoteData)
  {
    var relation = model.$relations[ this.name ] =
    {
      parent: model,
      isRelated: this.isRelatedFactory( model ),
      related: null,
      loaded: false,

      onRemoved: function()
      {
        Rekord.debug( Rekord.Debugs.BELONGSTO_NINJA_REMOVE, this, model, relation );

        model.$remove( this.cascade );
        this.clearRelated( relation, false, true );
      },

      onSaved: function()
      {
        Rekord.debug( Rekord.Debugs.BELONGSTO_NINJA_SAVE, this, model, relation );

        if ( !relation.isRelated( relation.related ) )
        {
          this.clearRelated( relation, false, true );
        }
      }
    };

    model.$on( Model.Events.PostRemove, this.postRemove, this );
    model.$on( Model.Events.KeyUpdate, this.onKeyUpdate, this );

    if ( isEmpty( initialValue ) )
    {
      initialValue = this.grabInitial( model, this.local );

      if ( initialValue )
      {
        Rekord.debug( Rekord.Debugs.BELONGSTO_INITIAL_PULLED, this, model, initialValue );
      }
    }

    if ( !isEmpty( initialValue ) )
    {
      Rekord.debug( Rekord.Debugs.BELONGSTO_INITIAL, this, model, initialValue );

      this.grabModel( initialValue, this.handleModel( relation, remoteData ), remoteData );
    }
    else if ( this.query )
    {
      relation.query = this.executeQuery( model );
    }
  }),

  postRemove: function(model)
  {
    var relation = model.$relations[ this.name ];

    if ( relation )
    {
      Rekord.debug( Rekord.Debugs.BELONGSTO_POSTREMOVE, this, model, relation );

      this.clearModel( relation );
      this.setProperty( relation );
    }
  },

  onKeyUpdate: function(model, related, modelFields, relatedFields)
  {
    if ( this.local === modelFields )
    {
      var relation = model.$relations[ this.name ];

      if ( relation && related !== relation.related )
      {
        this.clearModel( relation, false, true );
        this.setModel( relation, related );
        this.setProperty( relation );
      }
    }
  }

});
