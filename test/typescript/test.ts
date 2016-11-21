
import * as Rekord from 'rekord'
import * as QUnit from 'qunitjs'

QUnit.config.reorder = false

QUnit.module( 'Rekord & Typescript' )

QUnit.test( 'exists', (assert) =>
{
  assert.ok( Rekord, 'Rekord' )
  assert.ok( Rekord.Model, 'Model' )
  assert.ok( Rekord.Collection, 'Collection' )
})

QUnit.start()
