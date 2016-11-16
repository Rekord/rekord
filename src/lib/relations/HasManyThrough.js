function HasManyThrough()
{
}

Rekord.Relations.hasManyThrough = HasManyThrough;

HasManyThrough.Defaults =
{
  model:                null,
  lazy:                 false,
  query:                false,
  store:                Store.None,
  save:                 Save.None,
  auto:                 true,
  autoCascade:          Cascade.All,
  autoOptions:          null,
  property:             true,
  dynamic:              false,
  through:              undefined,
  local:                null,
  foreign:              null,
  comparator:           null,
  comparatorNullsFirst: false,
  listenForRelated:     true,
  loadRelated:          true,
  where:                false,
  cascadeRemove:        Cascade.NoRest,
  cascadeSave:          Cascade.All,
  cascadeSaveOptions:   null,
  cascadeSaveRelated:   Cascade.None,
  cascadeSaveRelatedOptions: null,
  saveParentCascade:    Cascade.All,
  saveParentOptions:    null,
  cascadeRemoveThroughOptions: null,
  discriminator:        'discriminator',
  discriminators:       {},
  discriminatorToModel: {}
};

Class.extend( RelationMultiple, HasManyThrough,
{

  type: 'hasManyThrough',

  debugAutoSave:        Rekord.Debugs.HASMANYTHRU_AUTO_SAVE,
  debugInitialGrabbed:  Rekord.Debugs.HASMANYTHRU_INITIAL_GRABBED,
  debugSort:            Rekord.Debugs.HASMANYTHRU_SORT,
  debugQuery:           Rekord.Debugs.HASMANYTHRU_QUERY,
  debugQueryResults:    Rekord.Debugs.HASMANYTHRU_QUERY_RESULTS,
  debugUpdateKey:       Rekord.Debugs.HASMANYTHRU_UPDATE_KEY,

  getDefaults: function(database, field, options)
  {
    return HasManyThrough.Defaults;
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

    if ( !isRekord( options.through ) )
    {
      Rekord.get( options.through ).complete( this.setThrough, this );
    }
    else
    {
      this.setThrough( options.through );
    }

    Rekord.debug( Rekord.Debugs.HASMANYTHRU_INIT, this );
  },

  setThrough: function(through)
  {
    this.through = through;

    this.finishInitialization();
  },

  load: Gate(function(model, initialValue, remoteData)
  {
    var relator = this;
    var throughDatabase = this.through.Database;

    var relation = model.$relations[ this.name ] =
    {
      parent: model,
      isRelated: this.isRelatedFactory( model ),
      pending: {},
      related: this.createRelationCollection( model ),
      throughs: new Map(),
      saving: false,
      delaySorting: false,
      delaySaving: false,

      onRemoved: function() // this = model removed
      {
        Rekord.debug( Rekord.Debugs.HASMANYTHRU_NINJA_REMOVE, relator, model, this, relation );

        relator.removeModel( relation, this );
      },

      onSaved: function() // this = model saved
      {
        if ( relation.saving )
        {
          return;
        }

        Rekord.debug( Rekord.Debugs.HASMANYTHRU_NINJA_SAVE, relator, model, this, relation );

        relator.sort( relation );
        relator.checkSave( relation );
      },

      onChange: function()
      {
        if ( relation.saving )
        {
          return;
        }

        if ( relator.where && !relator.where( this ) )
        {
          relator.removeModel( relation, this );
        }
      },

      onThroughRemoved: function() // this = through removed
      {
        Rekord.debug( Rekord.Debugs.HASMANYTHRU_NINJA_THRU_REMOVE, relator, model, this, relation );

        relator.removeModelFromThrough( relation, this );
      }

    };

    // Populate the model's key if it's missing
    model.$on( Model.Events.PostSave, this.postSave, this );
    model.$on( Model.Events.PreRemove, this.preRemove, this );

    // When models are added to the related database, check if it's related to this model
    if ( this.listenForRelated )
    {
      throughDatabase.on( Database.Events.ModelAdded, this.handleModelAdded( relation ), this );
    }

    // If the model's initial value is an array, populate the relation from it!
    if ( isArray( initialValue ) )
    {
      Rekord.debug( Rekord.Debugs.HASMANYTHRU_INITIAL, this, model, relation, initialValue );

      this.grabModels( relation, initialValue, this.handleModel( relation, remoteData ), remoteData );
    }
    else if ( this.query )
    {
      relation.query = this.executeQuery( model );
    }
    else if ( this.loadRelated )
    {
      Rekord.debug( Rekord.Debugs.HASMANYTHRU_INITIAL_PULLED, this, model, relation );

      throughDatabase.ready( this.handleLazyLoad( relation ), this );
    }

    // We only need to set the property once since the underlying array won't change.
    this.setProperty( relation );
  }),

  sync: function(model, removeUnrelated)
  {
    var throughDatabase = this.through.Database;
    var relation = model.$relations[ this.name ];

    if ( relation )
    {
      var existing = relation.throughs.values;
      var remoteData = true;
      var relator = this;

      var onRelated = function(throughs)
      {
        if ( removeUnrelated )
        {
          var given = this.createCollection();
          given.reset( throughs );

          for (var i = 0; i < existing.length; i++)
          {
            var existingThrough = existing[ i ];

            if ( !given.has( existingThrough.$key() ) )
            {
              relator.removeModelFromThrough( relation, existingThrough, remoteData );
            }
          }
        }
      };

      throughDatabase.ready( this.handleLazyLoad( relation, onRelated ), this );
    }
  },

  preClone: function(model, clone, properties)
  {
    var related = this.get( model );

    if ( related )
    {
      clone[ this.name ] = related.slice();
    }
  },

  postSave: function(model)
  {
    var relation = model.$relations[ this.name ];

    batchExecute(function()
    {
      if ( relation && this.cascadeSave )
      {
        var throughs = relation.throughs.values;

        for (var i = 0; i < throughs.length; i++)
        {
          var through = throughs[ i ];

          if ( !through.$isDeleted() && through.$hasChanges() )
          {
            through.$save( this.cascadeSave, this.cascadeSaveOptions );
          }
        }
      }

      if ( relation && this.cascadeSaveRelated )
      {
        Rekord.debug( Rekord.Debugs.HASMANYTHRU_PRESAVE, this, model, relation );

        relation.saving = true;
        relation.delaySaving = true;

        var models = relation.related;

        for (var i = 0; i < models.length; i++)
        {
          var related = models[ i ];

          if ( !related.$isDeleted() && related.$hasChanges() )
          {
            related.$save( this.cascadeSaveRelated, this.cascadeSaveRelatedOptions );
          }
        }

        relation.saving = false;
        relation.delaySaving = false;
      }

    }, this );
  },

  preRemove: function(model)
  {
    var relation = model.$relations[ this.name ];

    if ( relation && this.cascadeRemove )
    {
      Rekord.debug( Rekord.Debugs.HASMANYTHRU_PREREMOVE, this, model, relation );

      batchExecute(function()
      {
        this.bulk( relation, function()
        {
          var throughs = relation.throughs.values;

          for (var i = 0; i < throughs.length; i++)
          {
            var through = throughs[ i ];

            through.$remove( this.cascadeRemove, this.cascadeRemoveThroughOptions );
          }
        });

      }, this );
    }
  },

  handleModelAdded: function(relation)
  {
    return function (through, remoteData)
    {
      if ( relation.isRelated( through ) && !relation.throughs.has( through.$key() ) )
      {
        Rekord.debug( Rekord.Debugs.HASMANYTHRU_NINJA_ADD, this, relation, through );

        this.addModelFromThrough( relation, through, remoteData );
      }
    };
  },

  handleLazyLoad: function(relation, onRelated)
  {
    return function (throughDatabase)
    {
      var throughs = throughDatabase.filter( relation.isRelated );

      Rekord.debug( Rekord.Debugs.HASMANYTHRU_LAZY_LOAD, this, relation, throughs );

      if ( onRelated )
      {
        onRelated.call( this, throughs );
      }

      if ( throughs.length )
      {
        this.bulk( relation, function()
        {
          for (var i = 0; i < throughs.length; i++)
          {
            this.addModelFromThrough( relation, throughs[ i ] );
          }
        });
      }
      else if ( this.query )
      {
        relation.query = this.executeQuery( relation.parent );
      }
    };
  },

  addModel: function(relation, related, remoteData)
  {
    if ( related.$isDeleted() || (this.where && !this.where( related ) ) )
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
    var relatedKey = relatedDatabase.keyHandler.buildKey( through, this.foreign );

    relatedDatabase.grabModel( relatedKey, this.onAddModelFromThrough( relation, through, remoteData ), this, remoteData );
  },

  onAddModelFromThrough: function(relation, through, remoteData)
  {
    return function onAddModelFromThrough(related)
    {
      if ( related && ( !this.where || this.where( related ) ) )
      {
        this.finishAddThrough( relation, through, remoteData );
        this.finishAddModel( relation, related, remoteData );
      }
    };
  },

  finishAddThrough: function(relation, through, remoteData)
  {
    var model = relation.parent;
    var throughs = relation.throughs;
    var throughKey = through.$key();
    var added = !throughs.has( throughKey );

    if ( added )
    {
      Rekord.debug( Rekord.Debugs.HASMANYTHRU_THRU_ADD, this, relation, through );

      throughs.put( throughKey, through );

      through.$on( Model.Events.Removed, relation.onThroughRemoved );

      through.$dependents.add( model, this );

      if ( !remoteData && this.cascadeSave )
      {
        if ( model.$isSaved() )
        {
          through.$save( this.cascadeSave, this.cascadeSaveOptions );
        }
        else
        {
          through.$save( Cascade.None );
        }
      }
    }

    return added;
  },

  finishAddModel: function(relation, related, remoteData)
  {
    var relateds = relation.related;
    var relatedKey = related.$key();
    var adding = !relateds.has( relatedKey );

    if ( adding )
    {
      Rekord.debug( Rekord.Debugs.HASMANYTHRU_ADD, this, relation, related );

      relateds.put( relatedKey, related );

      related.$on( Model.Events.Removed, relation.onRemoved );
      related.$on( Model.Events.SavedRemoteUpdate, relation.onSaved );

      if ( this.where )
      {
        related.$on( Model.Events.Change, relation.onChange );
      }

      this.sort( relation );

      if ( !remoteData )
      {
        this.checkSave( relation );
      }
    }

    return adding;
  },

  removeModel: function(relation, related, remoteData)
  {
    var relatedKey = related.$key();
    var relateds = relation.related;
    var actualRelated = relateds.get( relatedKey );

    if ( actualRelated )
    {
      if ( this.removeThrough( relation, related, remoteData ) )
      {
        this.finishRemoveRelated( relation, relatedKey, remoteData );
      }
    }
  },

  removeThrough: function(relation, related, remoteData)
  {
    var throughDatabase = this.through.Database;
    var keyObject = this.createThroughKey( relation, related );
    var key = throughDatabase.keyHandler.getKey( keyObject );
    var throughs = relation.throughs;
    var through = throughs.get( key );

    return this.finishRemoveThrough( relation, through, related, true, remoteData );
  },

  removeModelFromThrough: function(relation, through, remoteData)
  {
    var relatedDatabase = this.model.Database;
    var relatedKey = relatedDatabase.keyHandler.buildKey( through, this.foreign );

    if ( this.finishRemoveThrough( relation, through, undefined, undefined, remoteData ) )
    {
      this.finishRemoveRelated( relation, relatedKey, remoteData );
    }
  },

  finishRemoveThrough: function(relation, through, related, callRemove, remoteData)
  {
    var model = relation.parent;
    var removing = !!through;

    if ( removing )
    {
      if ( !this.canRemoveRelated( through, remoteData ) )
      {
        return false;
      }

      Rekord.debug( Rekord.Debugs.HASMANYTHRU_THRU_REMOVE, this, relation, through, related );

      var throughs = relation.throughs;
      var throughKey = through.$key();

      through.$off( Model.Events.Removed, relation.onThroughRemoved );

      through.$dependents.remove( model );

      if ( callRemove )
      {
        through.$remove( remoteData ? Cascade.Local : Cascade.All, this.cascadeRemoveThroughOptions );
      }

      throughs.remove( throughKey );
    }

    return removing;
  },

  finishRemoveRelated: function(relation, relatedKey, remoteData)
  {
    var pending = relation.pending;
    var relateds = relation.related;
    var related = relateds.get( relatedKey );

    if ( related )
    {
      Rekord.debug( Rekord.Debugs.HASMANYTHRU_REMOVE, this, relation, related );

      relateds.remove( relatedKey );

      related.$off( Model.Events.Removed, relation.onRemoved );
      related.$off( Model.Events.SavedRemoteUpdate, relation.onSaved );
      related.$off( Model.Events.Change, relation.onChange );

      this.sort( relation );
      this.checkSave( relation, remoteData );
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

  createThroughKey: function(relation, related)
  {
    var model = relation.parent;
    var modelKeys = model.$db.keyHandler;
    var relatedKeys = this.model.Database.keyHandler;
    var throughDatabase = this.through.Database;
    var throughKey = throughDatabase.key;
    var key = {};

    for (var i = 0; i < throughKey.length; i++)
    {
      var prop = throughKey[ i ];

      modelKeys.setKeyField( key, prop, related, this.foreign );
      relatedKeys.setKeyField( key, prop, model, this.local );
    }

    return key;
  },

  getTargetFields: function(target)
  {
    return this.local;
  }

});
