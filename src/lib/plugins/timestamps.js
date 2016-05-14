Rekord.on( Rekord.Events.Plugins, function(model, db, options)
{
  var time = options.timestamps || Database.Defaults.timestamps;
  var timeAsDate = options.timestampsAsDate || Database.Defaults.timestampsAsDate;
  var currentTimestamp = timeAsDate ? currentDate : currentTime;

  if ( !time )
  {
    return;
  }

  function currentTime()
  {
    return new Date().getTime();
  }

  function currentDate()
  {
    return new Date();
  }

  function encode(x)
  {
    return x instanceof Date ? x.getTime() : x;
  }

  function decode(x)
  {
    if ( isString( x ) && Date.parse )
    {
      var parsed = Date.parse( x );

      if ( !isNaN( parsed ) )
      {
        x = parsed;
      }
    }

    if ( isNumber( x ) )
    {
      return new Date( x );
    }

    return x;
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

    if ( timeAsDate )
    {
      if ( !(field in db.encodings) )
      {
        db.encodings[ field ] = encode;
      }
      if ( !(field in db.decodings ) )
      {
        db.decodings[ field ] = decode;
      }
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
