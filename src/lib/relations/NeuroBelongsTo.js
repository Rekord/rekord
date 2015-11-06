function NeuroBelongsTo()
{
  this.type = 'belongsTo';
}

extend( new NeuroRelation(), NeuroBelongsTo, 
{

  onInitialized: function(database, field, options)
  {
    var relatedDatabase = this.model.Database;

    this.local = options.local || ( relatedDatabase.name + '_' + relatedDatabase.key );

    Neuro.debug( Neuro.Events.BELONGSTO_INIT, this );
  },

  load: function(model)
  {
    var that = this;
    var relatedDatabase = this.model.Database;
    var initial = model[ this.name ];

    var relation = model.$relations[ this.name ] = 
    {
      initial: initial,
      model: null,
      loaded: false,

      onRemoved: function() 
      {
        Neuro.debug( Neuro.Events.BELONGSTO_NINJA_REMOVE, that, model, relation );

        if ( this.cascade !== false )
        {
          model.$remove();
        }
      },
      onSaved: function() 
      {
        Neuro.debug( Neuro.Events.BELONGSTO_NINJA_SAVE, that, model, relation );

        if ( !this.hasForeignKey( model, relation.model ) && this.cascade !== false )
        {
          model.$remove();
        }
      }
    };

    if ( isEmpty( initial ) && relatedDatabase.hasFields( model, this.local, isValue ) )
    {
      initial = pull( model, this.local );

      Neuro.debug( Neuro.Events.BELONGSTO_INITIAL_PULLED, this, model, initial );
    }

    if ( !isEmpty( initial ) )
    {
      Neuro.debug( Neuro.Events.BELONGSTO_INITIAL, this, model, initial );

      relatedDatabase.grabModel( initial, this.handleLoad( model, relation ), this );      
    }
  },

  // same as HasOne
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

      if ( related && !this.hasForeignKey( model, related ) )
      {
        this.clearModel( relation );
        this.setRelated( model, relation, related );
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
        this.setRelated( model, relation, related );
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
      this.clearModel( relation );
      this.clearForeignKey( model );
    }
  },

  // same as HasOne
  setRelated: function(model, relation, related)
  {
    this.setModel( relation, related );
    this.updateForeignKey( model, related );
    this.setProperty( model, relation );
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
      Neuro.debug( Neuro.Events.BELONGSTO_POSTREMOVE, this, model, relation );

      this.clearModel( relation );
    }
  },

  clearModel: function(relation)
  {
    if ( relation.model )
    {
      Neuro.debug( Neuro.Events.BELONGSTO_CLEAR_MODEL, this, relation );

      relation.model.$off( 'saved', relation.onSaved );
      relation.model.$off( 'removed', relation.onRemoved );

      relation.model = null;
      relation.loaded = true;
    }
  },

  setModel: function(relation, model)
  {
    model.$on( 'saved', relation.onSaved, this );
    model.$on( 'removed', relation.onRemoved, this );

    relation.model = model;
    relation.loaded = true;

    Neuro.debug( Neuro.Events.BELONGSTO_SET_MODEL, this, relation );
  },

  // same as HasOne
  handleLoad: function(model, relation)
  {
    return function(related) 
    {
      Neuro.debug( Neuro.Events.BELONGSTO_LOADED, this, model, relation, related );

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

  // same as HasOne
  hasForeignKey: function(model, related)
  {
    var relatedDatabase = this.model.Database;
    var local = this.local;
    var foreign = relatedDatabase.key;

    return propsMatch( model, local, related, foreign );
  },

  // same as HasOne
  clearForeignKey: function(model)
  {
    var local = this.local;

    Neuro.debug( Neuro.Events.BELONGSTO_CLEAR_KEY, this, model, local );

    this.clearFields( model, local );
  },

  // same as HasOne
  updateForeignKey: function(model, related)
  {
    var relatedDatabase = this.model.Database;
    var local = this.local;
    var foreign = relatedDatabase.key;

    Neuro.debug( Neuro.Events.BELONGSTO_UPDATE_KEY, this, model, local, related, foreign );

    this.updateFields( model, local, related, foreign );
  },

  // same as HasOne
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

Neuro.RELATIONS[ 'belongsTo' ] = NeuroBelongsTo;