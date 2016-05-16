// min:3
sizeRuleGenerator('min', {
    'string': '{$alias} must have a minimum of {$number} characters.',
    'number': '{$alias} must be at least {$number}.',
    'object': '{$alias} must have at least {$number} items.'
  },
  function isInvalid(value, number) {
    return value < number;
  }
);

// greater_than:0
sizeRuleGenerator('greater_than', {
    'string': '{$alias} must have more than {$number} characters.',
    'number': '{$alias} must be greater than {$number}.',
    'object': '{$alias} must have more than {$number} items.'
  },
  function isInvalid(value, number) {
    return value <= number;
  }
);

// max:10
sizeRuleGenerator('max', {
    'string': '{$alias} must have no more than {$number} characters.',
    'number': '{$alias} must be no more than {$number}.',
    'object': '{$alias} must have no more than {$number} items.'
  },
  function isInvalid(value, number) {
    return value > number;
  }
);

// less_than:5
sizeRuleGenerator('less_than', {
    'string': '{$alias} must have less than {$number} characters.',
    'number': '{$alias} must be less than {$number}.',
    'object': '{$alias} must have less than {$number} items.'
  },
  function isInvalid(value, number) {
    return value >= number;
  }
);

// equal:4.5
sizeRuleGenerator('equal', {
    'string': '{$alias} must have {$number} characters.',
    'number': '{$alias} must equal {$number}.',
    'object': '{$alias} must have {$number} items.'
  },
  function isInvalid(value, number) {
    return value !== number;
  }
);

// not_equal:0
sizeRuleGenerator('not_equal', {
    'string': '{$alias} must not have {$number} characters.',
    'number': '{$alias} must not equal {$number}.',
    'object': '{$alias} must not have {$number} items.'
  },
  function isInvalid(value, number) {
    return value === number;
  }
);

function sizeRuleGenerator(ruleName, defaultMessages, isInvalid)
{
  Validation.Rules[ ruleName ] = function(field, params, database, getAlias, message)
  {
    var number;

    if ( isString( params ) )
    {
      number = parseFloat( params );
    }
    else if ( isNumber( params ) )
    {
      number = params;
    }

    if ( isNaN( number ) )
    {
      throw '"' + params + '" is not a valid number for the ' + ruleName + ' rule';
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
      $number: params
    };

    return function(value, model, setMessage)
    {
      var size = sizeof( value );
      var type = typeof( value );
      var typeMessage = messageTemplate[ type ];

      if ( typeMessage && isInvalid( size, number ) )
      {
        extra.$size = size;

        setMessage( generateMessage( field, getAlias( field ), value, model, typeMessage, extra ) );
      }

      return value;
    };
  };

  Validation.Rules[ ruleName ].message = defaultMessages;
}
