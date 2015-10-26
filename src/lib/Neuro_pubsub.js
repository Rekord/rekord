
Neuro.getPubSub = function(url)
{
  if ( !(url in Neuro.pubsubs) )
  {
    var pubsub = new PubSub( url );

    Neuro.pubsubs[ url ] = pubsub;

    Neuro.debug( Neuro.Events.PUBSUB_CREATED, pubsub );
  }

  return Neuro.pubsubs[ url ];
};

Neuro.pubsubs = {};