
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
    transaction = Neuro.transaction = new NeuroTransaction( cascade, model, operation );

    transaction.add( cascade, model, operation );

    func.call( model, transaction );

    Neuro.transaction = null;

    return transaction;
  }
};

Neuro.transactNone = function(cascade, model, operation)
{
  return new NeuroTransaction( cascade, model, operation );
};

function NeuroTransaction(cascade, model, operation)
{
  this.cascade = cascade;
  this.model = model;
  this.operation = operation;
  this.status = null;
  this.completed = 0;
  this.operations = 0;
}

NeuroTransaction.Events =
{
  RemoteSuccess:  'remote-success',
  LocalSuccess:   'local-success',
  Offline:        'offline',
  Blocked:        'blocked',
  Error:          'error',
  Any:            'remote-success local-success offline blocked error'
};

NeuroTransaction.prototype =
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
          model.$once( NeuroModel.Events.RemoteSave, this.createHandler( false, false, handled ), this ),
          model.$once( NeuroModel.Events.RemoteSaveFailure, this.createHandler( true, false, handled ), this ),
          model.$once( NeuroModel.Events.RemoteSaveOffline, this.createHandler( false, true, handled ), this )
        );
      }
      else if ( cascade & Neuro.Cascade.Local )
      {
        handled.offs.push(
          model.$once( NeuroModel.Events.LocalSave, this.createHandler( false, false, handled ), this ),
          model.$once( NeuroModel.Events.LocalSaveFailure, this.createHandler( true, false, handled ), this )
        );
      }
      break;

    case 'remove':
      if ( cascade & Neuro.Cascade.Rest )
      {
        handled.offs.push(
          model.$once( NeuroModel.Events.RemoteRemove, this.createHandler( false, false, handled ), this ),
          model.$once( NeuroModel.Events.RemoteRemoveFailure, this.createHandler( true, false, handled ), this ),
          model.$once( NeuroModel.Events.RemoteRemoveOffline, this.createHandler( false, true, handled ), this )
        );
      }
      else if ( cascade & Neuro.Cascade.Local )
      {
        handled.offs.push(
          model.$once( NeuroModel.Events.LocalRemove, this.createHandler( false, false, handled ), this ),
          model.$once( NeuroModel.Events.LocalRemoveFailure, this.createHandler( true, false, handled ), this )
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
          this.status = NeuroTransaction.Events.Offline;
        }
        else if ( !this.status && failure )
        {
          this.status = NeuroTransaction.Events.Error;
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
        this.status = NeuroTransaction.Events.RemoteSuccess;
      }
      else if ( this.cascade & Neuro.Cascade.Local )
      {
        this.status = NeuroTransaction.Events.LocalSuccess;
      }
      else
      {
        this.status = NeuroTransaction.Events.Error;
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
    var ignore = this.once( NeuroTransaction.Events.Any, callback, context );

    if ( this.isFinished() )
    {
      this.finish();
    }

    return ignore;
  }

};

eventize( NeuroTransaction.prototype );
