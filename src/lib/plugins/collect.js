Neuro.on( Neuro.Events.Plugins, function(model, db, options)
{
  model.collect = function(a)
  {
    var models = arguments.length > 1 || !isArray(a) ?
      Array.prototype.slice.call( arguments ) : a;

    return new NeuroModelCollection( db, models );
  };
});