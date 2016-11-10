
var Settings = global.RekordSettings || {};

if ( global.document && global.document.currentScript )
{
  var script = global.document.currentScript;

  if (script.getAttribute('native-array') !== null)
  {
    Settings.nativeArray = true;
  }
}
