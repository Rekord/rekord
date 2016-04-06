Rekord.on( Rekord.Events.Options, function(options)
{
  var shard = options.shard || Database.Defaults.shard;

  if ( !isObject( shard ) )
  {
    return;
  }

  options.createRest = Rekord.shard( shard );
});
