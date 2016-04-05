
Neuro.transaction = null;

Neuro.transact = function(cascade, model, operation, func)
{
  var transaction = Neuro.transaction;

  if ( transaction )
  {
    transaction.add( cascade, model, operation );

    func.call( model, transaction )

    return transaction;
  }
  else
  {
    transaction = Neuro.transaction = new Transaction( cascade, model, operation );

    transaction.add( cascade, model, operation );

    func.call( model, transaction );

    Neuro.transaction = null;

    return transaction;
  }
};

Neuro.transactNone = function(cascade, model, operation)
{
  return new Transaction( cascade, model, operation );
};

function Transaction(cascade, model, operation)
{
  this.cascade = cascade;
  this.model = model;
  this.operation = operation;
  this.status = null;
  this.completed = 0;
  this.operations = 0;
}

Transaction.Events =
{
  RemoteSuccess:  'remote-success',
  LocalSuccess:   'local-success',
  Offline:        'offline',
  Blocked:        'blocked',
  Error:          'error',
  Any:            'remote-success local-success offline blocked error'
};

Transaction.prototype =
{
  add: function(cascade, model, operation)
  {
    var handled = {
      already: false,
      offs: []
    };

    switch (operation)
    {
    case 'save':
      if ( cascade & Neuro.Cascade.Rest )
      {
        handled.offs.push(
          model.$once( Model.Events.RemoteSave, this.createHandler( false, false, handled ), this ),
          model.$once( Model.Events.RemoteSaveFailure, this.createHandler( true, false, handled ), this ),
          model.$once( Model.Events.RemoteSaveOffline, this.createHandler( false, true, handled ), this )
        );
      }
      else if ( cascade & Neuro.Cascade.Local )
      {
        handled.offs.push(
          model.$once( Model.Events.LocalSave, this.createHandler( false, false, handled ), this ),
          model.$once( Model.Events.LocalSaveFailure, this.createHandler( true, false, handled ), this )
        );
      }
      break;

    case 'remove':
      if ( cascade & Neuro.Cascade.Rest )
      {
        handled.offs.push(
          model.$once( Model.Events.RemoteRemove, this.createHandler( false, false, handled ), this ),
          model.$once( Model.Events.RemoteRemoveFailure, this.createHandler( true, false, handled ), this ),
          model.$once( Model.Events.RemoteRemoveOffline, this.createHandler( false, true, handled ), this )
        );
      }
      else if ( cascade & Neuro.Cascade.Local )
      {
        handled.offs.push(
          model.$once( Model.Events.LocalRemove, this.createHandler( false, false, handled ), this ),
          model.$once( Model.Events.LocalRemoveFailure, this.createHandler( true, false, handled ), this )
        );
      }
      break;
    }

    if ( handled.offs.length )
    {
      this.operations++;
    }
  },

  createHandler: function(failure, offline, handled)
  {
    return function onEvent()
    {
      if ( !handled.already )
      {
        handled.already = true;

        for (var i = 0; i < handled.offs.length; i++)
        {
          handled.offs[ i ]();
        }

        if ( offline )
        {
          this.status = Transaction.Events.Offline;
        }
        else if ( !this.status && failure )
        {
          this.status = Transaction.Events.Error;
        }

        this.completed++;

        if ( this.isFinished() )
        {
          this.finish();
        }
      }
    };
  },

  finish: function()
  {
    this.completed = this.operations;

    if ( !this.status )
    {
      if ( this.cascade & Neuro.Cascade.Rest )
      {
        this.status = Transaction.Events.RemoteSuccess;
      }
      else if ( this.cascade & Neuro.Cascade.Local )
      {
        this.status = Transaction.Events.LocalSuccess;
      }
      else
      {
        this.status = Transaction.Events.Error;
      }
    }

    this.trigger( this.status, [this.status, this.model, this.cascade] );
  },

  isFinished: function()
  {
    return this.completed === this.operations;
  },

  then: function(callback, context)
  {
    var ignore = this.once( Transaction.Events.Any, callback, context );

    if ( this.isFinished() )
    {
      this.finish();
    }

    return ignore;
  }

};

eventize( Transaction.prototype );
