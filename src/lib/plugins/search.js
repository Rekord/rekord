Neuro.on( Neuro.Events.Plugins, function(model, db, options)
{
  model.search = function(options)
  {
    return new NeuroSearch( db, options );
  };
});
