Rekord.on( Rekord.Events.Plugins, function(model, db, options)
{
  var events = collapse( options.events, Database.Defaults.events );

  if ( !isEmpty( events ) )
  {
    var modelEvents = [];
    var databaseEvents = [];

    for ( var eventType in events )
    {
      var callback = events[ eventType ];
      var eventName = toCamelCase( eventType );

      var databaseEventString = Database.Events[ eventName ];
      var modelEventString = Model.Events[ eventName ];

      if ( databaseEventString )
      {
        parseEventListeners( databaseEventString, callback, false, databaseEvents );
      }

      if ( modelEventString )
      {
        parseEventListeners( modelEventString, callback, true, modelEvents );
      }
    }

    applyEventListeners( db, databaseEvents );

    if ( modelEvents.length )
    {
      var $init = model.prototype.$init;

      model.prototype.$init = function()
      {
        $init.apply( this, arguments );

        applyEventListeners( this, modelEvents );
      };
    }
  }

});

function parseEventListeners(events, callback, secret, out)
{
  var map = {
    on:     secret ? '$on' : 'on',
    once:   secret ? '$once' : 'once',
    after:  secret ? '$after' : 'after'
  };

  var listeners = out || [];

  if ( isFunction( callback ) )
  {
    listeners.push(
    {
      when: map.on,
      events: events,
      invoke: callback
    });
  }
  else if ( isArray( callback ) && callback.length === 2 && isFunction( callback[0] ) )
  {
    listeners.push(
    {
      when: map.on,
      events: events,
      invoke: callback[0],
      context: callback[1]
    });
  }
  else if ( isObject( callback ) )
  {
    for ( var eventType in callback )
    {
      if ( eventType in map )
      {
        var subcallback = callback[ eventType ];
        var when = map[ eventType ];

        if ( isFunction( subcallback ) )
        {
          listeners.push(
          {
            when: when,
            events: events,
            invoke: subcallback
          });
        }
        else if ( isArray( subcallback ) && subcallback.length === 2 && isFunction( subcallback[0] ) )
        {
          listeners.push(
          {
            when: when,
            events: events,
            invoke: subcallback[0],
            context: subcallback[1]
          });
        }
      }
    }
  }

  return listeners;
}

function applyEventListeners(target, listeners)
{
  for (var i = 0; i < listeners.length; i++)
  {
    var l = listeners[ i ];

    target[ l.when ]( l.events, l.invoke, l.context );
  }
}
