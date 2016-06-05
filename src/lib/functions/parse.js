
function isParseInput(x)
{
  return x.indexOf('.') !== -1 || x.indexOf('[') !== -1;
}

function parse(expr, base)
{
  return createParser( expr )( base );
}

parse.REGEX = /([\w$]+)/g;

function createParser(expr)
{
  var regex = parse.REGEX;
  var nodes = [];
  var match = null;

  while ((match = regex.exec( expr )) !== null)
  {
    nodes.push( match[ 1 ] );
  }

  return function(base)
  {
    for (var i = 0; i < nodes.length && base !== undefined; i++)
    {
      var n = nodes[ i ];

      if ( isObject( base ) )
      {
        base = evaluate( base[ n ], true );
      }
    }

    return base;
  };
}

function isFormatInput(x)
{
  return x.indexOf('{') !== -1;
}

function format(template, base)
{
  return createFormatter( template )( base );
}

format.REGEX = /[\{\}]/;

function createFormatter(template)
{
  // Every odd element in parts is a parse expression
  var parts = template.split( format.REGEX );

  for (var i = 1; i < parts.length; i += 2 )
  {
    parts[ i ] = createParser( parts[ i ] );
  }

  return function formatter(base)
  {
    var formatted = '';

    for (var i = 0; i < parts.length; i++)
    {
      if ( (i & 1) === 0 )
      {
        formatted += parts[ i ];
      }
      else
      {
        formatted += parts[ i ]( base );
      }
    }

    return formatted;
  };
}

function parseDate(x, utc)
{
  if ( isString( x ) )
  {
    if ( utc )
    {
      x += ' UTC';
    }

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
