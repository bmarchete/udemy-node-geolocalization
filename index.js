const restify = require("restify");
var fs = require('fs');

const googleMapsClient = require("@google/maps").createClient({
  key: "AIzaSyDT07TTQNi3bm7qLgxsNBGIF9qMonXMQlI",
  Promise: Promise
});

const server = restify.createServer({
  name: "myapp",
  version: "1.0.0",
  // key: fs.readFileSync('./key.pem'), //on current folder
  // certificate: fs.readFileSync('./cert.pem')
});

var knex = require('knex')({
  client: 'mysql',
  connection: {
    host : 'mysql://mysql:3306/',
    user : 'openshift',
    password : 'mysql10102020',
    database : 'db'
  }
});

server.use(restify.plugins.acceptParser(server.acceptable));
server.use(restify.plugins.queryParser());
server.use(restify.plugins.bodyParser());

server.get("/all", function(req, res, next) {
  
  knex('places').then((dados) => {
    res.send(dados);
  }, next)

  return next();
});

// server.get("/geocode", function(req, res, next) {
//   googleMapsClient
//     .geocode({
//       address: "1600 Amphitheatre Parkway, Mountain View, CA"
//     })
//     .asPromise()
//     .then(response => {
//       res.send({id: response.json.results[0].place_id, address : response.json.results[0].formatted_address});
//     })
//     .catch(err => {
//       console.log(err);
//     });

//   return next();
// });

server.post("/geocode", function(req, res, next) {
  const {lat, lng} = req.body

  googleMapsClient
    .reverseGeocode({
      latlng: [lat, lng]
    })
    .asPromise()
    .then(response => {
      const place_id = response.json.results[0].place_id;
      const address = response.json.results[0].formatted_address
      const image = `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=15&size=300x300&sensor=false`;
      
      knex('places')
        .insert({place_id, address, image})
        .then(() => {
            res.send({address, image});
        }, next)

    })
    .catch(err => {
      console.log(err);
      return next();
    });

});

server.get(/\/(.*)?.*/,restify.plugins.serveStatic({
  directory: './dist',
  default: 'index.html',
})
)

server.listen(8080, function() {
  console.log("%s listening at %s", server.name, server.url);
});
