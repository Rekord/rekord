function NeuroHasManyThrough()
{
  this.type = 'hasManyThrough';
}

Neuro.Relations.hasManyThrough = NeuroHasManyThrough;

extend( new NeuroRelation(), NeuroHasManyThrough, 
{

  onInitialized: function(database, field, options)
  {
    var relatedDatabase = this.model.Database;

    this.foreign = options.foreign || ( relatedDatabase.name + '_' + relatedDatabase.key );
    this.local = options.local || ( database.name + '_' + database.key );

    this.comparator = createComparator( options.comparator );
    this.cascadeRemove = !!options.cascadeRemove;
    this.cascadeSave = !!options.cascadeSave;

    if ( !isNeuro( options.through ) )
    {
      Neuro.get( options.through, this.setThrough, this );
    }
    else
    {
      this.setThrough( options.through );
    }

    Neuro.debug( Neuro.Events.HASMANYTHRU_INIT, this );
  },

  setThrough: function(through)
  {
    this.through = through;

    this.finishInitialization();
  },

  handleLoad: function(model)
  {
    var that = this;
    var relatedDatabase = this.model.Database;
    var throughDatabase = this.through.Database;
    var isRelated = this.isRelatedFactory( model );
    var initial = model[ this.name ];
 
    var relation = model.$relations[ this.name ] =
    {
      parent: model,
      isRelated: isRelated,
      initial: initial,
      pending: {},
      models: new NeuroMap(),
      throughs: new NeuroMap(),
      saving: false,
      delaySorting: false,
      delaySaving: false,

      onRemoved: function() // this = model removed
      {
        that.removeModel( relation, this );
      },

      onSaved: function() // this = model saved
      {
        if ( relation.saving )
        {
          return;
        }

        that.sort( relation );
        that.checkSave( relation );
      },

      onThroughRemoved: function() // this = through removed
      {
        that.removeModelFromThrough( relation, this );
      }

    };

    // Populate the model's key if it's missing
    model.$key();

    // When models are added to the related database, check if it's related to this model
    throughDatabase.on( 'model-added', this.handleModelAdded( relation ), this );

    // Add convenience methods to the underlying array
    var related = relation.models.values;
    
    related.relate = function(input)
    {
      that.relate( model, input );
    };
    
    related.unrelate = function(input)
    {
      that.unrelate( model, input );
    };
    
    related.isRelated = function(input)
    {
      return that.isRelated( model, input );
    };

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
      throughDatabase.ready( this.handleLazyLoad( relation ), this );
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

  isRelated: function(model, input)
  {
    var relatedDatabase = this.model.Database;
    var relation = model.$relations[ this.name ];
    var existing = relation.models;
    
    if ( this.isModelArray( input ) )
    {
      for (var i = 0; i < input.length; i++)
      {
        var related = relatedDatabase.parseModel( input[ i ] );

        if ( related && !existing.has( related.$key() ) )
        {
          return false;
        }
      }

      return input.length > 0;
    }
    else if ( isValue( input ) )
    {
      var related = relatedDatabase.parseModel( input );

      return related && existing.has( related.$key() );
    }

    return false;
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
        var models = relation.throughs.values;

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
      if ( this.store === Neuro.Store.Model || this.save === Neuro.Save.Model )
      {
        relation.parent.$save();
      }
    }
  },

  handleModelAdded: function(relation)
  {
    return function (through)
    {
      if ( relation.isRelated( through ) )
      {
        this.addModelFromThrough( relation, through );
      }
    };
  },

  handleModel: function(relation)
  {
    return function (related)
    {
      var pending = relation.pending;
      var relatedKey = related.$key();

      if ( relatedKey in pending )
      {
        this.addModel( relation, related, true );

        delete pending[ relatedKey ];
      }
    };
  },

  handleLazyLoad: function(relation)
  {
    return function (throughDatabase)
    {
      var throughsAll = throughDatabase.models;
      var throughsRelated = throughsAll.filter( relation.isRelated );
      var throughs = throughsRelated.values;

      if ( throughs.length === 0 )
      {
        return;
      }

      this.bulk( relation, function()
      {
        for (var i = 0; i < throughs.length; i++)
        {
          this.addModelFromThrough( relation, throughs[ i ] );
        }
      });
    };
  },

  addModel: function(relation, related, skipCheck)
  {
    var adding = this.finishAddModel( relation, related, skipCheck );

    if ( adding )
    {
      this.addThrough( relation, related );
    }
    
    return adding;
  },

  addThrough: function(relation, related)
  {
    var throughDatabase = this.through.Database;
    var throughKey = this.createThroughKey( relation, related );

    throughDatabase.grabModel( throughKey, this.onAddThrough( relation ), this, false );
  },

  onAddThrough: function(relation)
  {
    var throughs = relation.throughs;

    return function(through)
    {
      var key = through.$key();

      if ( !throughs.has( key ) )
      { 
        throughs.put( key, through );

        through.$on( 'removed', relation.onThroughRemoved );
      }

      through.$save();
    };
  },

  addModelFromThrough: function(relation, through)
  {
    var relatedDatabase = this.model.Database;
    var relatedKey = relatedDatabase.buildKey( through, this.foreign );

    relatedDatabase.grabModel( relatedKey, this.onAddModelFromThrough( relation, through ), this );
  },

  onAddModelFromThrough: function(relation, through)
  {
    var throughs = relation.throughs;
    var throughKey = through.$key();

    return function(related)
    {
      if ( !throughs.has( throughKey ) )
      {
        throughs.put( throughKey, through );

        through.$on( 'removed', relation.onThroughRemoved );
      }

      this.finishAddModel( relation, related );
    };
  },

  finishAddModel: function(relation, related, skipCheck)
  {
    var relateds = relation.models;
    var relatedKey = related.$key();
    var adding = !relateds.has( relatedKey );

    if ( adding )
    {
      relateds.put( relatedKey, related );

      related.$on( 'removed', relation.onRemoved );
      related.$on( 'saved remote-update', relation.onSaved );

      this.sort( relation );

      if ( !skipCheck )
      {
        this.checkSave( relation );
      }
    }

    return adding;
  },

  removeModel: function(relation, related, alreadyRemoved)
  {
    var relatedKey = related.$key();

    if ( this.finishRemoveRelated( relation, relatedKey ) )
    {
      this.removeThrough( relation, related, alreadyRemoved );
    }
  },

  removeThrough: function(relation, related, alreadyRemoved)
  {
    var throughDatabase = this.through.Database;
    var keyObject = this.createThroughKey( relation, related );
    var key = throughDatabase.getKey( keyObject );
    var throughs = relation.throughs;
    var through = throughs.get( key );

    if ( through )
    {
      through.$off( 'removed', relation.onThroughRemoved );
      through.$remove();
      
      throughs.remove( key );
    }
  },

  removeModelFromThrough: function(relation, through)
  {
    var relatedDatabase = this.model.Database;
    var throughDatabase = this.through.Database;
    var throughs = relation.throughs;
    var throughKey = through.$key();
    var relatedKey = relatedDatabase.buildKey( through, this.foreign );
    
    through.$off( 'removed', relation.onThroughRemoved );
    throughs.remove( throughKey );

    this.finishRemoveRelated( relation, relatedKey );
  },

  finishRemoveRelated: function(relation, relatedKey)
  {
    var pending = relation.pending;
    var relateds = relation.models;
    var related = relateds.get( relatedKey );

    if ( related )
    {
      relateds.remove( relatedKey );

      related.$off( 'removed', relation.onRemoved );
      related.$off( 'saved remote-update', relation.onSaved );

      this.sort( relation );
      this.checkSave( relation );
    }

    delete pending[ relatedKey ];

    return related;
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
        return true;
      }
    }

    return false;
  },

  isRelatedFactory: function(model)
  {
    var foreign = model.$db.key;
    var local = this.local;

    return function(through)
    {
      return propsMatch( through, local, model, foreign );
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
    
    if ( !relation.delaySorting )
    {
      if ( !related.isSorted( this.comparator ) )
      {
        related.sort( this.comparator );
      }

      relation.parent.$trigger( 'relation-update', [this, relation] );
    }
  },

  createThroughKey: function(relation, related)
  {
    var model = relation.parent;
    var modelDatabase = model.$db;
    var relatedDatabase = this.model.Database;
    var throughDatabase = this.through.Database;
    var throughKey = throughDatabase.key;
    var key = {};

    for (var i = 0; i < throughKey.length; i++)
    {
      var prop = throughKey[ i ];

      if ( prop === this.foreign )
      {
        key[ prop ] = related.$key();
      }
      else if ( prop === this.local )
      {
        key[ prop ] = model.$key();
      }
      else if ( isArray( this.foreign ) )
      {
        var keyIndex = indexOf( this.foreign, prop );
        var keyProp = relatedDatabase.key[ keyIndex ];

        key[ prop ] = related[ keyProp ];
      }
      else if ( isArray( this.local ) )
      {
        var keyIndex = indexOf( this.local, prop );
        var keyProp = modelDatabase.key[ keyIndex ];

        key[ prop ] = model[ keyProp ];
      }
    }

    return key;
  }

});