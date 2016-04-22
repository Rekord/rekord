

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
 * ['age', 'name']          // multiple properties joined with a delimiter
 * {age:null, user:'first'} // multiple properties joined with a delimiter including a sub property
 * ```
 *
 * @typedef {String|Function|Array|Object} propertyResolverInput
 */

Rekord.NumberResolvers = {};

function saveNumberResolver(name, numbers)
{
  return Rekord.NumberResolvers[ name ] = createNumberResolver( numbers );
}

function createNumberResolver(numbers)
{
  var resolver = createPropertyResolver( numbers );

  if ( isString( numbers ) && numbers in Rekord.NumberResolvers )
  {
    return Rekord.NumberResolvers[ numbers ];
  }

  return function resolveNumber(model)
  {
    return parseFloat( resolver( model ) );
  };
}

Rekord.PropertyResolvers = {};

function savePropertyResolver(name, properties, delim)
{
  return Rekord.PropertyResolvers[ name ] = createPropertyResolver( properties, delim );
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
 * createPropertyResolver( ['name', 'age'] )( x )         // 'tom,6'
 * createPropertyResolver( ['name', 'age'], ' is ' )( x ) // 'tom is 6'
 * createPropertyResolver( {age:null, user:'first'})( x ) // '6,jack'
 * ```
 *
 * @memberof Rekord
 * @param {propertyResolverInput} [properties] -
 *    The expression which converts one value into another.
 * @param {String} [delim=','] -
 *    A delimiter to use to join multiple properties into a string.
 * @return {propertyResolverCallback} -
 *    A function to take values and resolve new ones.
 */
function createPropertyResolver(properties, delim)
{
  if ( isFunction( properties ) )
  {
    return properties;
  }
  else if ( isString( properties ) )
  {
    if ( properties in Rekord.PropertyResolvers )
    {
      return Rekord.PropertyResolvers[ properties ];
    }

    if ( properties.indexOf('{') !== -1 )
    {
      return function resolveFormatted(model)
      {
        return format( properties, model );
      };
    }
    else if ( properties.indexOf('.') !== -1 )
    {
      return function resolveExpression(model)
      {
        return parse( properties, model );
      };
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
      return pull( model, properties ).join( delim );
    };
  }
  else if ( isObject( properties ) )
  {
    var propsArray = [];
    var propsResolver = [];

    for (var prop in properties)
    {
      propsArray.push( prop );
      propsResolver.push( createPropertyResolver( properties[ prop ], delim ) );
    }

    return function resolvePropertyObject(model)
    {
      var pulled = [];

      for (var i = 0; i < prop.length; i++)
      {
        pulled.push( propsResolver[ i ]( model[ propsArray[ i ] ] ) );
      }

      return pulled.join( delim );
    };
  }
  else
  {
    return function resolveNone(model)
    {
      return model;
    }
  }
}
