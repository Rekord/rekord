
var RELATIVE_REGEX = /^([+-]\d+(\.\d+)?)\s*(.+)$/;

var RELATIVE_UNITS = {
  ms: 1,
  millisecond: 1,
  milliseconds: 1,
  s: 1000,
  second: 1000,
  seconds: 1000,
  min: 1000 * 60,
  mins: 1000 * 60,
  minute: 1000 * 60,
  minutes: 1000 * 60,
  hr: 1000 * 60 * 60,
  hour: 1000 * 60 * 60,
  hours: 1000 * 60 * 60,
  day: 1000 * 60 * 60 * 24,
  days: 1000 * 60 * 60 * 24,
  wk: 1000 * 60 * 60 * 24 * 7,
  week: 1000 * 60 * 60 * 24 * 7,
  weeks: 1000 * 60 * 60 * 24 * 7,
  month: ['getMonth', 'setMonth'],
  months: ['getMonth', 'setMonth'],
  yr: ['getFullYear', 'setFullYear'],
  year: ['getFullYear', 'setFullYear'],
  years: ['getFullYear', 'setFullYear']
};

Validation.Expression.relative =
Validation.Expressions.push(function(expr, database)
{
  var parsed = RELATIVE_REGEX.exec( expr );

  if ( parsed !== null )
  {
    var amount = parseFloat( parsed[ 1 ] );
    var unit = parsed[ 3 ];
    var unitScale = RELATIVE_UNITS[ unit ];

    if ( !unitScale )
    {
      throw unit + ' is not a valid unit.';
    }

    return function(value, model)
    {
      var relative = new Date();

      if ( isNumber( unitScale ) )
      {
        relative.setTime( relative.getTime() + unitScale * amount );
      }
      else
      {
        var getter = unitScale[0];
        var setter = unitScale[1];

        relative[ setter ]( relative[ getter ]() + amount );
      }

      return relative.getTime();
    };
  }
}) - 1;
