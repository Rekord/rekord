Rekord.on( Rekord.Events.Plugins, function(model, db, options)
{
  model.searchPaged = function(options)
  {
    return new SearchPaged( db, options );
  };
});
