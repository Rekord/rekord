require.config({
  baseUrl: '../../build'
});

module( 'Rekord RequireJS' );

test( 'require', function(assert)
{
  var done = assert.async();

  expect( 3 );

  require(['rekord'], function(Rekord)
  {
    ok( Rekord );
    ok( Rekord.Collection );
    ok( Rekord.Model );
    done();
  });
});
