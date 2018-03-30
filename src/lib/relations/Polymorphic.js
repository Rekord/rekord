
var Polymorphic =
{

  setReferences: function(database, field, options)
  {
    this.isRelatedFactory = this.isRelatedDiscriminatedFactory( this.isRelatedFactory );

    this.loadDiscriminators(function()
    {
      this.onInitialized( database, field, options );
    });
  },

  isRelatedDiscriminatedFactory: function(isRelatedFactory)
  {
    return function (model)
    {
      var isRelated = isRelatedFactory.call( this, model );
      var discriminatorField = this.discriminator;

      if (this.hasDiscriminator)
      {
        return function(related)
        {
          if ( !isRelated( related ) )
          {
            return false;
          }

          var discriminator = this.getDiscriminatorForModel( related );

          return equals( discriminator, model[ discriminatorField ] );
        };
      }
      else
      {
        var discriminator = this.getDiscriminatorForModel( model );

        return function (related)
        {
          if ( !isRelated( related ) )
          {
            return false;
          }

          return equals( discriminator, related[ discriminatorField ] );
        };
      }
    };
  },

  loadDiscriminators: function(onLoad)
  {
    var discriminators = this.discriminators;
    var total = sizeof( discriminators );
    var loaded = 0;

    function handleLoaded()
    {
      if ( ++loaded === total )
      {
        onLoad.apply( this );
      }
    }

    for (var name in discriminators)
    {
      var discriminator = discriminators[ name ];

      Rekord.get( name ).complete( this.setDiscriminated( discriminator, handleLoaded ), this );
    }
  },

  setDiscriminated: function(discriminator, onLoad)
  {
    return function(rekord)
    {
      this.discriminators[ rekord.Database.name ] = discriminator;
      this.discriminators[ rekord.Database.className ] = discriminator;
      this.discriminatorToModel[ discriminator ] = rekord;

      onLoad.apply( this );
    };
  },

  createRelationCollection: function(model)
  {
    return DiscriminateCollection( RelationCollection.create( undefined, model, this ), this.discriminator, this.discriminatorToModel );
  },

  createCollection: function()
  {
    return DiscriminateCollection( ModelCollection.create(), this.discriminator, this.discriminatorToModel );
  },

  ready: function(callback)
  {
    var models = this.discriminatorToModel;

    for ( var prop in models )
    {
      var model = models[ prop ];

      model.Database.ready( callback, this );
    }
  },

  listenToModelAdded: function(callback)
  {
    var models = this.discriminatorToModel;

    for ( var prop in models )
    {
      var model = models[ prop ];

      model.Database.on( Database.Events.ModelAdded, callback, this );
    }
  },

  executeQuery: function(model)
  {
    var queryOption = this.query;
    var queryOptions = this.queryOptions;
    var queryData = this.queryData;
    var query = isString( queryOption ) ? format( queryOption, model ) : queryOption;
    var search = model.search( query, queryOptions );

    if ( isObject( queryData ) )
    {
      search.$set( queryData );
    }

    DiscriminateCollection( search.$results, this.discriminator, this.discriminatorToModel );

    var promise = search.$run();
    promise.complete( this.handleExecuteQuery( model ), this );

    return search;
  },

  parseModel: function(input, remoteData, relation)
  {
    if ( input instanceof Model )
    {
      return input;
    }
    else if ( isObject( input ) )
    {
      var db = this.hasDiscriminator ?
        this.getDiscriminatorDatabase( relation.parent ) :
        this.getDiscriminatorDatabase( input );

      if ( db )
      {
        return db.parseModel( input, remoteData );
      }
    }

    return false;
  },

  clearFields: function(target, targetFields, remoteData)
  {
    var changes = clearFieldsReturnChanges( target, targetFields );

    if ( target[ this.discriminator ] )
    {
      target[ this.discriminator ] = null;
      changes = true;
    }

    if ( changes && !remoteData && this.auto && !target.$isNew() )
    {
      target.$save( this.autoCascade, this.autoOptions );
    }

    return changes;
  },

  updateFields: function(target, targetFields, source, sourceFields, remoteData)
  {
    var changes = updateFieldsReturnChanges( target, targetFields, source, sourceFields );

    var targetField = this.discriminator;
    var targetValue = target[ targetField ];
    var sourceValue = this.getDiscriminatorForModel( source );

    if ( !equals( targetValue, sourceValue ) )
    {
      target[ targetField ] = sourceValue;
      changes = true;
    }

    if ( changes )
    {
      if ( this.auto && !target.$isNew() && !remoteData )
      {
        target.$save( this.autoCascade, this.autoOptions );
      }

      target.$trigger( Model.Events.KeyUpdate, [target, source, targetFields, sourceFields] );
    }

    return changes;
  },

  grabInitial: function( model, fields )
  {
    if ( this.hasDiscriminator && hasFields( model, fields, isValue ) )
    {
      var related = this.getDiscriminatorDatabase( model );

      if ( related )
      {
        var initial = {};

        updateFieldsReturnChanges( initial, related.key, model, fields );

        return initial;
      }
    }
  },

  grabModel: function(input, callback, remoteData, relation)
  {
    if ( input instanceof Model )
    {
      callback.call( this, input );
    }
    // At the moment I don't think this will ever work - if we are given a plain
    // object we can't really determine the related database.
    else if ( isObject( input ) )
    {
      var db = this.hasDiscriminator ?
        this.getDiscriminatorDatabase( relation.parent ) :
        this.getDiscriminatorDatabase( input );

      if ( db !== false )
      {
        db.grabModel( input, callback, this, remoteData );
      }
    }
  },

  grabModels: function(relation, initial, callback, remoteData)
  {
    for (var i = 0; i < initial.length; i++)
    {
      var input = initial[ i ];

      if ( input instanceof Model )
      {
        relation.pending[ input.$key() ] = true;

        callback.call( this, input );
      }
      // At the moment I don't think this will ever work - if we are given a plain
      // object we can't really determine the related database.
      else if ( isObject( input ) )
      {
        var db = this.getDiscriminatorDatabase( input );

        if ( db )
        {
          var key = db.keyHandler.buildKeyFromInput( input );

          relation.pending[ key ] = true;

          db.grabModel( input, callback, this, remoteData );
        }
      }
    }
  },

  ownsForeignKey: function()
  {
    return true;
  },

  isModelArray: function(input)
  {
    return isArray( input );
  },

  getDiscriminator: function(model)
  {
    return model[ this.discriminator ];
  },

  getDiscriminatorDatabase: function(model)
  {
    var discriminator = this.getDiscriminator( model );
    var model = this.discriminatorToModel[ discriminator ];

    return model ? model.Database : false;
  },

  getDiscriminatorForModel: function(model)
  {
    return this.discriminators[ model.$db.name ];
  }

};
