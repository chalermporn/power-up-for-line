var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', {
        LINE_CLIENT_ID: process.env.LINE_CLIENT_ID
    });
});

/* GET home page. */
router.get('/auth-success', function(req, res, next) {
    res.render('auth-success', {});
});

module.exports = router;
