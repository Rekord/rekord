Neuro.on( Neuro.Events.Plugins, function(model, db, options)
{
  model.bootCollection = function( input )
  {
    return new NeuroModelCollection( db, input, true );
  };
});