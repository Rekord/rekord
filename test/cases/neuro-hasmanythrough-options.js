module( 'Neuro hasManyThrough options' );

function createUserGroups( prefix, usersGroupsOptions, groupsUsersOptions )
{
  var UserName = prefix + 'user';
  var GroupName = prefix + 'group';
  var UserGroupName = prefix + 'user_group';

  var User = Neuro({
    name: UserName,
    fields: ['id', 'name'],
    hasMany: {
      userGroups: {
        model: UserGroupName,
        foreign: 'user_id'
      }
    },
    hasManyThrough: {
      groups: Neuro.transfer( usersGroupsOptions || {}, {
        model: GroupName,
        through: UserGroupName,
        local: 'user_id',
        foreign: 'group_id'
      })
    }
  });

  var Group = Neuro({
    name: GroupName,
    fields: ['id', 'name'],
    hasMany: {
      userGroups: {
        model: UserGroupName,
        foreign: 'group_id'
      }
    },
    hasManyThrough: {
      users: Neuro.transfer( groupsUsersOptions || {}, {
        model: UserName,
        through: UserGroupName,
        local: 'group_id',
        foreign: 'user_id'
      })
    }
  });

  var UserGroup = Neuro({
    name: UserGroupName,
    key: ['user_id', 'group_id'],
    fields: ['user_id', 'group_id'],
    belongsTo: {
      group: {
        model: GroupName,
        local: 'group_id'
      },
      user: {
        model: UserName,
        local: 'user_id'
      }
    }
  });

  return {
    User: User,
    Group: Group,
    UserGroup: UserGroup
  };
}

function seedUserGroups1( test )
{
  var User = test.User;
  var Group = test.Group;
  var UserGroup = test.UserGroup;

  var g0 = Group.create({name: 'g0'});
  var g1 = Group.create({name: 'g1'});
  var u0 = User.create({name: 'u0', groups: [g0, g1]});

  var ug0 = g0.userGroups[0];
  var ug1 = g1.userGroups[0];

  strictEqual( g0.userGroups.length, 1 );
  strictEqual( ug0.user, u0 );
  strictEqual( ug0.group, g0 );
  strictEqual( g0.users.length, 1 );
  strictEqual( g0.users[0], u0 );

  strictEqual( g1.userGroups.length, 1 );
  strictEqual( ug1.user, u0 );
  strictEqual( ug1.group, g1 );
  strictEqual( g1.users.length, 1 );
  strictEqual( g1.users[0], u0 );

  strictEqual( u0.groups.length, 2 );
  strictEqual( u0.groups[0], g0 );
  strictEqual( u0.groups[1], g1 );
  strictEqual( u0.userGroups.length, 2 );
  strictEqual( u0.userGroups[0], ug0 );
  strictEqual( u0.userGroups[1], ug1 );

  test.g0 = g0;
  test.g1 = g1;
  test.u0 = u0;
  test.ug0 = ug0;
  test.ug1 = ug1;
}

test( 'model string', function(assert)
{
  var prefix = 'hasManyThrough_model_string_';

  var test = createUserGroups( prefix );
  var User = test.User;
  var Group = test.Group;
  var UserGroup = test.UserGroup;

  strictEqual( User.Database.relations.groups.model, Group );
  strictEqual( User.Database.relations.groups.through, UserGroup );
  strictEqual( User.Database.relations.userGroups.model, UserGroup );

  strictEqual( Group.Database.relations.users.model, User );
  strictEqual( Group.Database.relations.users.through, UserGroup );
  strictEqual( Group.Database.relations.userGroups.model, UserGroup );

  strictEqual( UserGroup.Database.relations.user.model, User );
  strictEqual( UserGroup.Database.relations.group.model, Group );
});

test( 'store none', function(assert)
{
  var prefix = 'hasManyThrough_store_none_';

  var options = {
    store: Neuro.Store.None
  };

  var test = createUserGroups( prefix, options, options );
  var User = test.User;
  var Group = test.Group;
  var UserGroup = test.UserGroup;

  seedUserGroups1( test );

  var g0 = test.g0;
  var g1 = test.g1;
  var u0 = test.u0;

  var local = User.Database.store;
  var remote = User.Database.rest;

  deepEqual( local.lastRecord, {
    id: u0.id, name: u0.name,
    $saved: {id: u0.id, name: u0.name}
  });
  deepEqual( remote.lastRecord, {
    id: u0.id, name: u0.name
  });
});

test( 'store model', function(assert)
{
  var prefix = 'hasManyThrough_store_model_';

  var userOptions = {
    store: Neuro.Store.Model
  };

  var test = createUserGroups( prefix, userOptions );
  var User = test.User;
  var Group = test.Group;
  var UserGroup = test.UserGroup;

  seedUserGroups1( test );

  var g0 = test.g0;
  var g1 = test.g1;
  var u0 = test.u0;

  var local = User.Database.store;
  var remote = User.Database.rest;

  deepEqual( local.lastRecord, {
    id: u0.id, name: u0.name,
    $saved: {id: u0.id, name: u0.name},
    groups: [
      g0.$local,
      g1.$local
    ]
  });
  deepEqual( remote.lastRecord, {
    id: u0.id, name: u0.name
  });
});

test( 'store key', function(assert)
{
  var prefix = 'hasManyThrough_store_key_';

  var userOptions = {
    store: Neuro.Store.Key
  };

  var test = createUserGroups( prefix, userOptions );
  var User = test.User;
  var Group = test.Group;
  var UserGroup = test.UserGroup;

  seedUserGroups1( test );

  var g0 = test.g0;
  var g1 = test.g1;
  var u0 = test.u0;

  var local = User.Database.store;
  var remote = User.Database.rest;

  deepEqual( local.lastRecord, {
    id: u0.id, name: u0.name,
    $saved: {id: u0.id, name: u0.name},
    groups: [ g0.id, g1.id ]
  });
  deepEqual( remote.lastRecord, {
    id: u0.id, name: u0.name
  });
});

test( 'store keys', function(assert)
{
  var prefix = 'hasManyThrough_store_keys_';

  // maybe later

  notOk();
});

test( 'save none', function(assert)
{
  var prefix = 'hasManyThrough_save_none_';

  var userOptions = {
    save: Neuro.Save.None
  };

  var test = createUserGroups( prefix, userOptions );
  var User = test.User;
  var Group = test.Group;
  var UserGroup = test.UserGroup;

  seedUserGroups1( test );

  var g0 = test.g0;
  var g1 = test.g1;
  var u0 = test.u0;

  var local = User.Database.store;
  var remote = User.Database.rest;

  deepEqual( local.lastRecord, {
    id: u0.id, name: u0.name,
    $saved: {id: u0.id, name: u0.name}
  });
  deepEqual( remote.lastRecord, {
    id: u0.id, name: u0.name
  });
});

test( 'save model', function(assert)
{
  var prefix = 'hasManyThrough_save_model_';

  var userOptions = {
    save: Neuro.Save.Model
  };

  var test = createUserGroups( prefix, userOptions );
  var User = test.User;
  var Group = test.Group;
  var UserGroup = test.UserGroup;

  seedUserGroups1( test );

  var g0 = test.g0;
  var g1 = test.g1;
  var u0 = test.u0;

  var local = User.Database.store;
  var remote = User.Database.rest;

  deepEqual( local.lastRecord, {
    id: u0.id, name: u0.name,
    $saved: {id: u0.id, name: u0.name}
  });
  deepEqual( remote.map.get( u0.id ), {
    id: u0.id, name: u0.name,
    groups: [ g0.$saved, g1.$saved ]
  });
});

test( 'property true', function(assert)
{
  var prefix = 'hasManyThrough_property_true_';

  var options = {
    property: true
  };

  var test = createUserGroups( prefix, options, options );
  var User = test.User;
  var Group = test.Group;
  var UserGroup = test.UserGroup;

  seedUserGroups1( test );
});

test( 'property false', function(assert)
{
  var prefix = 'hasManyThrough_property_false_';

  var options = {
    property: false
  };

  var test = createUserGroups( prefix, options, options );
  var User = test.User;
  var Group = test.Group;
  var UserGroup = test.UserGroup;

  var g0 = Group.create({name: 'g0'});
  var g1 = Group.create({name: 'g1'});
  var u0 = User.create({name: 'u0', groups: [g0, g1]});

  var ug0 = g0.userGroups[0];
  var ug1 = g1.userGroups[0];

  strictEqual( g0.userGroups.length, 1 );
  strictEqual( ug0.user, u0 );
  strictEqual( ug0.group, g0 );
  strictEqual( g0.users, void 0 );

  strictEqual( g1.userGroups.length, 1 );
  strictEqual( ug1.user, u0 );
  strictEqual( ug1.group, g1 );
  strictEqual( g1.users, void 0 );

  strictEqual( u0.groups, void 0 );
  strictEqual( u0.userGroups.length, 2 );
  strictEqual( u0.userGroups[0], ug0 );
  strictEqual( u0.userGroups[1], ug1 );
});

test( 'comparator', function(assert)
{
  var prefix = 'hasManyThrough_comparator_';

  var options = {
    comparator: 'name'
  };

  var test = createUserGroups( prefix, options, options );
  var User = test.User;
  var Group = test.Group;
  var UserGroup = test.UserGroup;

  var g0 = Group.create({name: 'C'});
  var g1 = Group.create({name: 'A'});
  var g2 = Group.create({name: 'B'});
  var u0 = User.create({name: 'u0', groups: [g0, g1, g2]});

  var expected = [g1, g2, g0];

  deepEqual( u0.groups, expected );
});

test( 'comparatorNullsFirst', function(assert)
{
  var prefix = 'hasManyThrough_comparatorNullsFirst_';

  var options = {
    comparator: 'name',
    comparatorNullsFirst: true
  };

  var test = createUserGroups( prefix, options, options );
  var User = test.User;
  var Group = test.Group;
  var UserGroup = test.UserGroup;

  var g0 = Group.create({name: 'C'});
  var g1 = Group.create({name: 'A'});
  var g2 = Group.create({name: null});
  var u0 = User.create({name: 'u0', groups: [g0, g1, g2]});

  var expected = [g2, g1, g0];

  deepEqual( u0.groups, expected );
});

test( 'cascadeRemove true', function(assert)
{ 
  var prefix = 'hasManyThrough_cascadeRemove_true_';

  var options = {
    cascadeRemove: Neuro.Cascade.All
  };

  var test = createUserGroups( prefix, options, options );
  var User = test.User;
  var Group = test.Group;
  var UserGroup = test.UserGroup;

  seedUserGroups1( test );

  var g0 = test.g0;
  var g1 = test.g1;
  var u0 = test.u0;
  var ug0 = test.ug0;
  var ug1 = test.ug1;

  ok( ug0.$exists() );
  ok( ug1.$exists() );

  g0.$remove();

  notOk( ug0.$exists() );
  ok( ug1.$exists() );
});

test( 'cascadeRemove false', function(assert)
{
  var prefix = 'hasManyThrough_cascadeRemove_false_';

  var options = {
    cascadeRemove: Neuro.Cascade.None
  };

  var test = createUserGroups( prefix, options, options );
  var User = test.User;
  var Group = test.Group;
  var UserGroup = test.UserGroup;

  seedUserGroups1( test );

  var g0 = test.g0;
  var g1 = test.g1;
  var u0 = test.u0;
  var ug0 = test.ug0;
  var ug1 = test.ug1;

  ok( ug0.$exists() );
  ok( ug1.$exists() );

  g0.$remove();

  notOk( ug0.$exists() );
  ok( ug1.$exists() );
});

test( 'cascadeSave true', function(assert)
{
  var prefix = 'hasManyThrough_cascadeSave_true_';

  var options = {
    cascadeSaveRelated: Neuro.Cascade.All
  };

  var test = createUserGroups( prefix, options, options );
  var User = test.User;
  var Group = test.Group;
  var UserGroup = test.UserGroup;

  seedUserGroups1( test );

  var g0 = test.g0;
  var g1 = test.g1;
  var u0 = test.u0;

  strictEqual( g0.$saved.name, 'g0' );

  g0.name = 'g0a';

  u0.$save();

  strictEqual( g0.$saved.name, 'g0a' );
});

test( 'cascadeSave false', function(assert)
{
  var prefix = 'hasManyThrough_cascadeSave_false_';

  var options = {
    cascadeSaveRelated: Neuro.Cascade.None
  };

  var test = createUserGroups( prefix, options, options );
  var User = test.User;
  var Group = test.Group;
  var UserGroup = test.UserGroup;

  seedUserGroups1( test );

  var g0 = test.g0;
  var g1 = test.g1;
  var u0 = test.u0;

  strictEqual( g0.$saved.name, 'g0' );

  g0.name = 'g0a';

  u0.$save();

  strictEqual( g0.$saved.name, 'g0' );

  g0.$save();

  strictEqual( g0.$saved.name, 'g0a' );
});
