function NeuroHasOne()
{
  this.type = 'hasOne';
}

Neuro.Relations.hasOne = NeuroHasOne;

extend( new NeuroRelation(), NeuroHasOne, 
{

  onInitialized: function(database, field, options)
  {
    var relatedDatabase = this.model.Database;

    this.local = options.local || ( relatedDatabase.name + '_' + relatedDatabase.key );

    Neuro.debug( Neuro.Events.HASONE_INIT, this );
  },

  load: function(model)
  {
    var that = this;
    var isRelated = this.isRelatedFactory( model );
    var relatedDatabase = this.model.Database;
    var initial = model[ this.name ];

    var relation = model.$relations[ this.name ] = 
    {
      initial: initial,
      isRelated: isRelated,
      model: null,
      loaded: false,
      dirty: false,
      saving: false,

      onRemoved: function() 
      {
        Neuro.debug( Neuro.Events.HASONE_NINJA_REMOVE, that, model, relation );

        this.clearModel( relation, true );
        this.clearForeignKey( model );
      },
      onSaved: function() 
      {
        if ( relation.saving )
        {
          return;
        }

        Neuro.debug( Neuro.Events.HASONE_NINJA_SAVE, that, model, relation );

        if ( !isRelated( relation.model ) )
        {
          this.clearModel( relation );
          this.clearForeignKey( model );
        }
      }
    };

    if ( isEmpty( initial ) && relatedDatabase.hasFields( model, this.local, isValue ) )
    {
      initial = pull( model, this.local );

      Neuro.debug( Neuro.Events.HASONE_INITIAL_PULLED, this, model, initial );
    }

    if ( !isEmpty( initial ) )
    {
      Neuro.debug( Neuro.Events.HASONE_INITIAL, this, model, initial );

      relatedDatabase.grabModel( initial, this.handleLoad( model, relation ), this );      
    }
  },

  set: function(model, input)
  {
    if ( !isValue( input ) )
    {
      this.unrelate( model );
    }
    else
    {
      var relatedDatabase = this.model.Database;
      var related = relatedDatabase.parseModel( input );
      var relation = model.$relations[ this.name ];

      if ( related && !relation.isRelated( related ) )
      {
        this.clearModel( relation );
        this.setRelated( model, relation, related );
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
      if ( relation.model !== related )
      {
        this.clearModel( relation );
        this.setRelated( model, relation, related );
      }
    }
  },

  unrelate: function(model, input)
  {
    var relatedDatabase = this.model.Database;
    var relation = model.$relations[ this.name ];
    var related = relatedDatabase.parseModel( input );

    if ( !related || relation.model === related )
    {
      this.clearModel( relation );
      this.clearForeignKey( model );
    }
  },

  isRelated: function(model, input)
  {
    var relatedDatabase = this.model.Database;
    var relation = model.$relations[ this.name ];
    var related = relatedDatabase.parseModel( input );

    return related === relation.model;
  },

  setRelated: function(model, relation, related)
  {
    this.setModel( relation, related );
    this.updateForeignKey( model, related );
    this.setProperty( model, relation );
  },

  get: function(model)
  {
    var relation = model.$relations[ this.name ];
    
    return relation.model;
  },

  encode: function(model, out, forSaving)
  {
    var relation = model.$relations[ this.name ];
    var mode = forSaving ? this.save : this.store;

    if ( relation && mode )
    {
      out[ this.name ] = this.getStored( relation.model, mode );
    }
  },

  preSave: function(model)
  {
    var relation = model.$relations[ this.name ];

    if ( relation && relation.model )
    {
      var related = relation.model;  

      if ( !relation.isRelated( related ) )
      {
        // this.set( model, model[ this.local ] ) ?
      }

      if ( relation.dirty || related.$hasChanges() )
      {
        Neuro.debug( Neuro.Events.HASONE_PRESAVE, this, model, relation );

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
      if ( this.cascade !== false )
      {
        Neuro.debug( Neuro.Events.HASONE_POSTREMOVE, this, model, relation );

        this.clearModel( relation );
      }
    }
  },

  clearModel: function(relation, dontRemove)
  {
    if ( relation.model )
    {
      Neuro.debug( Neuro.Events.HASONE_CLEAR_MODEL, this, relation );

      relation.model.$off( 'saved', relation.onSaved );
      relation.model.$off( 'removed', relation.onRemoved );

      if ( !dontRemove )
      {
        relation.model.$remove();
      }

      relation.model = null;
      relation.dirty = true;
      relation.loaded = true;
    }
  },

  setModel: function(relation, model)
  {
    model.$on( 'saved', relation.onSaved, this );
    model.$on( 'removed', relation.onRemoved, this );

    relation.model = model;
    relation.dirty = true;
    relation.loaded = true;

    Neuro.debug( Neuro.Events.HASONE_SET_MODEL, this, relation );
  },

  handleLoad: function(model, relation)
  {
    return function(related) 
    {
      Neuro.debug( Neuro.Events.HASONE_LOADED, this, model, relation, related );

      if ( relation.loaded === false ) 
      {
        if ( related ) 
        {
          this.setModel( relation, related );
          this.updateForeignKey( model, related );
        }
        else
        {
          this.clearForeignKey( model );
        }

        relation.loaded = true;

        this.setProperty( model, relation );
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

    Neuro.debug( Neuro.Events.HASONE_CLEAR_KEY, this, model, local );

    this.clearFields( model, local );
  },

  updateForeignKey: function(model, related)
  {
    var relatedDatabase = this.model.Database;
    var local = this.local;
    var foreign = relatedDatabase.key;

    Neuro.debug( Neuro.Events.HASONE_UPDATE_KEY, this, model, local, related, foreign );

    this.updateFields( model, local, related, foreign );
  },

  setProperty: function(model, relation)
  {
    if ( this.property )
    {
      if ( model[ this.name ] !== relation.model )
      {
        model[ this.name ] = relation.model;
        
        model.$trigger( 'relation-update', [this, relation] );
      }
    }
  }

});