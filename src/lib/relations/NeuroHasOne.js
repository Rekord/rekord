function NeuroHasOne()
{
}

Neuro.Relations.hasOne = NeuroHasOne;

NeuroHasOne.Defaults = 
{
  model:      undefined,
  store:      Neuro.Store.None,
  save:       Neuro.Save.None,
  auto:       true,
  property:   true,
  dynamic:    false,
  local:      null,
  cascade:    true
};

extend( NeuroRelation, NeuroHasOne, 
{

  type: 'hasOne',

  getDefaults: function(database, field, options)
  {
    return NeuroHasOne.Defaults;
  },

  onInitialized: function(database, field, options)
  {
    var relatedDatabase = this.model.Database;

    this.local = this.local || ( relatedDatabase.name + '_' + relatedDatabase.key );

    Neuro.debug( Neuro.Debugs.HASONE_INIT, this );
    
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
      related: null,
      loaded: false,
      dirty: false,
      saving: false,

      onRemoved: function() 
      {
        Neuro.debug( Neuro.Debugs.HASONE_NINJA_REMOVE, that, model, relation );

        this.clearRelated( relation );
      },
      onSaved: function() 
      {
        if ( relation.saving )
        {
          return;
        }

        Neuro.debug( Neuro.Debugs.HASONE_NINJA_SAVE, that, model, relation );

        if ( !isRelated( relation.related ) )
        {
          this.clearRelated( relation );
        }
      }
    };

    model.$on( NeuroModel.Events.PreSave, this.preSave, this );
    model.$on( NeuroModel.Events.PostRemove, this.postRemove, this );

    if ( isEmpty( initial ) && relatedDatabase.hasFields( model, this.local, isValue ) )
    {
      initial = pull( model, this.local );

      Neuro.debug( Neuro.Debugs.HASONE_INITIAL_PULLED, this, model, initial );
    }

    if ( !isEmpty( initial ) )
    {
      Neuro.debug( Neuro.Debugs.HASONE_INITIAL, this, model, initial );

      relatedDatabase.grabModel( initial, this.handleModel( relation ), this, remoteData );      
    }
  },

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
        this.setRelated( relation, related );
      }
    }
  },

  relate: function(model, input)
  {
    var relatedDatabase = this.model.Database;
    var related = relatedDatabase.parseModel( input );
    var relation = model.$relations[ this.name ];
    
    if ( related )
    {
      if ( relation.related !== related )
      {
        this.clearModel( relation );
        this.setRelated( relation, related );
      }
    }
  },

  unrelate: function(model, input)
  {
    var relatedDatabase = this.model.Database;
    var relation = model.$relations[ this.name ];
    var related = relatedDatabase.parseModel( input );

    if ( !related || relation.related === related )
    {
      this.clearRelated( relation );
    }
  },

  isRelated: function(model, input)
  {
    var relatedDatabase = this.model.Database;
    var relation = model.$relations[ this.name ];
    var related = relatedDatabase.parseModel( input );

    return related === relation.related;
  },

  get: function(model)
  {
    var relation = model.$relations[ this.name ];
    
    return relation.related;
  },

  encode: function(model, out, forSaving)
  {
    var relation = model.$relations[ this.name ];
    var mode = forSaving ? this.save : this.store;

    if ( relation && mode )
    {
      out[ this.name ] = this.getStored( relation.related, mode );
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

  setRelated: function(relation, related)
  {
    if ( !related.$isDeleted() )
    {
      this.setModel( relation, related );
      this.updateForeignKey( relation.parent, related );
      this.setProperty( relation ); 
    }
  },

  clearRelated: function(relation)
  {
    this.clearModel( relation );
    this.clearForeignKey( relation.parent );
    this.setProperty( relation );
  },

  clearModel: function(relation) // remoteData?
  {
    var related = relation.related;

    if ( related )
    {
      Neuro.debug( Neuro.Debugs.HASONE_CLEAR_MODEL, this, relation );

      related.$off( NeuroModel.Events.Saved, relation.onSaved );
      related.$off( NeuroModel.Events.Removed, relation.onRemoved );

      if ( this.cascade && !related.$isDeleted() )
      {
        related.$remove();
      }

      relation.related = null;
      relation.dirty = true;
      relation.loaded = true;
    }
  },

  setModel: function(relation, related)
  {
    related.$on( NeuroModel.Events.Saved, relation.onSaved, this );
    related.$on( NeuroModel.Events.Removed, relation.onRemoved, this );

    relation.related = related;
    relation.dirty = true;
    relation.loaded = true;

    Neuro.debug( Neuro.Debugs.HASONE_SET_MODEL, this, relation );
  },

  handleModel: function(relation)
  {
    return function(related) 
    {
      Neuro.debug( Neuro.Debugs.HASONE_LOADED, this, relation.parent, relation, related );

      if ( relation.loaded === false ) 
      {
        if ( related && !related.$isDeleted() ) 
        {
          this.setModel( relation, related );
          this.updateForeignKey( relation.parent, related );
        }
        else
        {
          this.clearForeignKey( relation.parent );
        }

        relation.loaded = true;

        this.setProperty( relation );
      }
    };
  },

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

  clearForeignKey: function(model)
  {
    var local = this.local;

    Neuro.debug( Neuro.Debugs.HASONE_CLEAR_KEY, this, model, local );

    this.clearFields( model, local );
  },

  updateForeignKey: function(model, related)
  {
    var relatedDatabase = this.model.Database;
    var local = this.local;
    var foreign = relatedDatabase.key;

    Neuro.debug( Neuro.Debugs.HASONE_UPDATE_KEY, this, model, local, related, foreign );

    this.updateFields( model, local, related, foreign );
  }

});