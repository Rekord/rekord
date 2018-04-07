function HasMany()
{
}

Rekord.Relations.hasMany = HasMany;

HasMany.Defaults =
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
  preserve:             true,
  clearKey:             true,
  dynamic:              false,
  foreign:              null,
  comparator:           null,
  comparatorNullsFirst: false,
  listenForRelated:     true,
  loadRelated:          true,
  where:                false,
  saveParentCascade:    Cascade.All,
  saveParentOptions:    null,
  cascadeRemove:        Cascade.Local,
  cascadeRemoveOptions: null,
  cascadeSave:          Cascade.None,
  cascadeSaveOptions:   null,
  discriminator:        'discriminator',
  discriminators:       {},
  discriminatorToModel: {}
};

Class.extend( RelationMultiple, HasMany,
{

  type: 'hasMany',

  debugAutoSave:        Rekord.Debugs.HASMANY_AUTO_SAVE,
  debugInitialGrabbed:  Rekord.Debugs.HASMANY_INITIAL_GRABBED,
  debugSort:            Rekord.Debugs.HASMANY_SORT,
  debugQuery:           Rekord.Debugs.HASMANY_QUERY,
  debugQueryResults:    Rekord.Debugs.HASMANY_QUERY_RESULTS,
  debugUpdateKey:       Rekord.Debugs.HASMANY_UPDATE_KEY,

  getDefaults: function(database, field, options)
  {
    return HasMany.Defaults;
  },

  onInitialized: function(database, field, options)
  {
    this.foreign = this.foreign || ( database.name + '_' + database.key );
    this.comparator = createComparator( this.comparator, this.comparatorNullsFirst );

    Rekord.debug( Rekord.Debugs.HASMANY_INIT, this );

    this.finishInitialization();
  },

  load: Gate(function(model, initialValue, remoteData)
  {
    var relator = this;
    var relation = model.$relations[ this.name ] =
    {
      parent: model,
      pending: {},
      isRelated: this.isRelatedFactory( model ),
      related: this.createRelationCollection( model ),
      saving: false,
      delaySorting: false,
      delaySaving: false,

      onRemoved: function() // this = model removed
      {
        Rekord.debug( Rekord.Debugs.HASMANY_NINJA_REMOVE, relator, model, this, relation );

        relator.removeModel( relation, this, true, true );
      },

      onSaved: function() // this = model saved
      {
        if ( relation.saving )
        {
          return;
        }

        Rekord.debug( Rekord.Debugs.HASMANY_NINJA_SAVE, relator, model, this, relation );

        if ( !relation.isRelated( this ) )
        {
          relator.removeModel( relation, this, false, true );
        }
        else
        {
          relator.sort( relation );
          relator.checkSave( relation );
        }
      },

      onChange: function()
      {
        if ( relation.saving )
        {
          return;
        }

        if ( relator.where && !relator.where( this, relation ) )
        {
          relator.removeModel( relation, this, false, true );
        }
      }

    };

    model.$on( Model.Events.PostSave, this.postSave, this );
    model.$on( Model.Events.PreRemove, this.preRemove, this );

    // When models are added to the related database, check if it's related to this model
    if ( this.listenForRelated )
    {
      this.listenToModelAdded( this.handleModelAdded( relation ) );
    }

    // If the model's initial value is an array, populate the relation from it!
    this.setInitial( model, initialValue, remoteData );

    // We only need to set the property once since the underlying array won't change.
    this.setProperty( relation );
  }),

  setInitial: function(model, initialValue, remoteData)
  {
    var relation = model.$relations[ this.name ];

    if ( isArray( initialValue ) )
    {
      Rekord.debug( Rekord.Debugs.HASMANY_INITIAL, this, model, relation, initialValue );

      this.grabModels( relation, initialValue, this.handleModel( relation, remoteData ), remoteData );
    }
    else if ( this.query )
    {
      relation.query = this.executeQuery( model );
    }
    else if ( this.loadRelated )
    {
      Rekord.debug( Rekord.Debugs.HASMANY_INITIAL_PULLED, this, model, relation );

      this.ready( this.handleLazyLoad( relation ) );
    }
  },

  sync: function(model, removeUnrelated)
  {
    var relation = model.$relations[ this.name ];

    if ( relation )
    {
      var existing = relation.related;
      var remoteData = true;
      var dontClear = true;
      var relator = this;

      var onRelated = function(related)
      {
        if ( removeUnrelated )
        {
          var given = this.createCollection();
          given.reset( related );

          existing.each(function(existingModel)
          {
            if ( !given.has( existingModel.$key() ) )
            {
              relator.removeModel( relation, existingModel, remoteData, dontClear );
            }
          });
        }
      };

      this.ready( this.handleLazyLoad( relation, onRelated ) );
    }
  },

  postClone: function(model, clone, properties)
  {
    var related = this.get( model );

    if ( related )
    {
      var relatedClones = [];

      updateFieldsReturnChanges( properties, this.foreign, clone, model.$db.key );

      properties[ this.foreign ] = clone[ model.$db.key ];

      for (var i = 0; i < related.length; i++)
      {
        relatedClones.push( related[ i ].$clone( properties ) );
      }

      clone[ this.name ] = relatedClones;
    }
  },

  postSave: function(model)
  {
    var relation = model.$relations[ this.name ];

    if ( relation && this.cascadeSave )
    {
      Rekord.debug( Rekord.Debugs.HASMANY_POSTSAVE, this, model, relation );

      batchExecute(function()
      {
        relation.saving = true;
        relation.delaySaving = true;

        var models = relation.related;

        for (var i = 0; i < models.length; i++)
        {
          var related = models[ i ];

          if ( !related.$isDeleted() && related.$hasChanges() )
          {
            related.$save( this.cascadeSave, this.cascadeSaveOptions );
          }
        }

        relation.saving = false;
        relation.delaySaving = false;

      }, this );
    }
  },

  preRemove: function(model)
  {
    var relation = model.$relations[ this.name ];

    if ( relation && this.cascadeRemove )
    {
      Rekord.debug( Rekord.Debugs.HASMANY_PREREMOVE, this, model, relation );

      batchExecute(function()
      {
        this.bulk( relation, function()
        {
          var models = relation.related;

          for (var i = models.length - 1; i >= 0; i--)
          {
            var related = models[ i ];

            related.$remove( this.cascadeRemove, this.cascadeRemoveOptions );
          }
        });

      }, this );
    }
  },

  handleModelAdded: function(relation)
  {
    return function (related, remoteData)
    {
      if ( relation.isRelated( related ) )
      {
        Rekord.debug( Rekord.Debugs.HASMANY_NINJA_ADD, this, relation, related );

        this.addModel( relation, related, remoteData );
      }
    };
  },

  handleLazyLoad: function(relation, onRelated)
  {
    return function (relatedDatabase)
    {
      var related = relatedDatabase.filter( relation.isRelated );

      Rekord.debug( Rekord.Debugs.HASMANY_LAZY_LOAD, this, relation, related );

      if ( onRelated )
      {
        onRelated.call( this, related );
      }

      if ( related.length )
      {
        this.bulk( relation, function()
        {
          for (var i = 0; i < related.length; i++)
          {
            this.addModel( relation, related[ i ] );
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
    if ( related.$isDeleted() || (this.where && !this.where( related, relation ) ) )
    {
      return;
    }

    var model = relation.parent;
    var target = relation.related;
    var key = related.$key();
    var adding = !target.has( key );

    if ( adding )
    {
      Rekord.debug( Rekord.Debugs.HASMANY_ADD, this, relation, related );

      target.put( key, related );

      related.$on( Model.Events.Removed, relation.onRemoved );
      related.$on( Model.Events.SavedRemoteUpdate, relation.onSaved );

      if ( this.where )
      {
        related.$on( Model.Events.Change, relation.onChange );
      }

      related.$dependents.add( model, this );

      this.updateForeignKey( related, model, remoteData );

      this.sort( relation );
      this.checkSave( relation, remoteData );
    }

    return adding;
  },

  removeModel: function(relation, related, remoteData, dontClear)
  {
    if ( !this.canRemoveRelated( related, remoteData ) )
    {
      return;
    }

    var model = relation.parent;
    var target = relation.related;
    var pending = relation.pending;
    var key = related.$key();
    var removing = target.has( key );

    if ( removing )
    {
      Rekord.debug( Rekord.Debugs.HASMANY_REMOVE, this, relation, related );

      target.remove( key );

      related.$off( Model.Events.Removed, relation.onRemoved );
      related.$off( Model.Events.SavedRemoteUpdate, relation.onSaved );
      related.$off( Model.Events.Change, relation.onChange );

      related.$dependents.remove( model );

      if ( !dontClear )
      {
        if ( this.clearKey )
        {
          this.clearForeignKey( related, remoteData );
        }

        if ( this.cascadeRemove )
        {
          if ( remoteData )
          {
            if ( canCascade( this.cascadeRemove, Cascade.Local ) )
            {
              related.$remove( Cascade.Local );
            }
          }
          else
          {
            related.$remove( this.cascadeRemove, this.cascadeRemoveOptions );
          }
        }
      }

      this.sort( relation );
      this.checkSave( relation, remoteData );
    }

    delete pending[ key ];

    return removing;
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

  getTargetFields: function(target)
  {
    return this.foreign;
  }

});
