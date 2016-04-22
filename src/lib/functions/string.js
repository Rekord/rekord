
function camelCaseReplacer(match)
{
  return match.length === 1 ? match.toUpperCase() : match.charAt(1).toUpperCase();
}

function toCamelCase(name)
{
  return name.replace( toCamelCase.REGEX, camelCaseReplacer );
}

toCamelCase.REGEX = /(^.|_.)/g;
