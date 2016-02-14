Neuro.on( Neuro.Events.Options, function(options)
{
  var shard = options.shard || NeuroDatabase.Defaults.shard;

  if ( !isObject( shard ) )
  {
    return;
  }

  options.createRest = Neuro.shard( shard );
});
