
var Rekord = require('../../build/rekord')
var QUnit = require('qunitjs')

QUnit.config.autostart = false
QUnit.config.reorder = false

QUnit.module( 'Rekord & Browserify' )

QUnit.test( 'exists', function(assert)
{
  assert.ok( Rekord, 'Rekord' )
  assert.ok( Rekord.Model, 'Model' )
  assert.ok( Rekord.Collection, 'Collection' )
})

QUnit.start()
