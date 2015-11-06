var http = require('http')

var jsonBody = require('body/json')
var sendJSON = require('send-data/json')
var jwt = require('jsonwebtoken')

var _ = require('underscore-contrib')

var info = null
if (process.env.VCAP_SERVICES) {
  info = JSON.parse(process.env.VCAP_SERVICES)['user-provided'][0].credentials
} else {
  info = JSON.parse(process.env.JWT)
}

var server = http.createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/gen') {
    jsonBody(req, res, (err, body) => {
      if (err) { return sendJSON(req, res, { err: err.message })}
      if (body.username === info.username && body.password === info.password) {
        var token = jwt.sign(body.data || {foo: 'bar'}, info.secret, { expiresIn: '5h'})
        sendJSON(req, res, { token: token })
      }
    })
    return
  }

  sendJSON(req, res, { title: 'JRS jwt-gen service'})
})
server.listen(process.env.PORT || 3000)
