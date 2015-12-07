function NeuroHasOne()
{
}

Neuro.Relations.hasOne = NeuroHasOne;

NeuroHasOne.Defaults = 
{
  model:                null,
  lazy:                 false,
  query:                false,
  store:                Neuro.Store.None,
  save:                 Neuro.Save.None,
  auto:                 true,
  property:             true,
  dynamic:              false,
  local:                null,
  cascade:              Neuro.Cascade.All,
  discriminator:        'discriminator',
  discriminators:       {},
  discriminatorToModel: {}
};

extend( NeuroRelationSingle, NeuroHasOne, 
{

  type: 'hasOne',

  debugInit:        Neuro.Debugs.HASONE_INIT,
  debugClearModel:  Neuro.Debugs.HASONE_CLEAR_MODEL,
  debugSetModel:    Neuro.Debugs.HASONE_SET_MODEL,
  debugLoaded:      Neuro.Debugs.HASONE_LOADED,
  debugClearKey:    Neuro.Debugs.HASONE_CLEAR_KEY,
  debugUpdateKey:   Neuro.Debugs.HASONE_UPDATE_KEY,

  getDefaults: function(database, field, options)
  {
    return NeuroHasOne.Defaults;
  },

  handleLoad: function(model, remoteData)
  {
    var initial = model[ this.name ];
    var relation = model.$relations[ this.name ] = 
    {
      parent: model,
      isRelated: this.isRelatedFactory( model ),
      related: null,
      loaded: false,
      dirty: false,
      saving: false,

      onRemoved: function() 
      {
        Neuro.debug( Neuro.Debugs.HASONE_NINJA_REMOVE, this, model, relation );

        this.clearRelated( relation );
      }
    };

    model.$on( NeuroModel.Events.PreSave, this.preSave, this );
    model.$on( NeuroModel.Events.PostRemove, this.postRemove, this );

    if ( isEmpty( initial ) )
    {
      initial = this.grabInitial( model, this.local );
      
      if ( initial )
      {
        Neuro.debug( Neuro.Debugs.HASONE_INITIAL_PULLED, this, model, initial );        
      }
    }

    if ( !isEmpty( initial ) )
    {
      Neuro.debug( Neuro.Debugs.HASONE_INITIAL, this, model, initial );

      this.grabModel( initial, this.handleModel( relation ), remoteData );      
    }
    else if ( this.query )
    {
      this.executeQuery( model );
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
        Neuro.debug( Neuro.Debugs.HASONE_PRESAVE, this, model, relation );

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
        Neuro.debug( Neuro.Debugs.HASONE_POSTREMOVE, this, model, relation );

        this.clearModel( relation );
      }
    }
  },

  clearModel: function(relation)
  {
    var related = relation.related;

    if ( related )
    {
      Neuro.debug( this.debugClearModel, this, relation );

      related.$off( NeuroModel.Events.Removed, relation.onRemoved );

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