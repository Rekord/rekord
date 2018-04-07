function HasReference()
{
}

Rekord.Relations.hasReference = HasReference;

HasReference.Defaults =
{
  model:                null,
  lazy:                 false,
  query:                false,
  store:                Store.None,
  save:                 Save.None,
  property:             true,
  dynamic:              false
};

Class.extend( RelationSingle, HasReference,
{

  type: 'hasReference',

  debugInit:          Rekord.Debugs.HASREFERENCE_INIT,
  debugClearModel:    Rekord.Debugs.HASREFERENCE_CLEAR_MODEL,
  debugSetModel:      Rekord.Debugs.HASREFERENCE_SET_MODEL,
  debugLoaded:        Rekord.Debugs.HASREFERENCE_LOADED,
  debugQuery:         Rekord.Debugs.HASREFERENCE_QUERY,
  debugQueryResults:  Rekord.Debugs.HASREFERENCE_QUERY_RESULTS,

  getDefaults: function(database, field, options)
  {
    return HasReference.Defaults;
  },

  load: Gate(function(model, initialValue, remoteData)
  {
    var relation = model.$relations[ this.name ] =
    {
      parent: model,
      related: null,
      loaded: false,
      dirty: false,

      onRemoved: function()
      {
        Rekord.debug( Rekord.Debugs.HASREFERENCE_NINJA_REMOVE, this, model, relation );

        this.clearRelated( relation, false, true );
      }
    };

    this.setInitial( model, initialValue, remoteData );
  }),

  setInitial: function(model, initialValue, remoteData)
  {
    var relation = model.$relations[ this.name ];

    if ( !isEmpty( initialValue ) )
    {
      Rekord.debug( Rekord.Debugs.HASREFERENCE_INITIAL, this, model, initialValue );

      this.grabModel( initialValue, this.handleModel( relation ), remoteData, relation );
    }
    else if ( this.query )
    {
      relation.query = this.executeQuery( model );
    }
  },

  preClone: function(model, clone, properties)
  {
    var related = this.get( model );

    if ( related )
    {
      clone[ this.name ] = related.$clone( properties );
    }
  },

  isDependent: function(relation, related)
  {
    return false;
  },

  updateForeignKey: function()
  {
    // nothing
  },

  clearForeignKey: function()
  {
    // nothing
  },

});
