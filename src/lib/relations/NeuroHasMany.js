function NeuroHasMany()
{
  this.type = 'hasMany';
}

// cascadeSave = when model is saved, save children?
// cascadeRemove = when model is deleted, delete children?

extend( new NeuroRelation(), NeuroHasMany, 
{

  onInitialized: function(database, field, options)
  {
    this.foreign = options.foreign || ( database.name + '_' + database.key );
    this.comparator = createComparator( options.comparator );
    this.cascadeRemove = !!options.cascadeRemove;
    this.cascadeSave = !!options.cascadeSave;

    Neuro.debug( Neuro.Events.HASMANY_INIT, this );
  },

  load: function(model)
  {
    var that = this;
    var relatedDatabase = this.model.Database;
    var isRelated = this.isRelated( model );
    var initial = model[ this.name ];
 
    var relation = model.$relations[ this.name ] =
    {
      parent: model,
      isRelated: isRelated,
      initial: initial,
      pending: {},
      models: new NeuroMap(),
      saving: false,
      delaySorting: false,
      delaySaving: false,

      onRemoved: function() // this = model removed
      {
        that.removeModel( relation, this, true );
      },

      onSaved: function() // this = model saved
      {
        if ( relation.saving )
        {
          return;
        }

        if ( !isRelated( this ) )
        {
          that.removeModel( relation, this );
        }
        else
        {
          that.sort( relation );
          that.checkSave( relation );
        }
      }

    };

    // Populate the model's key if it's missing
    model.$key();

    // When models are added to the related database, check if it's related to this model
    relatedDatabase.on( 'model-added', this.handleModelAdded( relation ), this );
    
    // If the model's initial value is an array, populate the relation from it!
    if ( isArray( initial ) )
    {
      for (var i = 0; i < initial.length; i++)
      {
        var input = initial[ i ];
        var key = relatedDatabase.buildKeyFromInput( input );

        relation.pending[ key ] = true;
        relatedDatabase.grabModel( input, this.handleModel( relation ), this );
      }
    } 
    else
    {
      var source = relatedDatabase.models;
        
      relatedDatabase.ready( this.handleLazyLoad( relation, source ), this );
    }

    // We only need to set the property once since the underlying array won't change.
    this.setProperty( relation );
  },

  bulk: function(relation, callback)
  {
    relation.delaySorting = true;
    relation.delaySaving = true;

    callback.apply( this );

    relation.delaySorting = false;
    relation.delaySaving = false;

    this.sort( relation );
    this.checkSave( relation );
  },

  relate: function(model, input)
  {
    var relatedDatabase = this.model.Database;
    var relation = model.$relations[ this.name ];

    if ( this.isModelArray( input ) )
    {
      this.bulk( relation, function()
      {
        for (var i = 0; i < input.length; i++)
        {
          var related = relatedDatabase.parseModel( input[ i ] );

          if ( related )
          {
            this.addModel( relation, related );
          }
        }
      });
    }
    else if ( isValue( input ) )
    {
      var related = relatedDatabase.parseModel( input );

      if ( related )
      {
        this.addModel( relation, related );
      }
    }
  },

  unrelate: function(model, input)
  {
    var relatedDatabase = this.model.Database;
    var relation = model.$relations[ this.name ];

    if ( this.isModelArray( input ) )
    {
      this.bulk( relation, function()
      { 
        for (var i = 0; i < input.length; i++)
        {
          var related = relatedDatabase.parseModel( input[ i ] );

          if ( related )
          {
            this.removeModel( relation, related );
          }
        }
      });
    }
    else if ( isValue( input ) )
    {
      var related = relatedDatabase.parseModel( input );

      if ( related )
      {
        this.removeModel( relation, related );
      }
    }
    else
    {
      var all = relation.models.values;

      for (var i = all.length - 1; i >= 0; i--)
      {
        this.removeModel( relation, all[ i ] );
      }
    }
  },

  get: function(model)
  {
    var relation = model.$relations[ this.name ];

    return relation.models.values;
  },

  encode: function(model, out, forSaving)
  {
    var relation = model.$relations[ this.name ];
    var mode = forSaving ? this.save : this.store;

    if ( relation && mode )
    {
      out[ this.name ] = this.getStoredArray( relation.models.values, mode );
    }
  },

  postSave: function(model)
  {
    var relation = model.$relations[ this.name ];

    if ( relation && this.cascadeSave )
    {
      relation.saving = true;
      relation.delaySaving = true;

      var models = relation.models.values;

      for (var i = 0; i < models.length; i++)
      {
        var related = models[ i ];

        if ( related.$hasChanges() )
        {
          related.$save();
        }
      }

      relation.saving = false;
      relation.delaySaving = false;
    }
  },

  preRemove: function(model)
  {
    var relation = model.$relations[ this.name ];

    if ( relation && this.cascadeRemove )
    {
      this.bulk( relation, function()
      {
        var models = relation.models.values;

        for (var i = 0; i < models.length; i++)
        {
          var related = models[ i ];

          related.$remove();
        }
      });
    }
  },

  checkSave: function(relation)
  {
    if ( !relation.delaySaving )
    {
      if ( this.store === Neuro.STORE_MODEL || this.save === Neuro.SAVE_MODEL )
      {
        relation.parent.$save();
      }
    }
  },

  handleModelAdded: function(relation)
  {
    return function (related)
    {
      if ( relation.isRelated( related ) )
      {
        this.addModel( relation, related );
      }
    };
  },

  handleModel: function(relation)
  {
    return function (related)
    {
      var pending = relation.pending;
      var key = related.$key();

      if ( key in pending )
      {
        this.addModel( relation, related, true );

        delete pending[ key ];
      }
    };
  },

  handleLazyLoad: function(relation, source)
  {
    return function (relatedDatabase)
    {
      var map = source.filter( relation.isRelated );
      var models = map.values;

      this.bulk( relation, function()
      {
        for (var i = 0; i < models.length; i++)
        {
          this.addModel( relation, models[ i ] );
        }
      });
    };
  },

  addModel: function(relation, related, skipCheck)
  {
    var target = relation.models;
    var key = related.$key();
    var adding = !target.has( key );

    if ( adding )
    {
      target.put( key, related );

      related.$on( 'removed', relation.onRemoved );
      related.$on( 'saved remote-update', relation.onSaved );

      this.updateForeignKey( relation.parent, related );

      this.sort( relation );

      if ( skipCheck )
      {
        this.checkSave( relation );
      }
    }

    return adding;
  },

  removeModel: function(relation, related, alreadyRemoved)
  {
    var target = relation.models;
    var pending = relation.pending;
    var key = related.$key();

    if ( target.has( key ) )
    {
      target.remove( key );

      related.$off( 'removed', relation.onRemoved );
      related.$off( 'saved remote-update', relation.onSaved );

      this.clearForeignKey( related );

      if ( !alreadyRemoved && this.cascadeRemove )
      {
        related.$remove();
      }

      this.sort( relation );
      this.checkSave( relation );
    }

    delete pending[ key ];
  },

  updateForeignKey: function(model, related)
  {
    var foreign = this.foreign;
    var local = model.$db.key;

    this.updateFields( related, foreign, model, local );
  },

  clearForeignKey: function(related)
  {
    var foreign = this.foreign;

    this.clearFields( related, foreign );
  },

  isModelArray: function(input)
  {
    if ( !isArray( input ) )
    {
      return false;
    }

    var relatedDatabase = this.model.Database;
    var relatedKey = relatedDatabase.key;

    if ( !isArray( relatedKey ) )
    {
      return false;
    }

    if ( relatedKey.length !== input.length )
    {
      return false;
    }

    for ( var i = 0; i < input.length; i++ )
    {
      if ( !isNumber( input[ i ] ) && !isString( input[ i ] ) )
      {
        return false;
      }
    }

    return true;
  },

  isRelated: function(model)
  {
    var foreign = this.foreign;
    var local = model.$db.key;

    return function(related)
    {
      return propsMatch( related, foreign, model, local );
    };
  },

  setProperty: function(relation)
  {
    if ( this.property )
    {
      relation.parent[ this.name ] = relation.models.values;
    }
  },

  sort: function(relation)
  {
    var related = relation.models;

    if ( !relation.delaySorting && !related.isSorted( this.comparator ) )
    {
      related.sort( this.comparator );
    }
  }

});

Neuro.RELATIONS[ 'hasMany' ] = NeuroHasMany;