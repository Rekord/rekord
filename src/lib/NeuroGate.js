
function NeuroGate(callback)
{
  var opened = false;
  var blocked = [];

  var gate = function()
  {
    if ( opened )
    {
      callback.apply( this, arguments );
    }
    else
    {
      blocked.push( this, AP.slice.apply( arguments ) );
    }
  };

  gate.open = function()
  {
    if ( !opened )
    {
      for (var i = 0; i < blocked.length; i += 2)
      {
        var context = blocked[ i ];
        var args = blocked[ i + 1 ];

        callback.apply( context, args );
      }

      blocked.length = 0;
      opened = true;
    }
  };

  return gate;
}
