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
    // If we got code, we request access token.
    if (req.query.code){
        debug(`Authorization code is ${req.query.code}`);

        if (!process.env.LINE_CLIENT_SECRET){
            throw new Error(`LINE_CLIENT_SECRET not set.`)
        }

        // Request Access Token using code.
        let query_strings = {
            grant_type: "authorization_code",
            code: req.query.code,
            redirect_uri: window.location.origin + "/power-up-template/auth-success",
            client_id: process.env.LINE_CLIENT_ID,
            client_secret: process.env.LINE_CLIENT_SECRET
        }

        // Construct token url.
        let token_url = "https://notify-bot.line.me/oauth/token?grant_type=" + grant_type + "&code=" + code + "&redirect_uri=" + redirect_uri + "&client_id=" + client_id + "&client_secret=" + client_secret;
        let index = 0;
        for (let q of query_strings){
            token_url = token_url + query_strings[index] + "=" + q + "&";
            index++;
        }
        token_url = token_url.slice(0, -1);
        debug(`Token URL is ${token_url}`);

        let headers = {
            "Content-Type": "application/x-www-form-urlencoded"
        }

        return request.postAsync({
            url: token_url,
            headers: headers,
            json: true
        }).then((response) => {
            if (response.Status !== 200){
                debug(`Faield to get access token.`);
                return res.sendStatus(response.body.Status);
            }
            if (!response.body.access_token){
                debug(`Faield to get access token.`);
                return res.sendStatus(400);
            }

            /*
            return res.json({
                access_token: response.body.access_token
            });
            */
            return res.render('auth-success', {
                access_token: response.body.access_token
            });
        });
    }
});

module.exports = router;
