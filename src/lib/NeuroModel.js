
function NeuroModel(db)
{
  this.$db = db;

  /**
   * @property {NeuroDatabase} $db
   *           The reference to the database this model is stored in.
   */

  /**
   * @property {Object} [$saved]
   *           An object of encoded data representing the values saved remotely.
   *           If this object does not exist - the model hasn't been created
   *           yet.
   */
  
  /**
   * @property {Boolean} [$deleted]
   *           A flag placed on a model once it's requested to be deleted. A  
   *           model with this flag isn't present on any arrays - it's stored
   *           locally until its successfully removed remotely - then it's 
   *           removed locally.
   */
  
  /**
   * @property {Object} [$local]
   *           The object of encoded data that is stored locally. It's $saved
   *           property is the same object as this $saved property.
   */
  
  /**
   * @property {Boolean} $pendingSave
   *           Whether there is a pending save for this model.
   */
}

NeuroModel.Events = 
{
  Created:          'created',
  Saved:            'saved',
  PartialUpdate:    'partial-update',
  FullUpdate:       'full-update',
  Updated:          'updated',
  Detach:           'detach',
  CreateAndSave:    'created saved',
  UpdateAndSave:    'updated saved',
  KeyUpdate:        'key-update',
  RelationUpdate:   'relation-update',
  Removed:          'removed',
  RemoteUpdate:     'remote-update',
  RemoteRemove:     'remote-remove',
  RemoteAndRemove:  'remote-remove removed',
  SavedRemoteUpdate:'saved remote-update'
};

NeuroModel.prototype =
{

  $init: function(props, exists)
  {
    this.$pendingSave = false;
    this.$operation = null;
    this.$relations = {};

    if ( exists )
    {
      this.$set( props );
    }
    else
    {
      this.$reset( props );
    }

    // Load relations after initialization?
    if ( this.$db.loadRelations )
    {
      var databaseRelations = this.$db.relations;

      for (var name in databaseRelations)
      {
        this.$getRelation( name );
      }
    }
  },

  $reset: function(props)
  {
    var def = this.$db.defaults;
    var fields = this.$db.fields;
    var relations = this.$db.relations;

    if ( isObject( def ) )
    {
      for (var i = 0; i < fields.length; i++)
      {
        var prop = fields[ i ];
        var defaultValue = def[ prop ];
        var evaluatedValue = evaluate( defaultValue );

        this[ prop ] = evaluatedValue;
      }

      for (var prop in relations)
      {
        if ( prop in def )
        {
          var defaultValue = def[ prop ];
          var evaluatedValue = evaluate( defaultValue );
          var relation = this.$getRelation( prop );

          relation.set( this, evaluatedValue );
        }
      }
    }
    else
    {
      for (var i = 0; i < fields.length; i++)
      {
        var prop = fields[ i ];

        this[ prop ] = undefined;
      }
    }

    this.$set( props );
  },

  $set: function(props, value)
  {
    if ( isObject( props ) )
    {
      for (var prop in props)
      {
        this.$set( prop, props[ prop ] );
      }
    }
    else if ( isString( props ) )
    {
      var relation = this.$getRelation( props );
      
      if ( relation )
      {
        relation.set( this, value );
      }
      else
      {
        this[ props ] = value;
      }
    }
  },

  $get: function(props, copyValues)
  {
    if ( isArray( props ) )
    {
      return grab( this, props, copyValues );
    }
    else if ( isObject( props ) )
    {
      for (var p in props)
      {
        props[ p ] = copyValues ? copy( this[ p ] ) : this[ p ];
      }

      return props;
    }
    else if ( isString( props ) )
    {
      var relation = this.$getRelation( props );

      if ( relation )
      {
        var values = relation.get( this );

        return copyValues ? copy( values ) : values;
      }
      else
      {
        return copyValues ? copy( this[ props ] ) : this[ props ];
      }
    }
  },

  $relate: function(prop, relate)
  {
    var relation = this.$getRelation( prop );

    if ( relation )
    {
      relation.relate( this, relate );
    }
  },

  $unrelate: function(prop, unrelated)
  {
    var relation = this.$getRelation( prop );

    if ( relation )
    {
      relation.unrelate( this, unrelated );
    }
  },

  $isRelated: function(prop, related)
  {
    var relation = this.$getRelation( prop );

    return relation && relation.isRelated( this, related );
  },

  $getRelation: function(prop)
  {
    var databaseRelations = this.$db.relations;

    if ( prop in databaseRelations )
    {
      var relation = databaseRelations[ prop ];

      if ( !(prop in this.$relations) )
      {
        relation.load( this );
      }

      return relation;
    }

    return false;
  },

  $save: function(setProperties, setValue)
  {
    this.$set( setProperties, setValue );

    this.$callRelationFunction( 'preSave' );

    this.$db.save( this );

    this.$callRelationFunction( 'postSave' );
  },

  $remove: function()
  {
    if ( this.$exists() )
    {
      this.$callRelationFunction( 'preRemove' );

      this.$db.remove( this );

      this.$callRelationFunction( 'postRemove' );
    }
  },

  $exists: function()
  {
    return !this.$deleted && this.$db.models.has( this.$key() );
  },

  $callRelationFunction: function(functionName)
  {
    var databaseRelations = this.$db.relations;

    for ( var name in databaseRelations )
    {
      databaseRelations[ name ][ functionName ]( this );
    }
  },

  $addOperation: function(OperationType) 
  {
    var operation = new OperationType( this );

    if ( !this.$operation ) 
    {
      this.$operation = operation;
      this.$operation.execute();
    } 
    else 
    {
      this.$operation.queue( operation );
    }
  },

  $toJSON: function( forSaving )
  {
    var encoded = this.$db.encode( grab( this, this.$db.fields, true ) );

    var databaseRelations = this.$db.relations;
    var relations = this.$relations;

    for (var name in relations)
    {
      databaseRelations[ name ].encode( this, encoded, forSaving );
    }

    return encoded;
  },

  $key: function()
  {
    return this.$db.getKey( this );
  },

  $keys: function()
  {
    return this.$db.getKeys( this );
  },

  $hasKey: function()
  {
    return this.$db.hasFields( this, this.$db.key, isValue );
  },

  $isSaved: function()
  {
    return !!this.$saved;
  },

  $isSavedLocally: function()
  {
    return !!this.$local;
  },

  $isNew: function()
  {
    return !(this.$saved || this.$local);
  },

  $getChanges: function(alreadyEncoded)
  {
    var saved = this.$saved;
    var encoded = alreadyEncoded || this.$toJSON( true );
    var fields = this.$db.saveFields;

    return saved ? diff( encoded, saved, fields, equals ) : encoded;
  },

  $hasChanges: function()
  {
    if (!this.$saved) 
    {
      return true;
    }

    var encoded = this.$toJSON( true );
    var saved = this.$saved;

    for (var prop in encoded) 
    {
      var currentValue = encoded[ prop ];
      var savedValue = saved[ prop ];

      if ( !equals( currentValue, savedValue ) ) 
      {
        return true;
      }
    }

    return false;
  },

  toString: function()
  {
    return this.$db.className + ' ' + JSON.stringify( this.$toJSON() );
  }

};

eventize( NeuroModel.prototype, true );