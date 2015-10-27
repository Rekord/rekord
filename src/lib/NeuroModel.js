
function NeuroModel(db)
{
  this.$db = db;
  this.$promise = Stork.Promise.Done( this );
  this.$pendingSave = false;
  this.$pendingRemove = false;

  /**
   * @property {NeuroDatabase} $db
   *           The reference to the database this model is stored in.
   */

  /**
   * @property {Stork.Promise} $promise
   *           The last promise on the model. When this promise completes 
   *           another action can be performed on the model.
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

  $set: function(props, value)
  {
    if ( isObject( props ) )
    {
      transfer( props, this );
    }
    else if ( isString( props ) && value !== void 0 )
    {
      this[ props ] = value;
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
      return copyValues ? copy( this[ props ] ) : this[ props ];
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

  $queue: function(callback, interrupt)
  {
    var p = this.$promise;

    if (interrupt)
    {
      p.$clear();
    }

    p.either(function()
    {
      p.$reset();
      p.$bindTo( callback() );
    });

    return p;
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

  $toJSON: function()
  {
    return this.$db.encode( grab( this, this.$db.fields, true ) );
  },

  $key: function()
  {
    var k = this.$db.key;

    return k in this ? this[ k ] : (this[ k ] = this.$db.generateKey());
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