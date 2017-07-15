'use strict';

require('dotenv').config()
const config = require('config');
const skill = require('./skill/MainStateMachine');

skill.startServer(config.get('server.port'));