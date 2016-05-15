Rekord.on( Rekord.Events.Plugins, function(model, db, options)
{
  var time = options.timestamps || Database.Defaults.timestamps;
  var timeFormat = options.timestampFormat || Database.Defaults.timestampFormat;
  var timeType = options.timestampType || Database.Defaults.timestampType;
  var timeUTC = options.timestampUTC || Database.Defaults.timestampUTC;

  if ( !time )
  {
    return;
  }

  function currentTimestamp()
  {
    return convertDate( new Date(), timeType );
  }

  function encode(x)
  {
    var encoded = convertDate( x, timeFormat );

    return encoded || x;
  }

  function decode(x)
  {
    var decoded = convertDate( x, timeType, timeUTC );

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

    if ( !(field in db.defaults) )
    {
      db.defaults[ field ] = currentTimestamp;
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
        this[ field ] = currentTimestamp();

        $save.apply( this, arguments );
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

Database.Defaults.timestampFormat = Timestamp.Millis;
Database.Defaults.timestampType = Timestamp.Date;
Database.Defaults.timestampUTC = false;

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
