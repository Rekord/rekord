
var Rekord = require('rekord');
var QUnit = require('qunitjs');

QUnit.config.reorder = false;

QUnit.module( 'Rekord & Webpack' );

QUnit.test( 'exists', function(assert)
{
  assert.ok( Rekord, 'Rekord' );
  assert.ok( Rekord.Model, 'Model' );
  assert.ok( Rekord.Collection, 'Collection' );
});

QUnit.start();
