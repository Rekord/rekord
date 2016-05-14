// between:3,10
rangeRuleGenerator('between', {
    'string': '{$alias} must have between {$start} to {$end} characters.',
    'number': '{$alias} must be between {$start} and {$end}.',
    'object': '{$alias} must have between {$start} to {$end} items.'
  },
  function isInvalid(value, start, end) {
    return value < start || value > end;
  }
);

// not_between
rangeRuleGenerator('not_between', {
    'string': '{$alias} must not have between {$start} to {$end} characters.',
    'number': '{$alias} must not be between {$start} and {$end}.',
    'object': '{$alias} must not have between {$start} to {$end} items.'
  },
  function isInvalid(value, start, end) {
    return value >= start && value <= end;
  }
);

function rangeRuleGenerator(ruleName, defaultMessages, isInvalid)
{
  Validation.Rules[ ruleName ] = function(field, params, database, getAlias, message)
  {
    if ( !params )
    {
      throw ruleName + ' validation rule requires a range argument';
    }

    var range = split( params, /(\s*,\s*)/, '\\' );
    var start = parseFloat( range[0] );
    var end = parseFloat( range[1] );

    if ( isNaN( start ) || isNaN( end ) )
    {
      throw params + ' is not a valid range of numbers for the ' + ruleName + ' rule';
    }

    if ( isString( message ) )
    {
      message = {
        'string': message,
        'number': message,
        'object': message
      };
    }

    var messageTemplate = determineMessage( ruleName, message );
    var extra = {
      $start: start,
      $end: end
    };

    return function(value, model, setMessage)
    {
      var size = sizeof( value );
      var type = typeof( value );
      var typeMessage = messageTemplate[ type ];

      if ( typeMessage && isInvalid( size, start, end ) )
      {
        extra.$size = size;

        setMessage( generateMessage( field, getAlias( field ), value, model, typeMessage, extra ) );
      }

      return value;
    };
  };

  Validation.Rules[ ruleName ].message = defaultMessages;
}
