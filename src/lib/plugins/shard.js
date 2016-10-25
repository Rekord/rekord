addPlugin(function(options)
{
  var shard = options.shard || Defaults.shard;

  if ( !isObject( shard ) )
  {
    return;
  }

  options.createRest = Rekord.shard( shard );
  
}, true );
