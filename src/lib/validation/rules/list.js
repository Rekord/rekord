// in:X,Y,Z,...
listRuleGenerator('in',
  '{$alias} must be one of {$list}.',
  function isInvalid(value, model, inList)
  {
    return !inList( value, model );
  }
);

// not_in:X,Y,Z,...
listRuleGenerator('not_in',
  '{$alias} must not be one of {$list}.',
  function isInvalid(value, model, inList)
  {
    return inList( value, model )
  }
);

function listRuleGenerator(ruleName, defaultMessage, isInvalid)
{
  Validation.Rules[ ruleName ] = function(field, params, database, getAlias, message)
  {
    if ( !params )
    {
      throw ruleName + ' validation rule requires a list argument';
    }

    var values, inList = false;

    if ( isString( params ) )
    {
      values = split( params, /(,)/, '\\' );
    }
    else if ( isArray( params ) )
    {
      values = params;
    }
    else if ( isFunction( params ) )
    {
      values = inList;
    }

    if ( inList !== false )
    {
      if ( !values || values.length === 0 )
      {
        throw params + ' is not a valid list of values for the ' + ruleName + ' rule';
      }
    }

    if ( isPrimitiveArray( values ) )
    {
      var map = mapFromArray( values, true );

      inList = function(value)
      {
        return map[ value ];
      };
    }
    else
    {
      inList = function(value)
      {
        return indexOf( values, value, equals );
      };
    }

    var messageTemplate = determineMessage( ruleName, message );
    var list = joinFriendly( values, 'or' );
    var extra = {
      $params: params,
      $list: list
    };

    return function(value, model, setMessage)
    {
      if ( isInvalid( value, model, inList ) )
      {
        setMessage( generateMessage( field, getAlias( field ), value, model, messageTemplate, extra ) );
      }

      return value;
    };
  };


  Validation.Rules[ ruleName ].message = defaultMessage;
}
