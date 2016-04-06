
// Initial online
Rekord.online = window.navigator.onLine !== false;

Rekord.forceOffline = false;

// Set network status to online and notify all listeners
Rekord.setOnline = function()
{
  Rekord.online = true;
  Rekord.debug( Rekord.Debugs.ONLINE );
  Rekord.trigger( Rekord.Events.Online );
};

// Set network status to offline and notify all listeners
Rekord.setOffline = function()
{
  Rekord.online = false;
  Rekord.debug( Rekord.Debugs.OFFLINE );
  Rekord.trigger( Rekord.Events.Offline );
};

// This must be called manually - this will try to use built in support for 
// online/offline detection instead of solely using status codes of 0.
Rekord.listenToNetworkStatus = function()
{
  if (window.addEventListener) 
  {
    window.addEventListener( Rekord.Events.Online, Rekord.setOnline, false );
    window.addEventListener( Rekord.Events.Offline, Rekord.setOffline, false );
  } 
  else 
  {
    document.body.ononline = Rekord.setOnline;
    document.body.onoffline = Rekord.setOffline;
  }
};

// Check to see if the network status has changed.
Rekord.checkNetworkStatus = function()
{
  var online = window.navigator.onLine;

  if ( Rekord.forceOffline ) 
  {
    online = false;
  }

  if (online === true && Rekord.online === false) 
  {
    Rekord.setOnline();
  }

  else if (online === false && Rekord.online === true) 
  {
    Rekord.setOffline();
  }
};