"use strict";

const express = require('express');
const router = express.Router();
const debug = require("debug")("powerup-for-line");
const request = require("request");
Promise = require("bluebird");
Promise.promisifyAll(request);

router.get('/', (req, res, next) => {
    res.render('index', {
        LINE_CLIENT_ID: process.env.LINE_CLIENT_ID
    });
});

// OAuth Success Callback
router.get('/auth-success', (req, res, next) => {

    if (!req.query.code){
        return res.sendStatus(400);
    }

    // If we got code, we request access token.
    debug(`Authorization code is ${req.query.code}`);

    if (!process.env.LINE_CLIENT_SECRET){
        debug(`CLIENT_SECRET not set.`);
        throw new Error(`LINE_CLIENT_SECRET not set.`)
    }

    // Request Access Token using code.
    let grant_type = "authorization_code";
    let code = req.query.code;
    let redirect_uri = "https://powerup-for-line.herokuapp.com/auth-success";
    let client_id = process.env.LINE_CLIENT_ID;
    let client_secret = process.env.LINE_CLIENT_SECRET;

    // Construct token url.
    let token_url = `https://notify-bot.line.me/oauth/token?grant_type=${grante_type}&code=${code}&redirect_uri=${redirect_uri}&client_id=${client_id}&client_secret=${client_secret}`;
    debug(`Token URL is ${token_url}`);

    let headers = {
        "Content-Type": "application/x-www-form-urlencoded"
    }

    request.postAsync({
        url: token_url,
        headers: headers,
        json: true
    }).then((response) => {
        if (response.statusCode !== 200){
            debug(`Faield to get access token.`);
            res.sendStatus(response.body.Status);
            return
        }
        if (!response.body.access_token){
            debug(`Faield to get access token.`);
            res.sendStatus(400);
            return
        }

        res.render('auth-success', {
            access_token: response.body.access_token
        });
        return;
    }).catch((error) => {
        debug(error);
        res.sendStatus(500);
        return;
    });
});

module.exports = router;
