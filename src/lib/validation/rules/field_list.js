
// required_if:X,Y,...
fieldListRuleGenerator('required_if',
  '{$alias} is required.',
  function isInvalid(value, model, field, values, map) {
    var required = map[ model.$get( field ) ];

    return required && isEmpty( value );
  }
);

// required_unless:X,Y,...
fieldListRuleGenerator('required_unless',
  '{$alias} is required.',
  function isInvalid(value, model, field, values, map) {
    var required = !map[ model.$get( field ) ];

    return required && isEmpty( value );
  }
);

function fieldListRuleGenerator(ruleName, defaultMessage, isInvalid)
{
  Validation.Rules[ ruleName ] = function(field, params, database, getAlias, message)
  {
    if ( !params )
    {
      throw ruleName + ' validation rule requires a field and list arguments';
    }

    var matchField, matchValues;

    if ( isString( params ) )
    {
      var parts = split( params, /(,)/, '\\' );

      matchField = parts.shift();
      matchValues = parts;
    }
    else if ( isArray( params ) )
    {
      matchField = params.shift();
      matchValues = params;
    }
    else if ( isObject( params ) )
    {
      matchField = params.field;
      matchValues = params.values;
    }

    if ( indexOf( database.fields, matchField ) === false )
    {
      throw matchField + ' is not a valid field for the ' + ruleName + ' rule';
    }

    var messageTemplate = determineMessage( ruleName, message );
    var list = joinFriendly( matchValues );
    var extra = {
      $params: params,
      $matchField: matchField,
      $matchAlias: getAlias( matchField ),
      $list: list
    };
    var map = mapFromArray( matchValues, true );

    return function(value, model, setMessage)
    {
      if ( isInvalid( value, model, matchField, matchValues, map ) )
      {
        setMessage( generateMessage( field, getAlias( field ), value, model, messageTemplate, extra ) );
      }

      return value;
    };
  };

  Validation.Rules[ ruleName ].message = defaultMessage;
}
