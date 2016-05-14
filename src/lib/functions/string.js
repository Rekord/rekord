
function camelCaseReplacer(match)
{
  return match.length === 1 ? match.toUpperCase() : match.charAt(1).toUpperCase();
}

function toCamelCase(name)
{
  return name.replace( toCamelCase.REGEX, camelCaseReplacer );
}

toCamelCase.REGEX = /(^.|_.)/g;

function split(x, delimiter, escape)
{
  var splits = x.split( delimiter );
  var i = 0;
  var n = splits.length - 2;

  while (i < n)
  {
    var a = splits[ i ];
    var ae = a.length - escape.length;

    if ( a.substring( ae ) === escape )
    {
      var b = splits[ i + 1 ];
      var c = splits[ i + 2 ];
      var joined = a.substring( 0, ae ) + b + c;

      splits.splice( i, 3, joined );
      n -= 2;
    }
    else
    {
      i += 1;
      splits.splice( i, 1 );
      n -= 1;
    }
  }

  return splits;
}
