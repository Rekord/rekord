
var Cascade =
{
  None:       0,
  Local:      1,
  Rest:       2,
  NoLive:     3,
  Live:       4,
  NoRest:     5,
  Remote:     6,
  All:        7
};

function canCascade(cascade, type)
{
  return !isNumber( cascade ) || (cascade & type) === type;
}
