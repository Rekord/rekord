Neuro.on( Neuro.Events.Options, function(options)
{
  var shard = options.shard || Database.Defaults.shard;

  if ( !isObject( shard ) )
  {
    return;
  }

  options.createRest = Neuro.shard( shard );
});
