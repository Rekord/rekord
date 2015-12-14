module( 'Neuro live' );

test( 'live saving', function(assert)
{
  var Todo = Neuro({
    name: 'live_saving',
    fields: ['id', 'name']
  });

  var live = Todo.Database.live;

  var t0 = Todo.create({name: 'name0'});

  ok( t0.$isSaved() );

  live.liveSave( {id: t0.id, name: 'name1'} );

  strictEqual( t0.name, 'name1' );
});

test( 'live removing', function(assert)
{
  var Todo = Neuro({
    name: 'live_removing',
    fields: ['id', 'name']
  });

  var live = Todo.Database.live;

  var t0 = Todo.create({name: 'name0'});

  ok( t0.$isSaved() );
  notOk( t0.$isDeleted() );

  live.liveRemove( t0.id );

  ok( t0.$isDeleted() );
});