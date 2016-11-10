
function Relation()
{

}

Rekord.Relations = {};

Relation.Defaults =
{
  model:                null,
  lazy:                 false,
  store:                Store.None,
  save:                 Save.None,
  auto:                 true,
  property:             true,
  preserve:             true,
  clearKey:             true,
  dynamic:              false,
  discriminator:        'discriminator',
  discriminators:       {},
  discriminatorToModel: {}
};

Class.create( Relation,
{

  debugQuery: null,
  debugQueryResults: null,

  getDefaults: function(database, field, options)
  {
    return Relation.Defaults;
  },

  /**
   * Initializes this relation with the given database, field, and options.
   *
   * @param  {Rekord.Database} database [description]
   * @param  {String} field    [description]
   * @param  {Object} options  [description]
   */
  init: function(database, field, options)
  {
    applyOptions( this, options, this.getDefaults( database, field, options ) );

    this.database = database;
    this.name = field;
    this.options = options;
    this.initialized = false;
    this.property = this.property || (indexOf( database.fields, this.name ) !== false);
    this.discriminated = !isEmpty( this.discriminators );

    if ( this.discriminated )
    {
      if ( !Polymorphic )
      {
        throw 'Polymorphic feature is required to use the discriminated option.';
      }

      Class.props( this, Polymorphic );
    }

    this.setReferences( database, field, options );
  },

  setReferences: function(database, field, options)
  {
    if ( !isRekord( this.model ) )
    {
      Rekord.get( this.model ).complete( this.setModelReference( database, field, options ), this );
    }
    else
    {
      this.onInitialized( database, field, options );
    }
  },

  /**
   *
   */
  setModelReference: function(database, field, options)
  {
    return function(rekord)
    {
      this.model = rekord;

      this.onInitialized( database, field, options );
    };
  },

  /**
   *
   */
  onInitialized: function(database, fields, options)
  {

  },

  finishInitialization: function()
  {
    this.initialized = true;
    this.load.open();
  },

  /**
   * Loads the model.$relation variable with what is necessary to get, set,
   * relate, and unrelate models. If property is true, look at model[ name ]
   * to load models/keys. If it contains values that don't exist or aren't
   * actually related
   *
   * @param  {Rekord.Model} model [description]
   */

  load: Gate(function(model, initialValue, remoteData)
  {

  }),

  set: function(model, input, remoteData)
  {

  },

  relate: function(model, input, remoteData)
  {

  },

  unrelate: function(model, input, remoteData)
  {

  },

  sync: function(model, removeUnrelated)
  {

  },

  isRelated: function(model, input)
  {

  },

  preClone: function(model, clone, properties)
  {

  },

  postClone: function(model, clone, properties)
  {

  },

  get: function(model)
  {
    return model.$relations[ this.name ].related;
  },

  encode: function(model, out, forSaving)
  {
    var relation = model.$relations[ this.name ];
    var mode = forSaving ? this.save : this.store;

    if ( relation && mode )
    {
      var related = relation.related;

      if ( isArray( related ) )
      {
        out[ this.name ] = this.getStoredArray( related, mode );
      }
      else // if ( isObject( related ) )
      {
        out[ this.name ] = this.getStored( related, mode );
      }
    }
  },

  ready: function(callback)
  {
    this.model.Database.ready( callback, this );
  },

  listenToModelAdded: function(callback)
  {
    this.model.Database.on( Database.Events.ModelAdded, callback, this );
  },

  executeQuery: function(model)
  {
    if ( !Search )
    {
      throw 'Search feature is required to use the query option.';
    }

    var queryOption = this.query;
    var queryOptions = this.queryOptions;
    var queryData = this.queryData;
    var query = isString( queryOption ) ? format( queryOption, model ) : queryOption;
    var search = this.model.search( query, queryOptions, queryData );

    Rekord.debug( this.debugQuery, this, model, search, queryOption, query, queryData );

    var promise = search.$run();

    promise.complete( this.handleExecuteQuery( model ), this );

    return search;
  },

  handleExecuteQuery: function(model)
  {
    return function onExecuteQuery(search)
    {
      var results = search.$results;

      Rekord.debug( this.debugQueryResults, this, model, search );

      for (var i = 0; i < results.length; i++)
      {
        this.relate( model, results[ i ], true );
      }
    };
  },

  createRelationCollection: function(model)
  {
    return RelationCollection.create( this.model.Database, model, this );
  },

  createCollection: function(initial)
  {
    return ModelCollection.create( this.model.Database, initial );
  },

  parseModel: function(input, remoteData)
  {
    return this.model.Database.parseModel( input, remoteData );
  },

  grabInitial: function( model, fields )
  {
    if ( hasFields( model, fields, isValue ) )
    {
      return pull( model, fields );
    }
  },

  grabModel: function(input, callback, remoteData)
  {
    this.model.Database.grabModel( input, callback, this, remoteData );
  },

  grabModels: function(relation, initial, callback, remoteData)
  {
    var db = this.model.Database;

    for (var i = 0; i < initial.length; i++)
    {
      var input = initial[ i ];
      var key = db.keyHandler.buildKeyFromInput( input );

      relation.pending[ key ] = true;

      if ( input instanceof Model )
      {
        callback.call( this, input );
      }
      else
      {
        db.grabModel( input, callback, this, remoteData );
      }
    }
  },

  buildKey: function(input)
  {

  },

  setProperty: function(relation)
  {
    if ( this.property )
    {
      var model = relation.parent;
      var propertyName = this.name;
      var applied = !!relation.dynamicSet;

      if ( !applied && this.dynamic && Object.defineProperty )
      {
        var relator = this;

        Object.defineProperty( model, propertyName,
        {
          enumerable: true,

          set: function(input)
          {
            relator.set( model, input );
          },
          get: function()
          {
            return relation.related;
          }
        });

        applied = relation.dynamicSet = true;
      }

      if ( !applied )
      {
        model[ propertyName ] = relation.related;
      }

      if ( relation.lastRelated !== relation.related )
      {
        model.$trigger( Model.Events.RelationUpdate, [this, relation] );

        relation.lastRelated = relation.related;
      }
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
      return true;
    }

    if ( relatedKey.length !== input.length )
    {
      return true;
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

  clearFields: function(target, targetFields, remoteData, cascade)
  {
    var changes = clearFieldsReturnChanges( target, targetFields );

    if ( changes && !remoteData && this.auto && !target.$isNew() )
    {
      target.$save( cascade );
    }

    return changes;
  },

  updateFields: function(target, targetFields, source, sourceFields, remoteData)
  {
    var changes = updateFieldsReturnChanges( target, targetFields, source, sourceFields );

    if ( changes )
    {
      if ( this.auto && !target.$isNew() && !remoteData )
      {
        target.$save();
      }

      target.$trigger( Model.Events.KeyUpdate, [target, source, targetFields, sourceFields] );
    }

    return changes;
  },

  updateForeignKey: function(target, source, remoteData)
  {
    var targetFields = this.getTargetFields( target );
    var sourceFields = this.getSourceFields( source );
    var targetKey = target.$key();
    var targetKeyHandler = target.$db.keyHandler;
    var keyChanges = target.$db.keyChanges;

    Rekord.debug( this.debugUpdateKey, this, target, targetFields, source, sourceFields );

    this.updateFields( target, targetFields, source, sourceFields, remoteData );

    if ( keyChanges && remoteData )
    {
      var targetNewKey = targetKeyHandler.getKey( target, true );

      if ( targetKeyHandler.inKey( targetFields ) && targetNewKey !== targetKey )
      {
        target.$setKey( targetNewKey, true );
      }
    }
  },

  clearForeignKey: function(related, remoteData)
  {
    var key = this.getTargetFields( related );

    Rekord.debug( this.debugClearKey, this, related, key );

    this.clearFields( related, key, remoteData );
  },

  getTargetFields: function(target)
  {
    return target.$db.key;
  },

  getSourceFields: function(source)
  {
    return source.$db.key;
  },

  getStoredArray: function(relateds, mode)
  {
    if ( !mode )
    {
      return null;
    }

    var stored = [];

    for (var i = 0; i < relateds.length; i++)
    {
      var related = this.getStored( relateds[ i ], mode );

      if ( related !== null )
      {
        stored.push( related );
      }
    }

    return stored;
  },

  getStored: function(related, mode)
  {
    if ( related )
    {
      switch (mode)
      {
      case Save.Model:
        return related.$toJSON( true );

      case Store.Model:
        if ( related.$local )
        {
          return related.$local;
        }

        var local = related.$toJSON( false );

        if ( related.$saved )
        {
          local.$saved = related.$saved;
        }

        return local;

      case Save.Key:
      case Store.Key:
        return related.$key();

      case Save.Keys:
      case Store.Keys:
        return related.$keys();

      }
    }

    return null;
  }

});
