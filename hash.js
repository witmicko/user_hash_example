var crypto = require('crypto');
var semver = require('semver');

var SALT_LENGTH = 64;
var HASH_ITERATIONS = 10000;
var HASH_LENGTH = 256;
var CIPHER = 'sha1';
var SEPARATOR = ':';

function genSalt() {
  return crypto.randomBytes(SALT_LENGTH).toString('hex');
}

function pbkdf2(pwd, salt, iterations, length, cipher, cb) {
  if (semver.satisfies(process.version, '>=0.12.0')) {
    crypto.pbkdf2(pwd, salt, iterations, length, cipher, cb);
  } else {
    crypto.pbkdf2(pwd, salt, iterations, length, cb);
  }
}

/**
 * @callback saltAndHashCallback
 * @param {Error}
 * @param {String} responseMessage
 */

/**
 * Generates a random salt and encrypts the given password
 * @param  {String}   pwd Password to be encrypted
 * @param  {saltAndHashCallback} cb Node-style callback
 */
exports.saltAndHash = function(pwd, cb) {
  var salt = genSalt();
  pbkdf2(pwd, salt, HASH_ITERATIONS, HASH_LENGTH, CIPHER, function(err, hashed) {
    if (err) {
      return cb(err);
    }

    var finalHash = [CIPHER, HASH_ITERATIONS, hashed.toString('hex'), salt].join(SEPARATOR);
    cb(null, finalHash);
  });
};

/**
 * @callback verifyCallback
 * @param {Error}
 * @param {Boolean} Whether the password corresponds to the supplied hashed string
 */

/**
 * Generates a random salt and encrypts the given password
 * @param  {String}   pwd Password to be verified
 * @param  {String}   hashed Hash generated by {@link exports.saltAndHash}
 * @param  {verifyCallback} cb Node-style callback
 */
exports.verify = function(pwd, hashed, cb) {
  var split = hashed.split(SEPARATOR);
  if (!split || split.length !== 4) {
    return cb(new Error('Hash string should be in {cipher}:{iterations}:{hash}:{salt} format'));
  }
  var cipher = split[0];
  var iterations = Number(split[1]);
  var hash = split[2];
  var salt = split[3];

  pbkdf2(pwd, salt, iterations, HASH_LENGTH, cipher, function(err, verify) {
    // available on node 6.0+
    if (crypto.timingSafeEqual) {
      var hashBuf;
      try {
        hashBuf = Buffer.from(hash, 'hex');
      } catch (e) {
        // invalid hex string
        return cb(err);
      }
      return cb(err, crypto.timingSafeEqual(hashBuf, verify));
    }
    cb(err, hash === verify.toString('hex'));
  });
};

exports.separator = SEPARATOR;