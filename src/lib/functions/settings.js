
var Settings = global.RekordSettings || win.RekordSettings || {};

if ( win.document && win.document.currentScript )
{
  var script = win.document.currentScript;

  if (script.getAttribute('native-array') !== null)
  {
    Settings.nativeArray = true;
  }
}
