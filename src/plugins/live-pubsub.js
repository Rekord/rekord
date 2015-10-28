
Neuro.live = (function()
{
  var cache = {};

  function get(url)
  {
    return url in cache ? cache[ url ] : ( cache[ url ] = new PubSub( url ) );
  }

  return function LiveFactory(database, onPublish)
  {
    var pubsub = get( database.pubsub );
    var channel = pubsub.subscribe( database.channel, database.token );

    Neuro.debug( Neuro.Events.PUBSUB_CREATED, pubsub );

    channel.onpublish = onPublish;

    return function publish(message)
    {
      channel.publish( message );
    };
  };

})();