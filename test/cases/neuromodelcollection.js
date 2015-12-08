module( 'NeuroModelCollection' );

test( 'duplicate value', function(assert)
{
  var prefix = 'NeuroModelCollection_duplicate_value_';

  var Todo = Neuro({
    name: prefix + 'todo',
    fields: ['name', 'done']
  });

  var all = Todo.all();
  var filtered = all.filtered();
  var page = filtered.page(10);

  strictEqual( all.length, 0 );
  strictEqual( filtered.length, 0 );
  strictEqual( page.length, 0 );

  var t0 = new Todo({name: 't0'});
  t0.$save();
  t0.$save();

  strictEqual( all.length, 1 );
  strictEqual( filtered.length, 1 );
  strictEqual( page.length, 1 );
});