var fs = require('fs')
var request = require('request').defaults({json: true})
var path = require('path')
var Dat = require('../../')

module.exports.paths = function(test, common) {
  test('.paths', function(t) {
    var dat = new Dat(common.dat1tmp, function ready() {
      var paths = dat.paths()
      t.equal(paths.dat, path.join(common.dat1tmp, '.dat'), 'dat path')
      t.equal(paths.level, path.join(common.dat1tmp, '.dat', 'store.dat'), 'level path')
      dat.destroy(function(err) {
        t.false(err, 'destroy ok')
        t.end()
      })
    })
  })
}

module.exports.initExistsDestroy = function(test, common) {
  test('.init, .exists, .destroy', function(t) {
    var dat = new Dat(common.dat1tmp, function ready() {
      dat.exists(function(exists) {
        t.true(exists, 'exists')
        destroy(function() {
          t.end()
        })
      })
    })
  
  
    function destroy(cb) {
      dat.destroy(function(err) {
        t.false(err, 'no err')
        dat.exists(function(exists) {
          t.false(exists, 'does not exist')
          cb()
        })
      })
    }
  })
}

module.exports.existingRepo = function(test, common) {
  test('.init in existing repo', function(t) {
    var dat = new Dat(common.dat1tmp, function ready() {
      dat.init(function(err, msg) {
        t.true(msg, msg)
        dat.destroy(function(err) {
          t.false(err, 'no err')
          t.end()
        })
      })
    })
  })  
}

module.exports.portFile = function(test, common) {
  test('create does init and serve by default', function(t) {
    var dat = new Dat(common.dat1tmp, function ready() {
      var port = fs.readFileSync(dat.paths().port).toString()
      t.true(port, port)
      request('http://localhost:' + port, function(err, resp, json) {
        t.false(err, 'no GET err')
        t.equal(json.dat, 'Hello', JSON.stringify(json))
        dat.destroy(function(err) {
          t.false(err, 'no err')
          t.end()
        })
      })
    })
  })
}

module.exports.autoPort = function(test, common) {
  test('dat gets an open port by default', function(t) {
    
    common.getDat(t, { datPath: common.dat1tmp, noTestEnd: true }, function(dat1, cleanup1) {
      common.getDat(t, { datPath: common.dat2tmp, noTestEnd: true }, function(dat2, cleanup2) {
        var pending = 2
        verifyPort(dat1, done)
        verifyPort(dat2, done)
        
        function done() {
          if (--pending === 0) {
            pending = 2
            cleanup1(cleanup)
            cleanup2(cleanup)
            
            function cleanup() {
              if (--pending === 0) t.end()
            }
          }
        }
      })
    })
    
    function verifyPort(dat, cb) {
      var port = fs.readFileSync(dat.paths().port).toString()
      t.true(port, port)
      request('http://localhost:' + port, function(err, resp, json) {
        t.false(err, 'no GET err')
        t.equal(json.dat, 'Hello', JSON.stringify(json))
        dat.destroy(function(err) {
          t.false(err, 'no err')
          cb()
        })
      })
    }
  })
}

module.exports.all = function (test, common) {
  module.exports.paths(test, common)
  module.exports.initExistsDestroy(test, common)
  module.exports.existingRepo(test, common)
  module.exports.portFile(test, common)
  module.exports.autoPort(test, common)
}
