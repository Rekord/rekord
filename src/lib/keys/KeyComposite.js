
function KeyComposite(database)
{
  this.init( database );
}

extend( KeyHandler, KeyComposite,
{
  getKeys: function(input, otherFields)
  {
    this.buildKeyFromRelations( input );

    return pull( input, otherFields || this.key );
  },

  removeKey: function(model)
  {
    var fields = this.key;

    for (var i = 0; i < fields.length; i++)
    {
      delete model[ fields[ i ] ];
    }
  },

  buildKey: function(input, otherFields)
  {
    return this.getKeys( input, otherFields ).join( this.keySeparator );
  },

  buildObjectFromKey: function(key)
  {
    var fields = this.key;
    var props = {};

    if ( isString( key ) )
    {
      key = key.split( this.keySeparator );
    }

    for (var i = 0; i < fields.length; i++)
    {
      props[ fields[ i ] ] = key[ i ];
    }

    return this.database.instantiate( props );
  },

  hasKeyChange: function(a, b)
  {
    var fields = this.key;

    for (var i = 0; i < fields.length; i++)
    {
      var akey = a[ fields[ i ] ];
      var bkey = b[ fields[ i ] ];

      if ( isValue( akey ) && isValue( bkey ) && akey !== bkey )
      {
        return true;
      }
    }

    return false;
  },

  addToFields: function(out)
  {
    var fields = this.key;

    for (var i = fields.length - 1; i >= 0; i--)
    {
      if ( indexOf( out, fields[ i ] ) === false )
      {
        out.unshift( fields[ i ] );
      }
    }
  },

  isValid: function(key)
  {
    return isValue( key );
  },

  copyFields: function(target, targetFields, source, sourceFields)
  {
    for (var i = 0; i < targetFields.length; i++)
    {
      var targetValue = target[ targetFields[ i ] ];
      var sourceValue = source[ sourceFields[ i ] ];

      if ( !isValue( targetValue ) && isValue( sourceValue ) )
      {
        target[ targetFields[ i ] ] = copy( sourceValue );
      }
    }
  },

  inKey: function(field)
  {
    return indexOf( this.key, field ) !== false;
  },

  setKeyField: function(key, field, source, target)
  {
    var index = indexOf( target );

    if ( index !== false )
    {
      key[ field ] = source[ this.key[ index ] ];
    }
  }

});
