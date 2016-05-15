


function parse(expr, base)
{
  var valid = true;

  expr.replace( parse.REGEX, function(prop)
  {
    if (!valid)
    {
      return;
    }

    if ( isArray( base ) )
    {
      var i = parseInt(prop);

      if (!isNaN(i))
      {
        base = base[ i ];
      }
      else
      {
        valid = false;
      }
    }
    else if ( isObject( base ) )
    {
      if (prop in base)
      {
        var value = base[ prop ];
        base = isFunction(value) ? value() : value;
      }
      else
      {
        valid = false;
      }
    }
    else
    {
      valid = false;
    }
  });

  return valid ? base : void 0;
}

parse.REGEX = /([\w$]+)/g;

function format(template, base)
{
  return template.replace( format.REGEX, function(match)
  {
    return parse( match, base );
  });
}

format.REGEX = /\{[^\}]+\}/g;

function createFormatter(template)
{
  return function formatter(base)
  {
    return format( template, base );
  };
}

function parseDate(x, utc)
{
  if ( isString( x ) )
  {
    if ( utc ) x += ' UTC';

    x = Date.parse ? Date.parse( x ) : new Date( x );
  }
  if ( isNumber( x ) )
  {
    x = new Date( x );
  }
  if ( isDate( x ) && isNumber( x.getTime() ) )
  {
    return x;
  }

  return false;
}
