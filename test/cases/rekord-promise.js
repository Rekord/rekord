module( 'Rekord Promise' );

test( '#isPending()', function(assert)
{
  var p = new Rekord.Promise();

  ok( p.isPending() );
  notOk( p.isSuccess() );
  notOk( p.isUnsuccessful() );
  notOk( p.isFailure() );
  notOk( p.isOffline() );
  notOk( p.isCanceled() );
});

test( '#resolve()', function(assert)
{
  var p = new Rekord.Promise();

  expect( 5 );

  p.success(function(resolved)
  {
    strictEqual( resolved, 'Hello World' );
  });

  p.failure(function()
  {
    ok( false, 'Failure not expected' );
  });

  p.offline(function()
  {
    ok( false, 'Offline not expected' );
  });

  ok( p.isPending() );

  p.resolve( 'Hello World' );

  p.success(function(resolved)
  {
    strictEqual( resolved, 'Hello World' );
  });

  ok( p.isSuccess() );
  notOk( p.isPending() );
});

test( '#reject()', function(assert)
{
  var p = new Rekord.Promise();

  expect( 6 );

  p.success(function(resolved)
  {
    ok( false, 'Success not expected' );
  });

  p.failure(function(reason)
  {
    strictEqual( reason, 'Hello World' );
  });

  p.offline(function()
  {
    ok( false, 'Offline not expected' );
  });

  ok( p.isPending() );

  p.reject( 'Hello World' );

  p.failure(function(resolved)
  {
    strictEqual( resolved, 'Hello World' );
  });

  notOk( p.isSuccess() );
  ok( p.isFailure() );
  notOk( p.isPending() );
});

test( '#noline()', function(assert)
{
  var p = new Rekord.Promise();

  expect( 7 );

  p.success(function(resolved)
  {
    ok( false, 'Success not expected' );
  });

  p.failure(function(reason)
  {
    ok( false, 'Failure not expected' );
  });

  p.offline(function(status)
  {
    strictEqual( status, 'Hello World' );
  });

  ok( p.isPending() );

  p.noline( 'Hello World' );

  p.offline(function(status)
  {
    strictEqual( status, 'Hello World' );
  });

  notOk( p.isSuccess() );
  notOk( p.isFailure() );
  notOk( p.isPending() );
  ok( p.isOffline() );
});

test( '#cancel()', function()
{
  var p = new Rekord.Promise();

  expect( 2 );

  p.success(function(resolved)
  {
    ok( false, 'Success not expected' );
  });

  p.failure(function(reason)
  {
    ok( false, 'Failure not expected' );
  });

  p.offline(function(status)
  {
    ok( false, 'Failure not expected' );
  });

  p.canceled(function(reason)
  {
    strictEqual( reason, 'Hello World' );
  });

  p.cancel( 'Hello World' );

  ok( p.isCanceled() );

  p.resolve();
  p.reject();
  p.noline();
});

test( '#cancel() cancelable:false', function()
{
  var p = new Rekord.Promise( null, false );

  expect( 4 );

  p.success(function(resolved)
  {
    strictEqual( resolved, 'Hello World' );
  });

  p.failure(function(reason)
  {
    ok( false, 'Failure not expected' );
  });

  p.offline(function(status)
  {
    ok( false, 'Failure not expected' );
  });

  p.canceled(function(reason)
  {
    ok( false, 'Canceled not expected' );
  });

  p.cancel( 'Hello World ignored' );

  ok( p.isPending() );
  notOk( p.isCanceled() );

  p.resolve( 'Hello World' );

  p.reject();
  p.noline();

  ok( p.isSuccess() );
});

test( '#then() success', function(assert)
{
  var p = new Rekord.Promise();
  var context = {};

  expect( 4 );

  function correct(result)
  {
    strictEqual( result, 'Hello World' );
    strictEqual( context, this );
  }

  function incorrect()
  {
    ok( false, 'Invalid status' );
  }

  p.then( correct, incorrect, incorrect, incorrect, context );

  p.resolve( 'Hello World' );

  p.then( correct, incorrect, incorrect, incorrect, context );
});

test( '#then() failure', function(assert)
{
  var p = new Rekord.Promise();
  var context = {};

  expect( 4 );

  function correct(result)
  {
    strictEqual( result, 'Hello World' );
    strictEqual( context, this );
  }

  function incorrect()
  {
    ok( false, 'Invalid status' );
  }

  p.then( incorrect, correct, incorrect, incorrect, context );

  p.reject( 'Hello World' );

  p.then( incorrect, correct, incorrect, incorrect, context );
});

test( '#then() offline', function(assert)
{
  var p = new Rekord.Promise();
  var context = {};

  expect( 4 );

  function correct(result)
  {
    strictEqual( result, 'Hello World' );
    strictEqual( context, this );
  }

  function incorrect()
  {
    ok( false, 'Invalid status' );
  }

  p.then( incorrect, incorrect, correct, incorrect, context );

  p.noline( 'Hello World' );

  p.then( incorrect, incorrect, correct, incorrect, context );
});

test( '#then() cancel', function(assert)
{
  var p = new Rekord.Promise();
  var context = {};

  expect( 4 );

  function correct(result)
  {
    strictEqual( result, 'Hello World' );
    strictEqual( context, this );
  }

  function incorrect()
  {
    ok( false, 'Invalid status' );
  }

  p.then( incorrect, incorrect, incorrect, correct, context );

  p.cancel( 'Hello World' );

  p.then( incorrect, incorrect, incorrect, correct, context );
});

test( '#unsuccessful() success', function(assert)
{
  var p = new Rekord.Promise();

  expect( 0 );

  function incorrect(result)
  {
    ok( false, 'Invalid status' );
  }

  p.unsuccessful( incorrect );

  p.resolve( 'Hello World' );

  p.unsuccessful( incorrect );
});

test( '#unsuccessful() failure', function(assert)
{
  var p = new Rekord.Promise();

  expect( 2 );

  function correct(result)
  {
    strictEqual( result, 'Hello World' );
  }

  p.unsuccessful( correct );

  p.reject( 'Hello World' );

  p.unsuccessful( correct );
});

test( '#unsuccessful() offline', function(assert)
{
  var p = new Rekord.Promise();

  expect( 2 );

  function correct(result)
  {
    strictEqual( result, 'Hello World' );
  }

  p.unsuccessful( correct );

  p.noline( 'Hello World' );

  p.unsuccessful( correct );
});

test( '#unsuccessful() cancel', function(assert)
{
  var p = new Rekord.Promise();

  expect( 2 );

  function correct(result)
  {
    strictEqual( result, 'Hello World' );
  }

  p.unsuccessful( correct );

  p.cancel( 'Hello World' );

  p.unsuccessful( correct );
});

test( '#complete() success', function(assert)
{
  var p = new Rekord.Promise();

  expect( 2 );

  function correct(result)
  {
    strictEqual( result, 'Hello World' );
  }

  p.complete( correct );

  p.resolve( 'Hello World' );

  p.complete( correct );
});

test( '#complete() failure', function(assert)
{
  var p = new Rekord.Promise();

  expect( 2 );

  function correct(result)
  {
    strictEqual( result, 'Hello World' );
  }

  p.complete( correct );

  p.reject( 'Hello World' );

  p.complete( correct );
});

test( '#complete() offline', function(assert)
{
  var p = new Rekord.Promise();

  expect( 2 );

  function correct(result)
  {
    strictEqual( result, 'Hello World' );
  }

  p.complete( correct );

  p.noline( 'Hello World' );

  p.complete( correct );
});

test( '#complete() cancel', function(assert)
{
  var p = new Rekord.Promise();

  expect( 2 );

  function correct(result)
  {
    strictEqual( result, 'Hello World' );
  }

  p.complete( correct );

  p.cancel( 'Hello World' );

  p.complete( correct );
});

test( '.resolve()', function(assert)
{
  var p = Rekord.Promise.resolve( 'Hello World' );

  expect( 2 );

  ok( p.isSuccess() );

  p.success(function(result)
  {
    strictEqual( result, 'Hello World' );
  });
});

test( '.reject()', function(assert)
{
  var p = Rekord.Promise.reject( 'Hello World' );

  expect( 2 );

  ok( p.isFailure() );

  p.failure(function(result)
  {
    strictEqual( result, 'Hello World' );
  });
});

test( '.noline()', function(assert)
{
  var p = Rekord.Promise.noline( 'Hello World' );

  expect( 2 );

  ok( p.isOffline() );

  p.offline(function(result)
  {
    strictEqual( result, 'Hello World' );
  });
});

test( '.cancel()', function(assert)
{
  var p = Rekord.Promise.cancel( 'Hello World' );

  expect( 2 );

  ok( p.isCanceled() );

  p.canceled(function(result)
  {
    strictEqual( result, 'Hello World' );
  });
});

test( '.race() success', function(assert)
{
  var p0 = new Rekord.Promise();
  var p1 = new Rekord.Promise();
  var p2 = new Rekord.Promise();
  var p3 = new Rekord.Promise();

  var r = Rekord.Promise.race([p0, p1, undefined, p2, undefined, p3]);

  var counter = 0;

  expect( 5 );

  ok( r.isPending() );

  r.success(function(result)
  {
    strictEqual( result, 'Hello World' );
    strictEqual( ++counter, 1 );
  });

  r.failure(function(result)
  {
    ok( false, 'Invalid status');
  });

  r.offline(function(result)
  {
    ok( false, 'Invalid status');
  });

  strictEqual( counter, 0 );

  p0.resolve( 'Hello World' );

  strictEqual( counter, 1 );

  p1.reject();
  p2.noline();
});

test( '.race() failure', function(assert)
{
  var p0 = new Rekord.Promise();
  var p1 = new Rekord.Promise();
  var p2 = new Rekord.Promise();
  var p3 = new Rekord.Promise();

  var r = Rekord.Promise.race([p0, p1, undefined, p2, undefined, p3]);

  var counter = 0;

  expect( 5 );

  ok( r.isPending() );

  r.success(function(result)
  {
    ok( false, 'Invalid status');
  });

  r.failure(function(result)
  {
    strictEqual( result, 'Hello World' );
    strictEqual( ++counter, 1 );
  });

  r.offline(function(result)
  {
    ok( false, 'Invalid status');
  });

  strictEqual( counter, 0 );

  p0.reject( 'Hello World' );

  strictEqual( counter, 1 );

  p1.resolve();
  p2.noline();
});

test( '.race() offline', function(assert)
{
  var p0 = new Rekord.Promise();
  var p1 = new Rekord.Promise();
  var p2 = new Rekord.Promise();
  var p3 = new Rekord.Promise();

  var r = Rekord.Promise.race([p0, p1, undefined, p2, undefined, p3]);

  var counter = 0;

  expect( 5 );

  ok( r.isPending() );

  r.success(function(result)
  {
    ok( false, 'Invalid status');
  });

  r.failure(function(result)
  {
    ok( false, 'Invalid status');
  });

  r.offline(function(result)
  {
    strictEqual( result, 'Hello World' );
    strictEqual( ++counter, 1 );
  });

  strictEqual( counter, 0 );

  p0.noline( 'Hello World' );

  strictEqual( counter, 1 );

  p1.resolve();
  p2.resolve();
});

test( '.race() canceled', function(assert)
{
  var p0 = new Rekord.Promise();
  var p1 = new Rekord.Promise();
  var p2 = new Rekord.Promise();
  var p3 = new Rekord.Promise();

  var r = Rekord.Promise.race([p0, p1, undefined, p2, undefined, p3]);

  var counter = 0;

  expect( 5 );

  ok( r.isPending() );

  r.success(function(result)
  {
    ok( false, 'Invalid status');
  });

  r.failure(function(result)
  {
    ok( false, 'Invalid status');
  });

  r.offline(function(result)
  {
    ok( false, 'Invalid status');
  });

  r.canceled(function(result)
  {
    strictEqual( result, 'Hello World' );
    strictEqual( ++counter, 1 );
  });

  strictEqual( counter, 0 );

  p0.cancel( 'Hello World' );

  strictEqual( counter, 1 );

  p1.resolve();
  p2.resolve();
});

test( '.all() success', function(assert)
{
  var p0 = new Rekord.Promise();
  var p1 = new Rekord.Promise();
  var p2 = new Rekord.Promise();
  var p3 = new Rekord.Promise();

  var all = Rekord.Promise.all([p0, undefined, p1, p2, p3]);

  var counter = 0;

  expect( 13 );

  all.then(
    function(result) {
      deepEqual( result, [[0], [1], [2], [3]] );
      strictEqual( ++counter, 1 );
    },
    function(result) {
      ok( false, 'Invalid status' );
    },
    function(result) {
      ok( false, 'Invalid status' );
    },
    function(result) {
      ok( false, 'Invalid status' );
    }
  );

  strictEqual( counter, 0 );
  ok( all.isPending() );

  p0.resolve( 0 );

  strictEqual( counter, 0 );
  ok( all.isPending() );

  p1.resolve( 1 );

  strictEqual( counter, 0 );
  ok( all.isPending() );

  p2.resolve( 2 );

  strictEqual( counter, 0 );
  ok( all.isPending() );

  p3.resolve( 3 );

  strictEqual( counter, 1 );
  notOk( all.isPending() );
  ok( all.isSuccess() );
});

test( '.all() failure', function(assert)
{
  var p0 = new Rekord.Promise();
  var p1 = new Rekord.Promise();
  var p2 = new Rekord.Promise();
  var p3 = new Rekord.Promise();

  var all = Rekord.Promise.all([p0, undefined, p1, p2, p3]);

  var counter = 0;

  expect( 13 );

  all.then(
    function(result) {
      ok( false, 'Invalid status' );
    },
    function(result) {
      deepEqual( result, 2 );
      strictEqual( ++counter, 1 );
    },
    function(result) {
      ok( false, 'Invalid status' );
    },
    function(result) {
      ok( false, 'Invalid status' );
    }
  );

  strictEqual( counter, 0 );
  ok( all.isPending() );

  p0.resolve( 0 );

  strictEqual( counter, 0 );
  ok( all.isPending() );

  p1.resolve( 1 );

  strictEqual( counter, 0 );
  ok( all.isPending() );

  p2.reject( 2 );

  strictEqual( counter, 1 );
  notOk( all.isPending() );

  p3.resolve( 3 );

  strictEqual( counter, 1 );
  notOk( all.isPending() );
  ok( all.isFailure() );
});

test( '.all() offline', function(assert)
{
  var p0 = new Rekord.Promise();
  var p1 = new Rekord.Promise();
  var p2 = new Rekord.Promise();
  var p3 = new Rekord.Promise();

  var all = Rekord.Promise.all([p0, undefined, p1, p2, p3]);

  var counter = 0;

  expect( 13 );

  all.then(
    function(result) {
      ok( false, 'Invalid status' );
    },
    function(result) {
      ok( false, 'Invalid status' );
    },
    function(result) {
      deepEqual( result, 2 );
      strictEqual( ++counter, 1 );
    },
    function(result) {
      ok( false, 'Invalid status' );
    }
  );

  strictEqual( counter, 0 );
  ok( all.isPending() );

  p0.resolve( 0 );

  strictEqual( counter, 0 );
  ok( all.isPending() );

  p1.resolve( 1 );

  strictEqual( counter, 0 );
  ok( all.isPending() );

  p2.noline( 2 );

  strictEqual( counter, 1 );
  notOk( all.isPending() );

  p3.resolve( 3 );

  strictEqual( counter, 1 );
  notOk( all.isPending() );
  ok( all.isOffline() );
});

test( '.all() canceled', function(assert)
{
  var p0 = new Rekord.Promise();
  var p1 = new Rekord.Promise();
  var p2 = new Rekord.Promise();
  var p3 = new Rekord.Promise();

  var all = Rekord.Promise.all([p0, undefined, p1, p2, p3]);

  var counter = 0;

  expect( 13 );

  all.then(
    function(result) {
      ok( false, 'Invalid status' );
    },
    function(result) {
      ok( false, 'Invalid status' );
    },
    function(result) {
      ok( false, 'Invalid status' );
    },
    function(result) {
      deepEqual( result, 2 );
      strictEqual( ++counter, 1 );
    }
  );

  strictEqual( counter, 0 );
  ok( all.isPending() );

  p0.resolve( 0 );

  strictEqual( counter, 0 );
  ok( all.isPending() );

  p1.resolve( 1 );

  strictEqual( counter, 0 );
  ok( all.isPending() );

  p2.cancel( 2 );

  strictEqual( counter, 1 );
  notOk( all.isPending() );

  p3.resolve( 3 );

  strictEqual( counter, 1 );
  notOk( all.isPending() );
  ok( all.isCanceled() );
});

test( '(executor) success', function(assert)
{
  var resolver, rejecter, offliner, canceler;

  var p = new Rekord.Promise(function(resolve, reject, offline, cancel) {
    resolver = resolve;
    rejecter = reject;
    offliner = offline;
    canceler = cancel;
  });

  expect( 3 );

  ok( p.isPending() );

  p.then(
    function(result) {
      strictEqual( result, 'Hello World' );
    },
    function(result) {
      ok( false, 'Invalid status' );
    },
    function(result) {
      ok( false, 'Invalid status' );
    },
    function(result) {
      ok( false, 'Invalid status' );
    }
  );

  resolver( 'Hello World' );

  ok( p.isSuccess() );
});

test( '(executor) failure', function(assert)
{
  var resolver, rejecter, offliner, canceler;

  var p = new Rekord.Promise(function(resolve, reject, offline, cancel) {
    resolver = resolve;
    rejecter = reject;
    offliner = offline;
    canceler = cancel;
  });

  expect( 3 );

  ok( p.isPending() );

  p.then(
    function(result) {
      ok( false, 'Invalid status' );
    },
    function(result) {
      strictEqual( result, 'Hello World' );
    },
    function(result) {
      ok( false, 'Invalid status' );
    },
    function(result) {
      ok( false, 'Invalid status' );
    }
  );

  rejecter( 'Hello World' );

  ok( p.isFailure() );
});

test( '(executor) offline', function(assert)
{
  var resolver, rejecter, offliner, canceler;

  var p = new Rekord.Promise(function(resolve, reject, offline, cancel) {
    resolver = resolve;
    rejecter = reject;
    offliner = offline;
    canceler = cancel;
  });

  expect( 3 );

  ok( p.isPending() );

  p.then(
    function(result) {
      ok( false, 'Invalid status' );
    },
    function(result) {
      ok( false, 'Invalid status' );
    },
    function(result) {
      strictEqual( result, 'Hello World' );
    },
    function(result) {
      ok( false, 'Invalid status' );
    }
  );

  offliner( 'Hello World' );

  ok( p.isOffline() );
});

test( '(executor) canceled', function(assert)
{
  var resolver, rejecter, offliner, canceler;

  var p = new Rekord.Promise(function(resolve, reject, offline, cancel) {
    resolver = resolve;
    rejecter = reject;
    offliner = offline;
    canceler = cancel;
  });

  expect( 3 );

  ok( p.isPending() );

  p.then(
    function(result) {
      ok( false, 'Invalid status' );
    },
    function(result) {
      ok( false, 'Invalid status' );
    },
    function(result) {
      ok( false, 'Invalid status' );
    },
    function(result) {
      strictEqual( result, 'Hello World' );
    }
  );

  canceler( 'Hello World' );

  ok( p.isCanceled() );
});

test( '.singularity() success', function(assert)
{
  var p0 = new Rekord.Promise();
  var p1 = new Rekord.Promise();
  var context = this;
  var counter = 0;

  expect( 10 );

  var s = Rekord.Promise.singularity( p0, context, function(s0)
  {
    strictEqual( ++counter, 1, 'singularity first level' );
    ok( s0.isPending(), 'still pending (1)' );
    strictEqual( context, this );

    Rekord.Promise.singularity( p1, context, function(s1)
    {
      strictEqual( ++counter, 2, 'singularity second level' );
      ok( s1.isPending(), 'still pending (2)' );
      strictEqual( context, this );
    });
  });

  strictEqual( counter, 2, 'both singularity called' );
  ok( s.isPending(), 'still pending' );

  p0.resolve();

  ok( s.isPending(), 'first resolved, still pending' );

  p1.resolve();

  ok( s.isSuccess(), 'second resolved, no longer pending' );
});

test( '.singularity() failure late', function(assert)
{
  var p0 = new Rekord.Promise();
  var p1 = new Rekord.Promise();
  var context = this;
  var counter = 0;

  expect( 10 );

  var s = Rekord.Promise.singularity( p0, context, function(s0)
  {
    strictEqual( ++counter, 1, 'singularity first level' );
    ok( s0.isPending(), 'still pending (1)' );
    strictEqual( context, this );

    Rekord.Promise.singularity( p1, context, function(s1)
    {
      strictEqual( ++counter, 2, 'singularity second level' );
      ok( s1.isPending(), 'still pending (2)' );
      strictEqual( context, this );
    });
  });

  strictEqual( counter, 2, 'both singularity called' );
  ok( s.isPending(), 'still pending' );

  p0.resolve();

  ok( s.isPending(), 'first resolved, still pending' );

  p1.reject();

  ok( s.isFailure(), 'second rejected, no longer pending' );
});

test( '.singularity() failure early', function(assert)
{
  var p0 = new Rekord.Promise();
  var p1 = new Rekord.Promise();
  var context = this;
  var counter = 0;

  expect( 10 );

  var s = Rekord.Promise.singularity( p0, context, function(s0)
  {
    strictEqual( ++counter, 1, 'singularity first level' );
    ok( s0.isPending(), 'still pending (1)' );
    strictEqual( context, this );

    Rekord.Promise.singularity( p1, context, function(s1)
    {
      strictEqual( ++counter, 2, 'singularity second level' );
      ok( s1.isPending(), 'still pending (2)' );
      strictEqual( context, this );
    });
  });

  strictEqual( counter, 2, 'both singularity called' );
  ok( s.isPending(), 'still pending' );

  p0.reject();

  ok( s.isFailure(), 'first rejected, no longer pending' );

  p1.resolve();

  ok( s.isFailure(), 'second resolved, no longer pending' );
});

test( '.singularity() offline late', function(assert)
{
  var p0 = new Rekord.Promise();
  var p1 = new Rekord.Promise();
  var context = this;
  var counter = 0;

  expect( 10 );

  var s = Rekord.Promise.singularity( p0, context, function(s0)
  {
    strictEqual( ++counter, 1, 'singularity first level' );
    ok( s0.isPending(), 'still pending (1)' );
    strictEqual( context, this );

    Rekord.Promise.singularity( p1, context, function(s1)
    {
      strictEqual( ++counter, 2, 'singularity second level' );
      ok( s1.isPending(), 'still pending (2)' );
      strictEqual( context, this );
    });
  });

  strictEqual( counter, 2, 'both singularity called' );
  ok( s.isPending(), 'still pending' );

  p0.resolve();

  ok( s.isPending(), 'first resolved, still pending' );

  p1.noline();

  ok( s.isOffline(), 'second rejected, no longer pending' );
});

test( '.singularity() offline early', function(assert)
{
  var p0 = new Rekord.Promise();
  var p1 = new Rekord.Promise();
  var context = this;
  var counter = 0;

  expect( 10 );

  var s = Rekord.Promise.singularity( p0, context, function(s0)
  {
    strictEqual( ++counter, 1, 'singularity first level' );
    ok( s0.isPending(), 'still pending (1)' );
    strictEqual( context, this );

    Rekord.Promise.singularity( p1, context, function(s1)
    {
      strictEqual( ++counter, 2, 'singularity second level' );
      ok( s1.isPending(), 'still pending (2)' );
      strictEqual( context, this );
    });
  });

  strictEqual( counter, 2, 'both singularity called' );
  ok( s.isPending(), 'still pending' );

  p0.noline();

  ok( s.isOffline(), 'first rejected, no longer pending' );

  p1.resolve();

  ok( s.isOffline(), 'second resolved, no longer pending' );
});

test( '.singularity() success', function(assert)
{
  var p1 = new Rekord.Promise();
  var context = this;
  var counter = 0;

  expect( 9 );

  var s = Rekord.Promise.singularity( context, function(s0)
  {
    strictEqual( ++counter, 1, 'singularity first level' );
    ok( s0.isPending(), 'still pending (1)' );
    strictEqual( context, this );

    Rekord.Promise.singularity( p1, context, function(s1)
    {
      strictEqual( ++counter, 2, 'singularity second level' );
      ok( s1.isPending(), 'still pending (2)' );
      strictEqual( context, this );
    });
  });

  strictEqual( counter, 2, 'both singularity called' );
  ok( s.isPending(), 'still pending' );

  p1.resolve();

  ok( s.isSuccess(), 'second resolved, no longer pending' );
});

test( 'chaining success sync', function(assert)
{
  var p1 = new Rekord.Promise();
  var p2 = new Rekord.Promise();

  expect(4);

  p1
    .then(function(result) {
      notOk(p1.isPending());
      strictEqual(result, 'p1');
      return p2;
    })
    .then(function(result) {
      notOk(p2.isPending());
      strictEqual(result, 'p2');
    })
    .catch(function() {
      ok( false );
    })
  ;

  p1.resolve('p1');
  p2.resolve('p2');
});

test( 'chaining failure sync', function(assert)
{
  var p1 = new Rekord.Promise();
  var p2 = new Rekord.Promise();

  expect(4);

  p1
    .then(function(result) {
      notOk(p1.isPending());
      strictEqual(result, 'p1');
      return p2;
    })
    .then(function(result) {
      ok( false );
    })
    .catch(function(result) {
      notOk(p2.isPending());
      strictEqual(result, 'p2');
    })
  ;

  p1.resolve('p1');
  p2.reject('p2');
});

test( 'chaining failure sync 1st', function(assert)
{
  var p1 = new Rekord.Promise();
  var p2 = new Rekord.Promise();

  expect(2);

  p1
    .then(function(result) {
      ok( false );
      return p2;
    })
    .then(function(result) {
      ok( false );
    })
    .catch(function(result) {
      ok(p2.isPending());
      strictEqual(result, 'p1');
    })
  ;

  p1.reject('p1');
  p2.resolve('p2');
});

test( 'chaining failure multiple', function(assert)
{
  var p1 = new Rekord.Promise();
  var p2 = new Rekord.Promise();

  expect(2);

  p1
    .then(function(result) {
      ok( false );
      return p2;
    })
    .then(function(result) {
      ok( false );
    })
    .catch(function(result) {
      ok( false );
    })
    .offline(function(result) {
      ok(p2.isPending());
      strictEqual(result, 'p1');
    })
  ;

  p1.noline('p1');
  p2.resolve('p2');
});

test( 'chaining success async', function(assert)
{
  var timer = assert.timer();
  var p1 = new Rekord.Promise();
  var p2 = new Rekord.Promise();

  expect(4);

  p1
    .then(function(result) {
      notOk(p1.isPending());
      strictEqual(result, 'p1');
      return p2;
    })
    .then(function(result) {
      notOk(p2.isPending());
      strictEqual(result, 'p2');
    })
    .catch(function() {
      ok( false );
    })
  ;

  timer.wait(1, function() {
    p1.resolve('p1');
  });
  timer.wait(3, function() {
    p2.resolve('p2');
  });

  timer.run();
});

test( 'chaining create update remove sync', function(assert)
{
  var prefix = 'chaining_create_update_remove_sync_';

  var Task = Rekord({
    name: 'task',
    fields: ['name', 'done']
  });

  expect(2);

  Rekord.Promise
    .then(function() {
      var t0 = new Task({
        name: 't0',
        done: false
      });
      return t0.$save();
    })
    .then(function(t0) {
      ok( t0.$saved );
      t0.done = true;
      return t0.$save();
    })
    .then(function(t0) {
      strictEqual( t0.$saved.done, true );
      return t0.$remove();
    })
    .catch(function() {
      ok( false );
    })
  ;
});

test( 'chaining create update remove async', function(assert)
{
  var timer = assert.timer();
  var prefix = 'chaining_create_update_remove_async_';

  var Task = Rekord({
    name: 'task' + prefix,
    fields: ['name', 'done']
  });

  Task.Database.rest.delay = 2;

  expect(10);

  var t0 = new Task({
    id: 23,
    name: 't0',
    done: false
  });

  wait(1, function() {
    notOk( t0.$isSaved(), 'not saved' );
    notOk( t0.$isDeleted(), 'is not deleted' );
  });

  wait(3, function() {
    ok( t0.$isSaved(), 'is saved' );
    deepEqual( t0.$saved, {id: 23, name: 't0', done: false}, 'saved correctly' );
    notOk( t0.$isDeleted(), 'is not deleted' );
  });

  wait(5, function() {
    ok( t0.$isSaved(), 'is saved' );
    deepEqual( t0.$saved, {id: 23, name: 't0', done: true}, 'updated correctly' );
    ok( t0.$isDeleted(), 'is deleted' );
  });

  Rekord.Promise
    .then(function() { // at 0
      return t0.$save();
    })
    .then(function(t0) { // at 2
      ok( t0.$saved, 'is saved, updating...' );
      t0.done = true;
      return t0.$save();
    })
    .then(function(t0) { // at 4
      strictEqual( t0.$saved.done, true, 'saved done correctly, removing...' );
      return t0.$remove();
    })
    .catch(function() {
      ok( false );
    })
  ;

  timer.runTimed( 1, assert );
});
