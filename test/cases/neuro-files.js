module( 'Neuro files' );

test( 'decoding text', function(assert)
{
  var prefix = 'Neuro_files_decoding_text_';

  var Attachment = Neuro({
    name: prefix + 'attachment',
    fields: ['name', 'file'],
    files: {
      file: 'text'
    }
  });

  var a = new Attachment();
  a.file = new File('a1', 123, 'text/plain', 'Hello World!');
  a.$decode();

  strictEqual( a.file, 'Hello World!' );
});

test( 'decoding text async', function(assert)
{
  var prefix = 'Neuro_files_decoding_text_async_';

  var Attachment = Neuro({
    name: prefix + 'attachment',
    fields: ['name', 'file'],
    files: {
      file: 'text'
    }
  });

  FileReader.IMMEDIATE = false;

  var a = new Attachment();
  a.file = new File('a1', 123, 'text/plain', 'Hello World!');
  a.$decode();

  strictEqual( a.file, undefined );

  FileReader.IMMEDIATE = true;
  FileReader.executePending();

  strictEqual( a.file, 'Hello World!' );
});

test( 'decoding base64', function(assert)
{
  var prefix = 'Neuro_files_decoding_base64_';

  var Attachment = Neuro({
    name: prefix + 'attachment',
    fields: ['name', 'file'],
    files: {
      file: 'base64'
    }
  });

  var a = new Attachment();
  a.file = new File('a1', 123, 'text/plain', 'Hello World!');
  a.$decode();

  strictEqual( a.file, 'SGVsbG8gV29ybGQh' );
});

test( 'decoding base64 async', function(assert)
{
  var prefix = 'Neuro_files_decoding_base64_async_';

  var Attachment = Neuro({
    name: prefix + 'attachment',
    fields: ['name', 'file'],
    files: {
      file: 'base64'
    }
  });

  FileReader.IMMEDIATE = false;

  var a = new Attachment();
  a.file = new File('a1', 123, 'text/plain', 'Hello World!');
  a.$decode();

  strictEqual( a.file, undefined );

  FileReader.IMMEDIATE = true;
  FileReader.executePending();

  strictEqual( a.file, 'SGVsbG8gV29ybGQh' );
});

test( 'decoding dataURL', function(assert)
{
  var prefix = 'Neuro_files_decoding_dataURL_';

  var Attachment = Neuro({
    name: prefix + 'attachment',
    fields: ['name', 'file'],
    files: {
      file: 'dataURL'
    }
  });

  var a = new Attachment();
  a.file = new File('a1', 123, 'text/plain', 'Hello World!');
  a.$decode();

  strictEqual( a.file, 'data:text/plain;base64,SGVsbG8gV29ybGQh' );
});

test( 'decoding dataURL async', function(assert)
{
  var prefix = 'Neuro_files_decoding_dataURL_async_';

  var Attachment = Neuro({
    name: prefix + 'attachment',
    fields: ['name', 'file'],
    files: {
      file: 'dataURL'
    }
  });

  FileReader.IMMEDIATE = false;

  var a = new Attachment();
  a.file = new File('a1', 123, 'text/plain', 'Hello World!');
  a.$decode();

  strictEqual( a.file, undefined );

  FileReader.IMMEDIATE = true;
  FileReader.executePending();

  strictEqual( a.file, 'data:text/plain;base64,SGVsbG8gV29ybGQh' );
});

test( 'encoding text', function(assert)
{
  var prefix = 'Neuro_files_encoding_text_';

  var Attachment = Neuro({
    name: prefix + 'attachment',
    fields: ['name', 'file'],
    files: {
      file: 'text'
    }
  });

  var a = new Attachment({id: 1});
  a.file = new File('a1', 123, 'text/plain', 'Hello World!');
  a.$decode();
  a.$save();

  strictEqual( Attachment.Database.store.map.get(1).file, 'Hello World!' );
  strictEqual( Attachment.Database.rest.map.get(1).file, 'Hello World!' );
});

test( 'save text offline', function(assert)
{
  var prefix = 'Neuro_files_save_text_offline_';

  var Attachment = Neuro({
    name: prefix + 'attachment',
    fields: ['name', 'file'],
    files: {
      file: 'text'
    }
  });

  var a = new Attachment({id: 1});
  a.file = new File('a1', 123, 'text/plain', 'Hello World!');
  a.$decode();

  offline();

  a.$save();

  deepEqual( Attachment.Database.store.map.get(1).file, {
    FILE: true,
    name: "a1",
    size: 123,
    type: "text/plain"
  });

  online();

  deepEqual( Attachment.Database.store.map.get(1).file, 'Hello World!' );
});

test( 'save file offline', function(assert)
{
  var prefix = 'Neuro_files_save_file_offline_';

  Neuro.addFileProcessor( prefix + 'processor', {
    fileToValue: function(file, model, field, callback) {
      callback( file.contents.length );
    },
    valueToUser: function(value, model, field, callback) {
      callback( '/file/' + value );
    }
  });

  var Attachment = Neuro({
    name: prefix + 'attachment',
    fields: ['name', 'file'],
    files: {
      file: {
        type: 'resource',
        processor: prefix + 'processor'
      }
    }
  });

  var a = new Attachment({id: 1});
  a.file = new File('a1', 123, 'text/plain', 'Hello World!');
  a.$decode();

  strictEqual( a.file, '/file/12' );

  offline();

  a.$save();

  strictEqual( a.file, '/file/12' );
  deepEqual( Attachment.Database.store.map.get(1).file, {
    FILE: true,
    name: "a1",
    size: 123,
    type: "text/plain"
  });

  online();

  strictEqual( a.file, '/file/12' );
  deepEqual( Attachment.Database.store.map.get(1).file, 12 );
  deepEqual( Attachment.Database.rest.map.get(1).file, 12 );
});

test( 'save resource offline async', function(assert)
{
  var prefix = 'Neuro_files_save_file_offline_async_';

  Neuro.addFileProcessor( prefix + 'processor', {
    fileToValue: function(file, model, field, callback) {
      callback( file.contents.length );
    },
    valueToUser: function(value, model, field, callback) {
      callback( '/file/' + value );
    }
  });

  var Attachment = Neuro({
    name: prefix + 'attachment',
    fields: ['name', 'file'],
    files: {
      file: {
        type: 'resource',
        processor: prefix + 'processor'
      }
    }
  });

  var a = new Attachment({id: 1});
  a.file = new File('a1', 123, 'text/plain', 'Hello World!');
  a.$decode();

  strictEqual( a.file, '/file/12' );

  offline();

  a.$save();

  strictEqual( a.file, '/file/12' );
  deepEqual( Attachment.Database.store.map.get(1).file, {
    FILE: true,
    name: "a1",
    size: 123,
    type: "text/plain"
  });

  online();

  strictEqual( a.file, '/file/12' );
  deepEqual( Attachment.Database.store.map.get(1).file, 12 );
  deepEqual( Attachment.Database.rest.map.get(1).file, 12 );
});

test( 'save text browser restart', function(assert)
{
  var prefix = 'Neuro_files_save_text_browser_restart_';

  var Attachment1 = Neuro({
    name: prefix + 'attachment',
    fields: ['name', 'file'],
    files: {
      file: 'text'
    }
  });

  var a = new Attachment1({id: 1});
  a.file = new File('a1', 123, 'text/plain', 'Hello World!');
  a.$decode();

  strictEqual( Attachment1.Database.rest.map.get(1), undefined );

  offline();

  a.$save();

  strictEqual( Attachment1.Database.rest.map.get(1), undefined );

  deepEqual( Attachment1.Database.store.map.get(1).file, {
    FILE: true,
    name: "a1",
    size: 123,
    type: "text/plain"
  });

  restart();

  Neuro.autoload = false;

  var Attachment2 = Neuro({
    name: prefix + 'attachment',
    fields: ['name', 'file'],
    files: {
      file: 'text'
    }
  });

  Neuro.on( Neuro.Events.FileOffline, function(input, model, property, setter)
  {
    deepEqual( input, {
      FILE: true,
      name: "a1",
      size: 123,
      type: "text/plain"
    }, 'Input as expected' );

    strictEqual( property, 'file' );

    setter( new File('a2', 123, 'text/plain', 'Hello World Again!') );
  });

  Neuro.load();
  Neuro.autoload = true;

  strictEqual( Attachment2.Database.rest.map.get(1).file, 'Hello World!' );

  var a2 = Attachment2.get(1);

  ok( a2 );
  ok( a2.file instanceof File );

  a2.$decode();

  strictEqual( a2.file, 'Hello World Again!' );

  noline();
});
