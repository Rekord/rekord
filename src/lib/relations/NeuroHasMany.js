function NeuroHasMany()
{
}

Neuro.Relations.hasMany = NeuroHasMany;

NeuroHasMany.Defaults = 
{
  model:                null,
  lazy:                 false,
  query:                false,
  store:                Neuro.Store.None,
  save:                 Neuro.Save.None,
  auto:                 true,
  property:             true,
  dynamic:              false,
  foreign:              null,
  comparator:           null,
  comparatorNullsFirst: false,
  cascadeRemove:        Neuro.Cascade.Local,
  cascadeSave:          Neuro.Cascade.None,
  discriminator:        'discriminator',
  discriminators:       {},
  discriminatorToModel: {}
};

extend( NeuroRelationMultiple, NeuroHasMany, 
{

  type: 'hasMany',

  debugAutoSave:        Neuro.Debugs.HASMANY_AUTO_SAVE,
  debugInitialGrabbed:  Neuro.Debugs.HASMANY_INITIAL_GRABBED,
  debugSort:            Neuro.Debugs.HASMANY_SORT,
  debugQuery:           Neuro.Debugs.HASMANY_QUERY,
  debugQueryResults:    Neuro.Debugs.HASMANY_QUERY_RESULTS,

  getDefaults: function(database, field, options)
  {
    return NeuroHasMany.Defaults;
  },

  onInitialized: function(database, field, options)
  {
    this.foreign = this.foreign || ( database.name + '_' + database.key );
    this.comparator = createComparator( this.comparator, this.comparatorNullsFirst );
    this.clearKey = this.ownsForeignKey();

    Neuro.debug( Neuro.Debugs.HASMANY_INIT, this );

    this.finishInitialization();
  },

  handleLoad: function(model, remoteData)
  {
    var relator = this;
    var initial = model[ this.name ];
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
        Neuro.debug( Neuro.Debugs.HASMANY_NINJA_REMOVE, relator, model, this, relation );

        relator.removeModel( relation, this, true );
      },

      onSaved: function() // this = model saved
      {
        if ( relation.saving )
        {
          return;
        }

        Neuro.debug( Neuro.Debugs.HASMANY_NINJA_SAVE, relator, model, this, relation );

        if ( !relation.isRelated( this ) )
        {
          relator.removeModel( relation, this );
        }
        else
        {
          relator.sort( relation );
          relator.checkSave( relation );
        }
      }

    };

    // Populate the model's key if it's missing
    model.$key();
    model.$on( NeuroModel.Events.PostSave, this.postSave, this );
    model.$on( NeuroModel.Events.PreRemove, this.preRemove, this );

    // When models are added to the related database, check if it's related to this model
    this.listenToModelAdded( this.handleModelAdded( relation ) );

    // If the model's initial value is an array, populate the relation from it!
    if ( isArray( initial ) )
    {
      Neuro.debug( Neuro.Debugs.HASMANY_INITIAL, this, model, relation, initial );

      this.grabModels( initial, this.handleModel( relation ), remoteData );
    }
    else if ( this.query )
    {
      this.executeQuery( model );
    }
    else
    {
      Neuro.debug( Neuro.Debugs.HASMANY_INITIAL_PULLED, this, model, relation );

      this.ready( this.handleLazyLoad( relation ) );
    }

    // We only need to set the property once since the underlying array won't change.
    this.setProperty( relation );
  },

  postSave: function(model)
  {
    var relation = model.$relations[ this.name ];

    if ( relation && this.cascadeSave )
    {
      Neuro.debug( Neuro.Debugs.HASMANY_POSTSAVE, this, model, relation );

      relation.saving = true;
      relation.delaySaving = true;

      var models = relation.related;

      for (var i = 0; i < models.length; i++)
      {
        var related = models[ i ];

        if ( !related.$isDeleted() && related.$hasChanges() )
        {
          related.$save( this.cascadeSave );
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
      Neuro.debug( Neuro.Debugs.HASMANY_PREREMOVE, this, model, relation );

      this.bulk( relation, function()
      {
        var models = relation.related;

        for (var i = models.length - 1; i >= 0; i--)
        {
          var related = models[ i ];

          related.$remove( this.cascadeRemove );
        }
      });
    }
  },

  handleModelAdded: function(relation)
  {
    return function (related, remoteData)
    {
      if ( relation.isRelated( related ) )
      {
        Neuro.debug( Neuro.Debugs.HASMANY_NINJA_ADD, this, relation, related );

        this.addModel( relation, related, remoteData );
      }
    };
  },

  handleLazyLoad: function(relation)
  {
    return function (relatedDatabase)
    {
      var related = relatedDatabase.models.filter( relation.isRelated );

      Neuro.debug( Neuro.Debugs.HASMANY_LAZY_LOAD, this, relation, related );

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
        this.executeQuery( relation.parent );
      }
    };
  },

  addModel: function(relation, related, remoteData)
  {
    if ( related.$isDeleted() )
    {
      return;
    }

    var model = relation.parent;
    var target = relation.related;
    var key = related.$key();
    var adding = !target.has( key );

    if ( adding )
    { 
      Neuro.debug( Neuro.Debugs.HASMANY_ADD, this, relation, related );

      target.put( key, related );

      related.$on( NeuroModel.Events.Removed, relation.onRemoved );
      related.$on( NeuroModel.Events.SavedRemoteUpdate, relation.onSaved );

      related.$dependents[ model.$uid() ] = model;

      this.updateForeignKey( model, related, remoteData );

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
    var model = relation.parent;
    var target = relation.related;
    var pending = relation.pending;
    var key = related.$key();

    if ( target.has( key ) )
    {
      Neuro.debug( Neuro.Debugs.HASMANY_REMOVE, this, relation, related );

      target.remove( key );

      related.$off( NeuroModel.Events.Removed, relation.onRemoved );
      related.$off( NeuroModel.Events.SavedRemoteUpdate, relation.onSaved );

      delete related.$dependents[ model.$uid() ];

      if ( !alreadyRemoved && this.cascadeRemove )
      {
        related.$remove( this.cascadeRemove );
      }
      
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

  updateForeignKey: function(model, related, remoteData)
  {
    var foreign = this.foreign;
    var local = model.$db.key;

    this.updateFields( related, foreign, model, local, remoteData );
  },

  clearForeignKey: function(related, cascade)
  {
    if ( this.clearKey )
    {
      var foreign = this.foreign;

      this.clearFields( related, foreign, false, cascade );
    }
  },

  isRelatedFactory: function(model)
  {
    var foreign = this.foreign;
    var local = model.$db.key;

    return function(related)
    {
      return propsMatch( related, foreign, model, local );
    };
  }

});