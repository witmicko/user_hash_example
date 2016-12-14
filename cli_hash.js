var hash = require('./hash');

var pwd = process.argv[2];

hash.saltAndHash(pwd, function(err, hashed) {
  if (err) console.log(err);
  console.log(hashed);
});