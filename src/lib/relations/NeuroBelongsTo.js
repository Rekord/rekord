function NeuroBelongsTo()
{
  this.type = 'belongsTo';
}

Neuro.Relations.belongsTo = NeuroBelongsTo;

NeuroBelongsTo.Defaults = 
{
  model:      undefined,
  store:      Neuro.Store.None,
  save:       Neuro.Save.None,
  auto:       true,
  property:   true,
  local:      null,
  cascade:    true
};

extend( new NeuroRelation(), NeuroBelongsTo, 
{

  getDefaults: function(database, field, options)
  {
    return NeuroBelongsTo.Defaults;
  },

  onInitialized: function(database, field, options)
  {
    var relatedDatabase = this.model.Database;

    this.local = this.local || ( relatedDatabase.name + '_' + relatedDatabase.key );

    Neuro.debug( Neuro.Debugs.BELONGSTO_INIT, this );

    this.finishInitialization();
  },

  handleLoad: function(model, remoteData)
  {
    var that = this;
    var isRelated = this.isRelatedFactory( model );
    var relatedDatabase = this.model.Database;
    var initial = model[ this.name ];

    var relation = model.$relations[ this.name ] = 
    {
      parent: model,
      initial: initial,
      isRelated: isRelated,
      model: null,
      loaded: false,

      onRemoved: function() 
      {
        Neuro.debug( Neuro.Debugs.BELONGSTO_NINJA_REMOVE, that, model, relation );

        if ( this.cascade )
        {
          model.$remove( this.cascade );
        }
        else
        {
          this.clearRelated( relation );
        }
      },
      onSaved: function() 
      {
        Neuro.debug( Neuro.Debugs.BELONGSTO_NINJA_SAVE, that, model, relation );

        if ( !isRelated( relation.model ) )
        {
          if ( this.cascade )
          {
            model.$remove( this.cascade ); 
          }
          else
          {
            this.clearRelated( relation );
          }
        }
      }
    };

    model.$on( NeuroModel.Events.KeyUpdate, this.onKeyUpdate, this );
    model.$on( NeuroModel.Events.PostRemove, this.postRemove, this );

    if ( isEmpty( initial ) && relatedDatabase.hasFields( model, this.local, isValue ) )
    {
      initial = pull( model, this.local );

      Neuro.debug( Neuro.Debugs.BELONGSTO_INITIAL_PULLED, this, model, initial );
    }

    if ( !isEmpty( initial ) )
    {
      Neuro.debug( Neuro.Debugs.BELONGSTO_INITIAL, this, model, initial );

      relatedDatabase.grabModel( initial, this.handleModel( relation, remoteData ), this, remoteData );
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
      var relatedDatabase = this.model.Database;
      var related = relatedDatabase.parseModel( input, remoteData );
      var relation = model.$relations[ this.name ];

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
    var relatedDatabase = this.model.Database;
    var related = relatedDatabase.parseModel( input );
    var relation = model.$relations[ this.name ];
    
    if ( related )
    {
      if ( relation.model !== related )
      {
        this.clearModel( relation );
        this.setRelated( relation, related );
      }
    }
  },

  // same as HasOne
  unrelate: function(model, input)
  {
    var relatedDatabase = this.model.Database;
    var relation = model.$relations[ this.name ];
    var related = relatedDatabase.parseModel( input );

    if ( !related || relation.model === related )
    {
      this.clearRelated( relation );
    }
  },

  // same as HasOne
  isRelated: function(model, input)
  {
    var relatedDatabase = this.model.Database;
    var relation = model.$relations[ this.name ];
    var related = relatedDatabase.parseModel( input );

    return related === relation.model;
  },

  // same as HasOne
  setRelated: function(relation, related, remoteData)
  {
    this.setModel( relation, related );
    this.updateForeignKey( relation.parent, related, remoteData );
    this.setProperty( relation );
  },

  clearRelated: function(relation)
  {
    this.clearModel( relation );
    this.clearForeignKey( relation.parent );
    this.setProperty( relation );
  },

  // same as HasOne
  get: function(model)
  {
    var relation = model.$relations[ this.name ];
    
    return relation.model;
  },

  // same as HasOne
  encode: function(model, out, forSaving)
  {
    var relation = model.$relations[ this.name ];
    var mode = forSaving ? this.save : this.store;

    if ( relation && mode )
    {
      out[ this.name ] = this.getStored( relation.model, mode );
    }
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
    var related = relation.model;

    if ( related )
    {
      Neuro.debug( Neuro.Debugs.BELONGSTO_CLEAR_MODEL, this, relation );

      related.$off( NeuroModel.Events.Saved, relation.onSaved );
      related.$off( NeuroModel.Events.Removed, relation.onRemoved );

      relation.model = null;
      relation.loaded = true;
    }
  },

  setModel: function(relation, related)
  {
    related.$on( NeuroModel.Events.Saved, relation.onSaved, this );
    related.$on( NeuroModel.Events.Removed, relation.onRemoved, this );

    relation.model = related;
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
        if ( related ) 
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
    var relatedDatabase = this.model.Database;
    var local = this.local;
    var foreign = relatedDatabase.key;

    return function hasForeignKey(related)
    {
      return propsMatch( model, local, related, foreign );
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
    var relatedDatabase = this.model.Database;
    var local = this.local;
    var foreign = relatedDatabase.key;

    Neuro.debug( Neuro.Debugs.BELONGSTO_UPDATE_KEY, this, model, local, related, foreign );

    this.updateFields( model, local, related, foreign, remoteData );
  },

  // same as HasOne
  setProperty: function(relation)
  {
    if ( this.property )
    {
      var model = relation.parent;
      var related = relation.model;

      if ( model[ this.name ] !== related )
      {
        model[ this.name ] = related;
        
        model.$trigger( NeuroModel.Events.RelationUpdate, [this, relation] );
      }
    }
  },

  onKeyUpdate: function(model, related, modelFields, relatedFields)
  {
    if ( this.local === modelFields )
    {
      var relation = model.$relations[ this.name ];

      if ( relation && related !== relation.model )
      {
        this.clearModel( relation );
        this.setModel( relation, related );
        this.setProperty( relation );
      }        
    }
  }

});