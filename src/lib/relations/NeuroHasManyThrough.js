function NeuroHasManyThrough()
{
}

Neuro.Relations.hasManyThrough = NeuroHasManyThrough;

NeuroHasManyThrough.Defaults = 
{
  model:                null,
  store:                Neuro.Store.None,
  save:                 Neuro.Save.None,
  auto:                 true,
  property:             true,
  dynamic:              false,
  through:              undefined,
  local:                null,
  foreign:              null,
  comparator:           null,
  comparatorNullsFirst: false,
  cascadeRemove:        true,
  cascadeSave:          true,
  cascadeSaveRelated:   false,
  discriminator:        'discriminator',
  discriminators:       {},
  discriminatorToModel: {}
};

extend( NeuroRelation, NeuroHasManyThrough, 
{

  type: 'hasManyThrough',

  getDefaults: function(database, field, options)
  {
    return NeuroHasManyThrough.Defaults;
  },

  onInitialized: function(database, field, options)
  {
    if ( !this.discriminated )
    {
      var relatedDatabase = this.model.Database;

      this.foreign = this.foreign || ( relatedDatabase.name + '_' + relatedDatabase.key );
    }

    this.local = this.local || ( database.name + '_' + database.key );
    this.comparator = createComparator( this.comparator, this.comparatorNullsFirst );

    if ( !isNeuro( options.through ) )
    {
      Neuro.get( options.through, this.setThrough, this );
    }
    else
    {
      this.setThrough( options.through );
    }

    Neuro.debug( Neuro.Debugs.HASMANYTHRU_INIT, this );
  },

  setThrough: function(through)
  {
    this.through = through;

    this.finishInitialization();
  },

  handleLoad: function(model, remoteData)
  {
    var that = this;
    var throughDatabase = this.through.Database;
    var collection = this.createRelationCollection( model );
    var isRelated = this.isRelatedFactory( model );
    var initial = model[ this.name ];
 
    var relation = model.$relations[ this.name ] =
    {
      parent: model,
      isRelated: isRelated,
      initial: initial,
      pending: {},
      related: collection,
      throughs: new NeuroMap(),
      saving: false,
      delaySorting: false,
      delaySaving: false,

      onRemoved: function() // this = model removed
      {
        Neuro.debug( Neuro.Debugs.HASMANYTHRU_NINJA_REMOVE, that, model, this, relation );

        that.removeModel( relation, this );
      },

      onSaved: function() // this = model saved
      {
        if ( relation.saving )
        {
          return;
        }

        Neuro.debug( Neuro.Debugs.HASMANYTHRU_NINJA_SAVE, that, model, this, relation );

        that.sort( relation );
        that.checkSave( relation );
      },

      onThroughRemoved: function() // this = through removed
      {
        Neuro.debug( Neuro.Debugs.HASMANYTHRU_NINJA_THRU_REMOVE, that, model, this, relation );

        that.removeModelFromThrough( relation, this );
      }

    };

    // Populate the model's key if it's missing
    model.$key();
    model.$on( NeuroModel.Events.PostSave, this.postSave, this );
    model.$on( NeuroModel.Events.PreRemove, this.preRemove, this );

    // When models are added to the related database, check if it's related to this model
    throughDatabase.on( NeuroDatabase.Events.ModelAdded, this.handleModelAdded( relation ), this );

    // If the model's initial value is an array, populate the relation from it!
    if ( isArray( initial ) )
    {
      Neuro.debug( Neuro.Debugs.HASMANYTHRU_INITIAL, this, model, relation, initial );

      this.grabModels( initial, this.handleModel( relation ), remoteData );
    }
    else
    {
      Neuro.debug( Neuro.Debugs.HASMANYTHRU_INITIAL_PULLED, this, model, relation );

      throughDatabase.ready( this.handleLazyLoad( relation ), this );
    }

    // We only need to set the property once since the underlying array won't change.
    this.setProperty( relation );
  },

  bulk: function(relation, callback, remoteData)
  {
    relation.delaySorting = true;
    relation.delaySaving = true;

    callback.apply( this );

    relation.delaySorting = false;
    relation.delaySaving = false;

    this.sort( relation );
    this.checkSave( relation, remoteData );
  },
  
  set: function(model, input, remoteData)
  {
    if ( isEmpty( input ) )
    {
      this.unrelate( model );
    }
    else
    {
      var relation = model.$relations[ this.name ];
      var existing = relation.related;
      var given = this.createCollection();

      if ( this.isModelArray( input ) )
      {
        for (var i = 0; i < input.length; i++)
        {
          var related = this.parseModel( input[ i ], remoteData );

          if ( related )
          {
            given.add( related );
          }
        }
      }
      else
      {
        var related = this.parseModel( input, remoteData );

        if ( related )
        {
          given.add( related );
        }
      }

      var removing = existing.subtract( given );
      var adding = given.subtract( existing );
      
      this.bulk( relation, function()
      {
        for (var i = 0; i < adding.length; i++)
        {
          this.addModel( relation, adding[ i ], remoteData );
        }

        for (var i = 0; i < removing.length; i++)
        {
          this.removeModel( relation, removing[ i] );
        }
        
      }, remoteData);
    }
  },

  relate: function(model, input)
  {
    var relation = model.$relations[ this.name ];

    if ( this.isModelArray( input ) )
    {
      this.bulk( relation, function()
      {
        for (var i = 0; i < input.length; i++)
        {
          var related = this.parseModel( input[ i ] );

          if ( related )
          {
            this.addModel( relation, related );
          }
        }
      });
    }
    else if ( isValue( input ) )
    {
      var related = this.parseModel( input );

      if ( related )
      {
        this.addModel( relation, related );
      }
    }
  },

  unrelate: function(model, input)
  {
    var relation = model.$relations[ this.name ];

    if ( this.isModelArray( input ) )
    {
      this.bulk( relation, function()
      { 
        for (var i = 0; i < input.length; i++)
        {
          var related = this.parseModel( input[ i ] );

          if ( related )
          {
            this.removeModel( relation, related );
          }
        }
      });
    }
    else if ( isValue( input ) )
    {
      var related = this.parseModel( input );

      if ( related )
      {
        this.removeModel( relation, related );
      }
    }
    else
    {
      var all = relation.related;

      this.bulk( relation, function()
      { 
        for (var i = all.length - 1; i >= 0; i--)
        {
          this.removeModel( relation, all[ i ] );
        }
      });
    }
  },

  isRelated: function(model, input)
  {
    var relation = model.$relations[ this.name ];
    var existing = relation.related;
    
    if ( this.isModelArray( input ) )
    {
      for (var i = 0; i < input.length; i++)
      {
        var related = this.parseModel( input[ i ] );

        if ( related && !existing.has( related.$key() ) )
        {
          return false;
        }
      }

      return input.length > 0;
    }
    else if ( isValue( input ) )
    {
      var related = this.parseModel( input );

      return related && existing.has( related.$key() );
    }

    return false;
  },

  postSave: function(model)
  {
    var relation = model.$relations[ this.name ];

    if ( relation && this.cascadeSaveRelated )
    {
      Neuro.debug( Neuro.Debugs.HASMANYTHRU_PRESAVE, this, model, relation );

      relation.saving = true;
      relation.delaySaving = true;

      var models = relation.related;

      for (var i = 0; i < models.length; i++)
      {
        var related = models[ i ];

        if ( !related.$isDeleted() && related.$hasChanges() )
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
      Neuro.debug( Neuro.Debugs.HASMANYTHRU_PREREMOVE, this, model, relation );

      this.bulk( relation, function()
      {
        var models = relation.throughs;

        for (var i = 0; i < models.length; i++)
        {
          var related = models[ i ];

          related.$remove();
        }
      });
    }
  },

  checkSave: function(relation, remoteData)
  {
    if ( !relation.delaySaving && !remoteData )
    {
      if ( this.store === Neuro.Store.Model || this.save === Neuro.Save.Model )
      {
        Neuro.debug( Neuro.Debugs.HASMANYTHRU_AUTO_SAVE, this, relation );

        relation.parent.$save();
      }
    }
  },

  handleModelAdded: function(relation)
  {
    return function (through, remoteData)
    {
      if ( relation.isRelated( through ) && !relation.throughs.has( through.$key() ) )
      {
        Neuro.debug( Neuro.Debugs.HASMANYTHRU_NINJA_ADD, this, relation, through );

        this.addModelFromThrough( relation, through, remoteData );
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
        Neuro.debug( Neuro.Debugs.HASMANYTHRU_INITIAL_GRABBED, this, relation, related );

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
      var throughs = throughsAll.filter( relation.isRelated );

      if ( throughs.length === 0 )
      {
        return;
      }

      Neuro.debug( Neuro.Debugs.HASMANYTHRU_LAZY_LOAD, this, relation, throughs );

      this.bulk( relation, function()
      {
        for (var i = 0; i < throughs.length; i++)
        {
          this.addModelFromThrough( relation, throughs[ i ] );
        }
      });
    };
  },

  addModel: function(relation, related, remoteData)
  {
    if ( related.$isDeleted() )
    {
      return;
    }

    var adding = this.finishAddModel( relation, related, remoteData );

    if ( adding )
    {
      this.addThrough( relation, related, remoteData );
    }
    
    return adding;
  },

  addThrough: function(relation, related, remoteData)
  {
    var throughDatabase = this.through.Database;
    var throughKey = this.createThroughKey( relation, related );

    throughDatabase.grabModel( throughKey, this.onAddThrough( relation, remoteData ), this, remoteData );
  },

  onAddThrough: function(relation, remoteData)
  {
    return function onAddThrough(through)
    {
      this.finishAddThrough( relation, through, remoteData );
    };
  },

  addModelFromThrough: function(relation, through, remoteData)
  {
    if ( through.$isDeleted() )
    {
      return;
    }

    // TODO polymoprhic logic
    var relatedDatabase = this.model.Database;
    var relatedKey = relatedDatabase.buildKey( through, this.foreign );

    relatedDatabase.grabModel( relatedKey, this.onAddModelFromThrough( relation, through, remoteData ), this, remoteData );
  },

  onAddModelFromThrough: function(relation, through, remoteData)
  {
    return function onAddModelFromThrough(related)
    {
      if ( related )
      {
        this.finishAddThrough( relation, through, remoteData );
        this.finishAddModel( relation, related, remoteData );
      }
    };
  },

  finishAddThrough: function(relation, through, remoteData)
  {
    var throughs = relation.throughs;
    var throughKey = through.$key();

    if ( !throughs.has( throughKey ) )
    {
      Neuro.debug( Neuro.Debugs.HASMANYTHRU_THRU_ADD, this, relation, through );

      throughs.put( throughKey, through );

      through.$on( NeuroModel.Events.Removed, relation.onThroughRemoved );

      if ( !remoteData && this.cascadeSave )
      {
        through.$save();
      }
    }
  },

  finishAddModel: function(relation, related, remoteData)
  {
    var relateds = relation.related;
    var relatedKey = related.$key();
    var adding = !relateds.has( relatedKey );

    if ( adding )
    {
      Neuro.debug( Neuro.Debugs.HASMANYTHRU_ADD, this, relation, related );

      relateds.put( relatedKey, related );

      related.$on( NeuroModel.Events.Removed, relation.onRemoved );
      related.$on( NeuroModel.Events.SavedRemoteUpdate, relation.onSaved );

      this.sort( relation );

      if ( !remoteData )
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

    this.finishRemoveThrough( relation, through, related, true );
  },

  removeModelFromThrough: function(relation, through)
  {
    var relatedDatabase = this.model.Database;
    var relatedKey = relatedDatabase.buildKey( through, this.foreign );
    
    if ( this.finishRemoveThrough( relation, through ) )
    {
      this.finishRemoveRelated( relation, relatedKey );
    }
  },

  finishRemoveThrough: function(relation, through, related, callRemove)
  {
    var removing = !!through;

    if ( removing )
    {
      Neuro.debug( Neuro.Debugs.HASMANYTHRU_THRU_REMOVE, this, relation, through, related );

      var throughs = relation.throughs;
      var throughKey = through.$key();

      through.$off( NeuroModel.Events.Removed, relation.onThroughRemoved );

      if ( callRemove )
      {
        through.$remove();
      }

      throughs.remove( throughKey );
    }

    return removing;
  },

  finishRemoveRelated: function(relation, relatedKey)
  {
    var pending = relation.pending;
    var relateds = relation.related;
    var related = relateds.get( relatedKey );

    if ( related )
    {
      Neuro.debug( Neuro.Debugs.HASMANYTHRU_REMOVE, this, relation, related );

      relateds.remove( relatedKey );

      related.$off( NeuroModel.Events.Removed, relation.onRemoved );
      related.$off( NeuroModel.Events.SavedRemoteUpdate, relation.onSaved );

      this.sort( relation );
      this.checkSave( relation );
    }

    delete pending[ relatedKey ];

    return related;
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

  sort: function(relation)
  {
    var related = relation.related;
    
    if ( !relation.delaySorting )
    {
      Neuro.debug( Neuro.Debugs.HASMANYTHRU_SORT, this, relation );

      related.resort( this.comparator );
     
      relation.parent.$trigger( NeuroModel.Events.RelationUpdate, [this, relation] );
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