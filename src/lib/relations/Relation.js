
function Relation()
{

}

Neuro.Relations = {};

Relation.Defaults =
{
  model:                null,
  lazy:                 false,
  store:                Neuro.Store.None,
  save:                 Neuro.Save.None,
  auto:                 true,
  property:             true,
  preserve:             true,
  dynamic:              false,
  discriminator:        'discriminator',
  discriminators:       {},
  discriminatorToModel: {}
};

Relation.prototype =
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
   * @param  {Neuro.Database} database [description]
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
      transfer( Polymorphic, this );
    }

    this.setReferences( database, field, options );
  },

  setReferences: function(database, field, options)
  {
    if ( !isNeuro( this.model ) )
    {
      Neuro.get( this.model, this.setModelReference( database, field, options ), this );
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
    return function(neuro)
    {
      this.model = neuro;

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
   * @param  {Neuro.Model} model [description]
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

  unrelate: function(model, input)
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
    var queryOption = this.query;
    var query = isString( queryOption ) ? format( queryOption, model ) : queryOption;
    var remoteQuery = this.model.query( query );

    Neuro.debug( this.debugQuery, this, model, remoteQuery, queryOption, query );

    remoteQuery.ready( this.handleExecuteQuery( model ), this );

    return remoteQuery;
  },

  handleExecuteQuery: function(model)
  {
    return function onExecuteQuery(remoteQuery)
    {
      Neuro.debug( this.debugQueryResults, this, model, remoteQuery );

      for (var i = 0; i < remoteQuery.length; i++)
      {
        this.relate( model, remoteQuery[ i ], true );
      }
    };
  },

  createRelationCollection: function(model)
  {
    return new RelationCollection( this.model.Database, model, this );
  },

  createCollection: function()
  {
    return new ModelCollection( this.model.Database );
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
      var key = db.buildKeyFromInput( input );

      relation.pending[ key ] = true;

      db.grabModel( input, callback, this, remoteData );
    }
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
        relation.lastRelated = relation.related;

        model.$trigger( Model.Events.RelationUpdate, [this, relation] );
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
    var changes = this.clearFieldsReturnChanges( target, targetFields );

    if ( changes && !remoteData && this.auto && !target.$isNew() )
    {
      target.$save( cascade );
    }

    return changes;
  },

  clearFieldsReturnChanges: function(target, targetFields)
  {
    var changes = false;

    if ( isString( targetFields ) )
    {
      if ( target[ targetFields ] )
      {
        target[ targetFields ] = null;
        changes = true;
      }
    }
    else // isArray ( targetFields )
    {
      for (var i = 0; i < targetFields.length; i++)
      {
        var targetField = targetFields[ i ];

        if ( target[ targetField ] )
        {
          target[ targetField ] = null;
          changes = true;
        }
      }
    }

    return changes;
  },

  updateFields: function(target, targetFields, source, sourceFields, remoteData)
  {
    var changes = this.updateFieldsReturnChanges( target, targetFields, source, sourceFields );

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

  updateFieldsReturnChanges: function(target, targetFields, source, sourceFields)
  {
    var changes = false;

    if ( isString( targetFields ) ) // && isString( sourceFields )
    {
      var targetValue = target[ targetFields ];
      var sourceValue = source[ sourceFields ];

      if ( !equals( targetValue, sourceValue ) )
      {
        target[ targetFields ] = sourceValue;
        changes = true;
      }
    }
    else // if ( isArray( targetFields ) && isArray( sourceFields ) )
    {
      for (var i = 0; i < targetFields.length; i++)
      {
        var targetField = targetFields[ i ];
        var targetValue = target[ targetField ];
        var sourceField = sourceFields[ i ];
        var sourceValue = source[ sourceField ];

        if ( !equals( targetValue, sourceValue ) )
        {
          target[ targetField ] = copy( sourceValue );
          changes = true;
        }
      }
    }

    return changes;
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
      case Neuro.Save.Model:
        return related.$toJSON( true );

      case Neuro.Store.Model:
        if ( related.$local )
        {
          return related.$local;
        }
        else
        {
          var local = related.$toJSON( false );

          if ( related.$saved )
          {
            local.$saved = related.$saved;
          }

          return local;
        }

      case Neuro.Save.Key:
      case Neuro.Store.Key:
        return related.$key();

      case Neuro.Save.Keys:
      case Neuro.Store.Keys:
        return related.$keys();

      }
    }

    return null;
  }

};
