
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

    Neuro.debug( Neuro.Events.PUBSUB_CREATED, pubsub );

    channel.onpublish = onPublish;

    function publish(message)
    {
      channel.publish( message );
    };

    publish.pubsub = pubsub;
    publish.channel = channel;

    return publish;
  };

  return LiveFactory;

})();