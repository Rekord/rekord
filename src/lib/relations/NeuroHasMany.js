function NeuroHasMany()
{
  this.type = 'hasMany';
}

Neuro.Relations.hasMany = NeuroHasMany;

extend( new NeuroRelation(), NeuroHasMany, 
{

  onInitialized: function(database, field, options)
  {
    this.foreign = options.foreign || ( database.name + '_' + database.key );
    this.comparator = createComparator( options.comparator, options.comparatorNullsFirst );
    this.cascadeRemove = !!options.cascadeRemove;
    this.cascadeSave = !!options.cascadeSave;
    this.clearKey = this.ownsForeignKey();

    Neuro.debug( Neuro.Events.HASMANY_INIT, this );
    
    this.finishInitialization();
  },

  handleLoad: function(model)
  {
    var that = this;
    var relatedDatabase = this.model.Database;
    var isRelated = this.isRelatedFactory( model );
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
      relatedDatabase.ready( this.handleLazyLoad( relation ), this );
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
      if ( this.store === Neuro.Store.Model || this.save === Neuro.Save.Model )
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

  handleLazyLoad: function(relation)
  {
    return function (relatedDatabase)
    {
      var related = relatedDatabase.models.filter( relation.isRelated );
      var models = related.values;

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

      if ( !skipCheck )
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

      if ( !alreadyRemoved && this.cascadeRemove )
      {
        related.$remove();
      }

      this.clearForeignKey( related );
      this.sort( relation );
      this.checkSave( relation );
    }

    delete pending[ key ];
  },

  ownsForeignKey: function()
  {
    var foreign = this.foreign;
    var relatedKey = this.model.Database.key;

    if ( isString( foreign ) )
    {
      if ( isArray( relatedKey ) )
      {
        return indexOf( relatedKey, foreign ) === false;
      }
      else        
      {
        return relatedKey !== foreign;
      }
    }
    else // if ( isArray( ))
    {
      if ( isArray( relatedKey ) )
      {
        for (var i = 0; i < foreign.length; i++)
        {
          if ( indexOf( relatedKey, foreign[ i ] ) !== false )
          {
            return false;
          }
        }
        return true;
      }
      else
      {
        return indexOf( foreign, relatedKey ) === false;
      }
    }

    return true;
  },

  updateForeignKey: function(model, related)
  {
    var foreign = this.foreign;
    var local = model.$db.key;

    this.updateFields( related, foreign, model, local );
  },

  clearForeignKey: function(related)
  {
    if ( this.clearKey )
    {
      var foreign = this.foreign;

      this.clearFields( related, foreign );
    }
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
    
    if ( !relation.delaySorting )
    {
      if ( !related.isSorted( this.comparator ) )
      {
        related.sort( this.comparator );
      }

      relation.parent.$trigger( 'relation-update', [this, relation] );
    }
  }

});