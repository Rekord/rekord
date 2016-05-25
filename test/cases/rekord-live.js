module( 'Rekord live' );

test( 'live saving', function(assert)
{
  var Todo = Rekord({
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
  var Todo = Rekord({
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

test( 'saved returned fields published', function(assert)
{
  var prefix = 'saved_returned_fields_published_';

  var Todo = Rekord({
    name: prefix + 'todo',
    fields: ['name', 'updated_at']
  });

  var rest = Todo.Database.rest;
  var live = Todo.Database.live;

  rest.returnValue = {updated_at: 23};

  deepEqual( live.lastMessage, null );

  Todo.create({id: 4, name: 'taco'});

  deepEqual( live.lastMessage.model, {id: 4, name: 'taco', updated_at: 23} );
});
