Rekord.on( Rekord.Events.Plugins, function(model, db, options)
{
  model.query = function(query)
  {
    var q = new RemoteQuery( db, query );

    if ( isValue( query ) )
    {
      q.sync();
    }

    return q;
  };
});
