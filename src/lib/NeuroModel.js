
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

NeuroModel.prototype =
{

  $init: function(props)
  {
    this.$pendingSave = false;
    this.$operation = null;
    this.$relations = {};

    this.$reset( props );
  },

  $reset: function(props)
  {
    var def = this.$db.defaults;
    var fields = this.$db.fields;

    if ( isObject( def ) )
    {
      for (var i = 0; i < fields.length; i++)
      {
        var prop = fields[ i ];

        if ( prop in def )
        {
          var defaultValue = def[ prop ];

          if ( isFunction( defaultValue ) )
          {
            this[ prop ] = defaultValue();
          }
          else
          {
            this[ prop ] = copy( defaultValue );
          }
        }
        else
        {
          this[ prop ] = undefined;
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
      transfer( props, this );
    }
    else if ( isString( props ) && value !== void 0 )
    {
      if ( props in this.$relations )
      {
        var relation = this.$db.relations[ props ];

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
      if ( props in this.$relations )
      {
        var relation = this.$db.relations[ props ];
        var values = relation.get( this );

        return copyValues ? copy( values ) : values;
      }
      else
      {
        return copyValues ? copy( this[ props ] ) : this[ props ]; 
      }
    }
  },

  $save: function(setProperties, setValue)
  {
    this.$set( setProperties, setValue );

    return this.$db.save( this );
  },

  $remove: function()
  {
    return this.$db.remove( this );
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

  $toJSON: function()
  {
    return this.$db.encode( grab( this, this.$db.fields, true ) );
  },

  $key: function()
  {
    return this.$db.getKey( this );
  },

  $isSaved: function()
  {
    return !!this.$saved;
  },

  $isSavedLocally: function()
  {
    return !!this.$local;
  },

  $hasChanges: function()
  {
    if (!this.$saved) 
    {
      return true;
    }

    var encoded = this.$toJSON();
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
  }

};

eventize( NeuroModel.prototype );