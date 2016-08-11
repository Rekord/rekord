Rekord.on( Rekord.Events.Plugins, function(model, db, options)
{
  var time = options.timestamps || Defaults.timestamps;
  var timeFormat = collapseOption( options.timestampFormat, Defaults.timestampFormat );
  var timeType = collapseOption( options.timestampType, Defaults.timestampType );
  var timeUTC = collapseOption( options.timestampUTC, Defaults.timestampUTC );
  var timeCurrent = options.timestampCurrent || Defaults.timestampCurrent;

  if ( !time )
  {
    return;
  }

  function collapseOption(option, defaultValue)
  {
    if ( isObject( option ) && isObject( defaultValue ) )
    {
      return collapse( option, defaultValue );
    }

    return option || defaultValue;
  }

  function hasDefault(field)
  {
    return timeCurrent === true || indexOf( timeCurrent, field ) !== false;
  }

  function fieldSpecific(field, map)
  {
    return isObject( map ) ? map[ field ] : map;
  }

  function currentTimestamp(field)
  {
    var to = fieldSpecific( field, timeType );

    return function()
    {
      return convertDate( new Date(), to );
    };
  }

  function encode(x, model, field, forSaving)
  {
    var to = fieldSpecific( field, timeFormat );
    var encoded = convertDate( x, to );

    return encoded || x;
  }

  function decode(x, rawData, field)
  {
    var to = fieldSpecific( field, timeType );
    var utc = fieldSpecific( field, timeUTC );
    var decoded = convertDate( x, to, utc );

    return decoded || x;
  }

  function addTimestamp(field)
  {
    var i = indexOf( db.fields, field );

    if ( i === false )
    {
      db.fields.push( field );
      db.saveFields.push( field );
    }

    if ( hasDefault( field ) && !(field in db.defaults) )
    {
      db.defaults[ field ] = currentTimestamp( field );
    }

    if ( timeFormat && !(field in db.encodings) )
    {
      db.encodings[ field ] = encode;
    }

    if ( timeType && !(field in db.decodings ) )
    {
      db.decodings[ field ] = decode;
    }
  }

  function addCreatedAt(field)
  {
    addTimestamp( field );

    db.ignoredFields[ field ] = true;
  }

  function addUpdatedAt(field)
  {
    addTimestamp( field );

    db.ignoredFields[ field ] = true;

    replaceMethod( model.prototype, '$save', function($save)
    {
      return function()
      {
        this[ field ] = evaluate( db.defaults[ field ] );

        return $save.apply( this, arguments );
      };
    });
  }

  function addTimestampField(type, field)
  {
    switch (type) {
      case 'created_at':
        return addCreatedAt( field );
      case 'updated_at':
        return addUpdatedAt( field );
      default:
        return addTimestamp( field );
    }
  }

  if ( isString( time ) )
  {
    addTimestampField( time, time );
  }
  else if ( isArray( time ) )
  {
    for (var i = 0; i < time.length; i++)
    {
      addTimestampField( time[ i ], time[ i ] );
    }
  }
  else if ( isObject( time ) )
  {
    for (var prop in time)
    {
      addTimestampField( prop, time[ prop ] );
    }
  }
  else
  {
    addCreatedAt( 'created_at' );
    addUpdatedAt( 'updated_at' );
  }

});

var Timestamp = {
  Date: 'date',
  Millis: 'millis',
  Seconds: 'seconds'
};

Defaults.timestampFormat = Timestamp.Millis;
Defaults.timestampType = Timestamp.Date;
Defaults.timestampUTC = false;
Defaults.timestampCurrent = ['created_at', 'updated_at'];

function convertDate(x, to, utc)
{
  var date = parseDate( x, utc );

  if ( date === false )
  {
    return false;
  }

  if ( !to )
  {
    return date;
  }

  switch (to)
  {
    case Timestamp.Date:
      return date;
    case Timestamp.Millis:
      return date.getTime();
    case Timestamp.Seconds:
      return Math.floor( date.getTime() / 1000 );
    default:
      return Rekord.formatDate( date, to );
  }
}

Rekord.Timestamp = Timestamp;
Rekord.formatDate = noop;
Rekord.convertDate = convertDate;
