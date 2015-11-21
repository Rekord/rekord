module( 'Neuro instance functions' );

test( 'all', function(assert)
{
  var all = Neuro({
    name: 'all',
    fields: ['id']
  });

  deepEqual( all.all(), [] );

  var a0 = all.create();
  var a1 = all.create();
  var a2 = all.create();
  var a3 = all.create();
  var a4 = all.create();

  deepEqual( all.all(), [a0, a1, a2, a3, a4] );

  a3.$remove();

  deepEqual( all.all(), [a0, a1, a2, a4] );
});

test( 'create', function(assert)
{
  var create = Neuro({
    name: 'create',
    fields: ['id', 'name', 'created_at'],
    defaults: {
      created_at: Date.now
    }
  });

  var c0 = create.create({name: 'name0'});

  strictEqual( c0.name, 'name0' );
  ok( c0.$isSaved() );
});