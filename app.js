var conf = require('configo');
var restify = require('restify');
var stripe = require('stripe')(conf.get('STRIPE_SECRET_KEY'));

var qs = require('querystring');

var server = restify.createServer();

server.use(restify.bodyParser());

server.post('/stripe', function(req, res, next) {
  var body = qs.decode(req.body);

  if (!body.stripeToken) {
    console.log('No stripe Token');
    return res.json({
      error: 'You need to provide a Stripe token.'
    });
  }

  var stripeToken = body.stripeToken;
  var amount = body.amount;
  var currency = body.currency;
  var description = body.description;

  var charge = stripe.charges.create({
    amount: amount, // amount in cents, again
    currency: currency,
    source: stripeToken,
    description: description
  }, function(err, charge) {
    console.log(err, charge)
    if (err && err.type === 'StripeCardError') {
      return res.json({
        error: err
      });
    }

    res.json({
      success: true
    });
    next();
  });
});

server.listen(conf.get('PORT'), function() {
  console.log('%s listening at %s', server.name, server.url);
});
