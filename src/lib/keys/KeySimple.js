
function KeySimple(database)
{
  this.init( database );
}

extend( KeyHandler, KeySimple,
{
  getKeys: function(model)
  {
    return this.buildKey( model );
  },

  removeKey: function(model)
  {
    var field = this.key;

    delete model[ field ];
  },

  buildKey: function(input, otherFields)
  {
    this.buildKeyFromRelations( input );

    var field = otherFields || this.key;
    var key = input[ field ];

    if ( !isValue( key ) )
    {
      key = input[ field ] = uuid();
    }

    return key;
  },

  buildObjectFromKey: function(key)
  {
    var field = this.key;
    var props = {};

    props[ field ] = key;

    return this.database.instantiate( props );
  },

  hasKeyChange: function(a, b)
  {
    var field = this.key;
    var akey = a[ field ];
    var bkey = b[ field ];

    return isValue( akey ) && isValue( bkey ) && akey !== bkey;
  },

  addToFields: function(out)
  {
    var field = this.key;

    if ( indexOf( out, field ) === false )
    {
      out.unshift( field );
    }
  },

  isValid: function(key)
  {
    return isValue( key );
  },

  copyFields: function(target, targetFields, source, sourceFields)
  {
    var targetValue = target[ targetFields ];
    var sourceValue = source[ sourceFields ];

    if ( !isValue( targetValue ) && isValue( sourceValue ) )
    {
      target[ targetFields ] = copy( sourceValue );
    }
  },

  inKey: function(field)
  {
    if ( isArray( field ) )
    {
      for (var i = 0; i < field.length; i++)
      {
        if ( field[ i ] === this.key )
        {
          return true;
        }
      }

      return false;
    }

    return field === this.key;
  },

  setKeyField: function(key, field, source, target)
  {
    if ( field === target )
    {
      key[ field ] = source[ this.key ];
    }
  },

  applyKey: function(input, target)
  {
    target[ this.key ] = input;
  }

});
