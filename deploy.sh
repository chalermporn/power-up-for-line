#!/bin/bash

browserify ./public/javascripts/client.js -o ./public/javascripts/bundle.js
git add . && git commit -m 'text' && git push heroku master && heroku logs --tail


