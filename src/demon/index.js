'use strict'

let _ = require('lodash');

let Settings = require('./app/classes/Settings.js');
let data = require('./settings.json');

_.forEach(data, (value, key) => Settings.setItem(key, value));

require('./app/app.js');