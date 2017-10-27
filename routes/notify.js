"use strict";

const express = require('express');
const router = express.Router();
const debug = require("debug")("powerup-for-line");
const request = require("request");

Promise = require("bluebird");
Promise.promisifyAll(request);

router.post('/notify', (req, res, next) => {
    let url = "https://notify-api.line.me/api/notify";
    let headers = {
        "Authorization": `Bearer ${req.query.access_token}`,
        "Content-Type": "application/x-www-form-urlencoded"
    };
    let form = {
        message: "How is this task going on?",
        stickerPackageId: 1,
        stickerId: 113
    };
    request.postAsync({
        url: url,
        headers: headers,
        form: form
    }).then((response) => {
        return res.sendStatus(response.statusCode);
    });
});

module.exports = router;
