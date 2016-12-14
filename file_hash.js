
var hash = require('./hash');
fs = require('fs');

var file = process.argv[2];

fs.readFile(file, 'utf8', function(err, data) {
  var stream = fs.createWriteStream(file + '_out.txt');
  if (err) {
    return console.log(err);
  }
  var passwords = data.split('\n');

  passwords.forEach(pwd => {
    hash.saltAndHash(pwd, function(err, hashed) {
      if (err) console.log(err);
      stream.write(pwd + ' : ' + hashed + '\n');
    });
  });

});

