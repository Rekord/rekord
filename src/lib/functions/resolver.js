

/**
 * A function for resolving a value from a given value. Typically used to
 * transform an object into one of it's properties.
 *
 * @callback propertyResolverCallback
 * @param {Any} model -
 *    The model to use to resolve a value.
 * @return {Any} -
 *    The resolved value.
 * @see Rekord.createPropertyResolver
 */


/**
 * An expression which resolves a value from another value.
 *
 * ```javascript
 * // {age: 6, name: 'x', user: {first: 'tom'}}
 * 'age'                    // age property of an object
 * 'user.first'             // sub property
 * '{age}, {user.first}'    // a formatted string built from object values
 * function(a) {}           // a function which returns a value itself
 * ['age', 'name']          // multiple properties resolves to an array of values
 * {age:null, user:'first'} // multiple properties including a sub property returns an object of values
 * ```
 *
 * @typedef {String|Function|Array|Object} propertyResolverInput
 */

var NumberResolvers = {};

function saveNumberResolver(name, numbers)
{
  var resolver = createNumberResolver( numbers );

  NumberResolvers[ name ] = resolver;

  return resolver;
}

function createNumberResolver(numbers)
{
  var resolver = createPropertyResolver( numbers );

  if ( isString( numbers ) && numbers in NumberResolvers )
  {
    return NumberResolvers[ numbers ];
  }

  return function resolveNumber(model)
  {
    return parseFloat( resolver( model ) );
  };
}

var PropertyResolvers = {};

function savePropertyResolver(name, properties)
{
  var resolver = createPropertyResolver( properties );

  PropertyResolvers[ name ] = resolver;

  return resolver;
}

/**
 * Creates a function which resolves a value from another value given an
 * expression. This is often used to get a property value of an object.
 *
 * ```javascript
 * // x = {age: 6, name: 'tom', user: {first: 'jack'}}
 * createPropertyResolver()( x )                          // x
 * createPropertyResolver( 'age' )( x )                   // 6
 * createPropertyResolver( 'user.first' )( x )            // 'jack'
 * createPropertyResolver( '{name} & {user.first}')( x )  // 'tom & jack'
 * createPropertyResolver( ['name', 'age'] )( x )         // ['tom', 6]
 * createPropertyResolver( {age:null, user:'first'})( x ) // {age: 6, user:'jack'}
 * ```
 *
 * @memberof Rekord
 * @param {propertyResolverInput} [properties] -
 *    The expression which converts one value into another.
 * @return {propertyResolverCallback} -
 *    A function to take values and resolve new ones.
 */
function createPropertyResolver(properties)
{
  if ( isFunction( properties ) )
  {
    return properties;
  }
  else if ( isString( properties ) )
  {
    if ( properties in PropertyResolvers )
    {
      return PropertyResolvers[ properties ];
    }

    if ( isFormatInput( properties ) )
    {
      return createFormatter( properties );
    }
    else if ( isParseInput( properties ) )
    {
      return createParser( properties );
    }
    else
    {
      return function resolveProperty(model)
      {
        return model ? model[ properties ] : undefined;
      };
    }
  }
  else if ( isArray( properties ) )
  {
    return function resolveProperties(model)
    {
      return pull( model, properties );
    };
  }
  else if ( isObject( properties ) )
  {
    var propsArray = [];
    var propsResolver = [];

    for (var prop in properties)
    {
      propsArray.push( prop );
      propsResolver.push( createPropertyResolver( properties[ prop ] ) );
    }

    return function resolvePropertyObject(model)
    {
      var resolved = {};

      for (var i = 0; i < propsArray.length; i++)
      {
        var prop = propsArray[ i ];

        resolved[ prop ] = propsResolver[ i ]( model[ prop ] );
      }

      return resolved;
    };
  }
  else
  {
    return function resolveNone(model)
    {
      return model;
    };
  }
}
