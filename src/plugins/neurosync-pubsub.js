
Neuro.live = (function()
{
  var cache = {};

  function get(url)
  {
    return url in cache ? cache[ url ] : ( cache[ url ] = new PubSub( url ) );
  }

  function LiveFactory(database, onPublish)
  {
    if ( !database.pubsub || !database.channel || !database.token )
    {
      return function() {};
    }

    var pubsub = get( database.pubsub );
    var channel = pubsub.subscribe( database.channel, database.token );

    Neuro.debug( Neuro.Debugs.PUBSUB_CREATED, pubsub );

    function handlePublish(message)
    {
      if ( !Neuro.forceOffline )
      {
        onPublish( message );
      }
    }

    function publish(message)
    {
      if ( !Neuro.forceOffline )
      {
        channel.publish( message );
      }
    };

    channel.onpublish = handlePublish;

    publish.pubsub = pubsub;
    publish.channel = channel;

    return publish;
  };

  return LiveFactory;

})();