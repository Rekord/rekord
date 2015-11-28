Neuro.on( Neuro.Events.Plugins, function(model, db, options)
{
  model.query = function(query)
  {
    var q = new NeuroRemoteQuery( db, query );

    q.sync();

    return q;
  };
});