function NeuroBelongsTo()
{
}

Neuro.Relations.belongsTo = NeuroBelongsTo;

NeuroBelongsTo.Defaults = 
{
  model:                null,
  store:                Neuro.Store.None,
  save:                 Neuro.Save.None,
  auto:                 true,
  property:             true,
  dynamic:              false,
  local:                null,
  cascade:              Neuro.Cascade.Local,
  discriminator:        'discriminator',
  discriminators:       {},
  discriminatorToModel: {}
};

extend( NeuroRelation, NeuroBelongsTo, 
{

  type: 'belongsTo',

  getDefaults: function(database, field, options)
  {
    return NeuroBelongsTo.Defaults;
  },

  onInitialized: function(database, field, options)
  {
    if ( !this.discriminated )
    {
      var relatedDatabase = this.model.Database;

      this.local = this.local || ( relatedDatabase.name + '_' + relatedDatabase.key );
    }

    Neuro.debug( Neuro.Debugs.BELONGSTO_INIT, this );

    this.finishInitialization();
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

      onRemoved: function() 
      {
        Neuro.debug( Neuro.Debugs.BELONGSTO_NINJA_REMOVE, this, model, relation );

        model.$remove( this.cascade );
        this.clearRelated( relation );
      },
      
      onSaved: function()
      {
        Neuro.debug( Neuro.Debugs.BELONGSTO_NINJA_SAVE, this, model, relation );

        if ( !relation.isRelated( relation.related ) )
        {
          model.$remove( this.cascade );
          this.clearRelated( relation );
        }
      }
    };

    model.$on( NeuroModel.Events.KeyUpdate, this.onKeyUpdate, this );
    model.$on( NeuroModel.Events.PostRemove, this.postRemove, this );

    if ( isEmpty( initial ) )
    {
      initial = this.grabInitial( model, this.local );
      
      if ( initial )
      {
        Neuro.debug( Neuro.Debugs.BELONGSTO_INITIAL_PULLED, this, model, initial );        
      }
    }

    if ( !isEmpty( initial ) )
    {
      Neuro.debug( Neuro.Debugs.BELONGSTO_INITIAL, this, model, initial );

      this.grabModel( initial, this.handleModel( relation, remoteData ), remoteData );
    }
  },

  // same as HasOne
  set: function(model, input, remoteData)
  {
    if ( isEmpty( input ) )
    {
      this.unrelate( model );
    }
    else
    {
      var relation = model.$relations[ this.name ];
      var related = this.parseModel( input, remoteData );

      if ( related && !relation.isRelated( related ) )
      {
        this.clearModel( relation );
        this.setRelated( relation, related, remoteData );
      }
    }
  },

  // same as HasOne
  relate: function(model, input)
  {
    var relation = model.$relations[ this.name ];
    var related = this.parseModel( input );
    
    if ( related )
    {
      if ( relation.related !== related )
      {
        this.clearModel( relation );
        this.setRelated( relation, related );
      }
    }
  },

  // same as HasOne
  unrelate: function(model, input)
  {
    var relation = model.$relations[ this.name ];
    var related = this.parseModel( input );

    if ( !related || relation.related === related )
    {
      this.clearRelated( relation );
    }
  },

  // same as HasOne
  isRelated: function(model, input)
  {
    var relation = model.$relations[ this.name ];
    var related = this.parseModel( input );

    return related === relation.related;
  },

  // same as HasOne
  setRelated: function(relation, related, remoteData)
  {
    if ( !related.$isDeleted() )
    {
      this.setModel( relation, related );
      this.updateForeignKey( relation.parent, related, remoteData );
      this.setProperty( relation );
    }
  },

  clearRelated: function(relation)
  {
    this.clearModel( relation );
    this.clearForeignKey( relation.parent );
    this.setProperty( relation );
  },

  postRemove: function(model)
  {
    var relation = model.$relations[ this.name ];

    if ( relation )
    {
      Neuro.debug( Neuro.Debugs.BELONGSTO_POSTREMOVE, this, model, relation );

      this.clearModel( relation );
      this.setProperty( relation );
    }
  },

  clearModel: function(relation)
  {
    var related = relation.related;

    if ( related )
    {
      Neuro.debug( Neuro.Debugs.BELONGSTO_CLEAR_MODEL, this, relation );

      related.$off( NeuroModel.Events.Saved, relation.onSaved );
      related.$off( NeuroModel.Events.Removed, relation.onRemoved );

      relation.related = null;
      relation.loaded = true;
    }
  },

  setModel: function(relation, related)
  {
    related.$on( NeuroModel.Events.Saved, relation.onSaved, this );
    related.$on( NeuroModel.Events.Removed, relation.onRemoved, this );

    relation.related = related;
    relation.loaded = true;

    Neuro.debug( Neuro.Debugs.BELONGSTO_SET_MODEL, this, relation );
  },

  // same as HasOne
  handleModel: function(relation, remoteData)
  {
    return function(related) 
    {
      Neuro.debug( Neuro.Debugs.BELONGSTO_LOADED, this, relation.parent, relation, related );

      if ( relation.loaded === false ) 
      {
        if ( related && !related.$isDeleted() ) 
        {
          this.setModel( relation, related, remoteData );
          this.updateForeignKey( relation.parent, related, remoteData );
        }
        else
        {
          this.clearForeignKey( relation.parent, remoteData );
        }

        relation.loaded = true;

        this.setProperty( relation );
      }
    };
  },

  // same as HasOne
  isRelatedFactory: function(model)
  {
    var local = this.local;

    return function hasForeignKey(related)
    {
      return propsMatch( model, local, related, related.$db.key );
    };
  },

  // same as HasOne
  clearForeignKey: function(model, remoteData)
  {
    var local = this.local;

    Neuro.debug( Neuro.Debugs.BELONGSTO_CLEAR_KEY, this, model, local );

    this.clearFields( model, local, remoteData );
  },

  // same as HasOne
  updateForeignKey: function(model, related, remoteData)
  {
    var local = this.local;
    var foreign = related.$db.key;

    Neuro.debug( Neuro.Debugs.BELONGSTO_UPDATE_KEY, this, model, local, related, foreign );

    this.updateFields( model, local, related, foreign, remoteData );
  },

  onKeyUpdate: function(model, related, modelFields, relatedFields)
  {
    if ( this.local === modelFields )
    {
      var relation = model.$relations[ this.name ];

      if ( relation && related !== relation.related )
      {
        this.clearModel( relation );
        this.setModel( relation, related );
        this.setProperty( relation );
      }        
    }
  }

});