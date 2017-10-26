var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', {});
});

/* GET home page. */
router.get('/auth-success', function(req, res, next) {
    res.render('auth-success', {});
});

module.exports = router;
