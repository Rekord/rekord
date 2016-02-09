Neuro.on( Neuro.Events.Plugins, function(model, db, options)
{
  model.searchPaged = function(options)
  {
    return new NeuroSearchPaged( db, options );
  };
});
