module( 'Neuro hasManyThrough' );

test( 'no initial value', function(assert)
{
  var prefix = 'hasManyThrough_no_initial_';

  var test = createUserGroups1( prefix );
  var User = test.User;
  var Group = test.Group;
  var UserGroup = test.UserGroup;

  var u0 = User.create({name: 'u0'});

  deepEqual( u0.groups.toArray(), [] );
});

test( 'initial value', function(assert)
{
  var prefix = 'hasManyThrough_initial_';

  var test = createUserGroups1( prefix );

  seedUserGroups1( test );
});

test( 'ninja remove', function(assert)
{
  var prefix = 'hasManyThrough_ninja_remove_';

  var test = createUserGroups1( prefix );

  seedUserGroups1( test );

  var g0 = test.g0;
  var g1 = test.g1;
  var u0 = test.u0;
  var ug0 = test.ug0;

  ug0.$remove();

  deepEqual( u0.groups.toArray(), [g1] );
  deepEqual( g0.users.toArray(), [] );
});

test( 'ninja save sort', function(assert)
{
  var prefix = 'hasManyThrough_ninja_save_sort_';

  var options = {
    comparator: 'name'
  };

  var test = createUserGroups1( prefix, options, options );

  seedUserGroups1( test );

  var g0 = test.g0;
  var g1 = test.g1;
  var u0 = test.u0;
  var ug0 = test.ug0;

  var expected0 = [g0, g1];

  deepEqual( u0.groups.toArray(), expected0 );

  g1.$save( 'name', 'a' );

  var expected1 = [g1, g0];

  deepEqual( u0.groups.toArray(), expected1 );
});

test( 'ninja save add', function(assert)
{
  var prefix = 'hasManyThrough_ninja_save_add_';

  var test = createUserGroups1( prefix );
  var Group = test.Group;
  var UserGroup = test.UserGroup;

  seedUserGroups1( test );

  var u0 = test.u0;
  var g0 = test.g0;
  var g1 = test.g1;
  var g2 = Group.create({name: 'g2'});

  deepEqual( u0.groups.toArray(), [g0, g1] );

  var ug2 = UserGroup.create({user_id: u0.id, group_id: g2.id});

  deepEqual( u0.groups.toArray(), [g0, g1, g2] );
});

test( 'set', function(assert)
{
  var prefix = 'hasManyThrough_set_';

  var test = createUserGroups1( prefix );
  var Group = test.Group;
  var UserGroup = test.UserGroup;

  seedUserGroups1( test );

  var u0 = test.u0;
  var g0 = test.g0;
  var g1 = test.g1;
  var g2 = Group.create({name: 'g2'});

  u0.groups.set( [g0, g2] );

  deepEqual( u0.groups.toArray(), [g0, g2] );
  strictEqual( u0.userGroups.length, 2 );
});

test( 'relate', function(assert)
{
  var prefix = 'hasManyThrough_relate_';

  var test = createUserGroups1( prefix );
  var User = test.User;
  var Group = test.Group;
  var UserGroup = test.UserGroup;

  var g0 = Group.create({name: 'g0'});
  var g1 = Group.create({name: 'g1'});
  var g2 = Group.create({name: 'g2'});
  var u0 = User.create({name: 'u0'});

  strictEqual( u0.groups.length, 0 );
  strictEqual( u0.userGroups.length, 0 );

  u0.groups.relate( g0.id );

  strictEqual( u0.groups.length, 1 );
  strictEqual( u0.groups[0], g0 );
  strictEqual( u0.userGroups.length, 1 );

  u0.groups.relate( g1 );

  strictEqual( u0.groups.length, 2 );
  strictEqual( u0.groups[1], g1 );
  strictEqual( u0.userGroups.length, 2 );

  u0.groups.relate( [g2] );

  strictEqual( u0.groups.length, 3 );
  strictEqual( u0.groups[2], g2 );
  strictEqual( u0.userGroups.length, 3 );
});

test( 'unrelate', function(assert)
{
  var prefix = 'hasManyThrough_unrelate_';

  var test = createUserGroups1( prefix );
  var User = test.User;
  var Group = test.Group;
  var UserGroup = test.UserGroup;

  var g0 = Group.create({name: 'g0'});
  var g1 = Group.create({name: 'g1'});
  var g2 = Group.create({name: 'g2'});
  var u0 = User.create({name: 'u0', groups: [g0, g1, g2]});

  strictEqual( u0.groups.length, 3 );
  strictEqual( u0.userGroups.length, 3 );

  u0.groups.unrelate( g0.id );

  deepEqual( u0.groups.toArray(), [g2, g1] );
  strictEqual( u0.userGroups.length, 2 );

  u0.groups.unrelate( g2 );

  deepEqual( u0.groups.toArray(), [g1] );
  strictEqual( u0.userGroups.length, 1 );

  u0.groups.unrelate();

  strictEqual( u0.groups.length, 0 );
  strictEqual( u0.userGroups.length, 0 );
});

test( 'isRelated', function(assert)
{
  var prefix = 'hasManyThrough_isRelated_';

  var test = createUserGroups1( prefix );
  var User = test.User;
  var Group = test.Group;
  var UserGroup = test.UserGroup;

  var g0 = Group.create({name: 'g0'});
  var g1 = Group.create({name: 'g1'});
  var g2 = Group.create({name: 'g2'});
  var u0 = User.create({name: 'u0', groups: [g0, g1, g2]});

  ok( u0.groups.isRelated( g0.id ) );
  ok( u0.groups.isRelated( g1 ) );
  ok( u0.groups.isRelated( [g2] ) );
  ok( u0.groups.isRelated( [g0.id] ) );
  
  g1.$remove();

  notOk( u0.groups.isRelated( g1 ) );
});

test( 'get', function(assert)
{
  var prefix = 'hasManyThrough_get_';
  
  var test = createUserGroups1( prefix );
  var User = test.User;
  var Group = test.Group;
  var UserGroup = test.UserGroup;

  var g0 = Group.create({name: 'g0'});
  var g1 = Group.create({name: 'g1'});
  var g2 = Group.create({name: 'g2'});
  var u0 = User.create({name: 'u0', groups: [g0, g1, g2]});

  var expected = [g0, g1, g2];

  deepEqual( u0.$get( 'groups').toArray(), expected );
  strictEqual( u0.$get( 'groups' ), u0.groups );
});

test( 'encode', function(assert)
{
  var prefix = 'hasManyThrough_encode_';
  
  var userOptions = {
    save: Neuro.Save.Model,
    store: Neuro.Store.Model
  };

  var test = createUserGroups1( prefix, userOptions );
  var User = test.User;
  var Group = test.Group;
  var UserGroup = test.UserGroup;

  var g0 = Group.create({name: 'g0'});
  var g1 = Group.create({name: 'g1'});
  var u0 = User.create({name: 'u0', groups: [g0, g1]});

  var saving0 = u0.$toJSON( true );
  var storing0 = u0.$toJSON( false );

  deepEqual( saving0, {
    id: u0.id, name: u0.name, 
    groups: [ g0.$saved, g1.$saved ]
  });

  deepEqual( storing0, {
    id: u0.id, name: u0.name, 
    groups: [ g0.$local, g1.$local ]
  });

  u0.groups.unrelate();

  var saving1 = u0.$toJSON( true );
  var storing1 = u0.$toJSON( false );

  deepEqual( saving1, {
    id: u0.id, name: u0.name, 
    groups: []
  });

  deepEqual( storing1, {
    id: u0.id, name: u0.name, 
    groups: []
  });
});

test( 'auto save parent', function(assert)
{
  var prefix = 'hasManyThrough_auto_save_parent_';
  
  var userOptions = {
    save: Neuro.Save.Model
  };

  var test = createUserGroups1( prefix, userOptions );
  var User = test.User;
  var Group = test.Group;
  var UserGroup = test.UserGroup;

  var remote = User.Database.rest;

  var g0 = Group.create({name: 'g0'});
  var g1 = Group.create({name: 'g1'});
  var u0 = User.create({name: 'u0', groups: [g0, g1]});

  deepEqual( remote.lastRecord, {
    id: u0.id, name: u0.name,
    groups: [
      {id: g0.id, name: 'g0'},
      {id: g1.id, name: 'g1'}
    ]
  });

  g0.$save( 'name', 'g0a' );

  deepEqual( remote.lastRecord, {
    groups: [
      {id: g0.id, name: 'g0a'},
      {id: g1.id, name: 'g1'}
    ]
  });
});

test( 'test ninja through remove', function(assert)
{
  var prefix = 'hasManyThrough_ninja_through_remove_';
  
  var test = createUserGroups1( prefix );
  var User = test.User;
  var Group = test.Group;
  var UserGroup = test.UserGroup;

  seedUserGroups1( test );

  var u0 = test.u0;
  var g0 = test.g0;
  var g1 = test.g1;
  var ug0 = test.ug0;
  var ug1 = test.ug1;

  deepEqual( u0.groups.toArray(), [g0, g1] );

  ug0.$remove();

  deepEqual( u0.groups.toArray(), [g1] );
});
