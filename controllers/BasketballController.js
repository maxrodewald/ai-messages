var q = require('q');
var apiai = require('apiai');
var config = require('../config.js');
var ai = apiai(config.apiaiToken);
var app = require('../server.js');
var getGameScore = require('./BasketballControllers/getGameScore.js');
var getTeamRecord = require('./BasketballControllers/getTeamRecord.js');
var getNextGame = require('./BasketballControllers/getNextGame.js');
var getPlayerStat = require('./BasketballControllers/getPlayerStat.js');
var getWeather = require('./WeatherControllers/getWeather.js');
var getFutureWeather = require('./WeatherControllers/getFutureWeather.js');

module.exports = {
    //endpoint that handles all message requests
    handleRequest: function(req, res, next) {
        var db = app.get('db');
        var msg = {};

        //TODO : add function in MessagesController to do this
        db.create_message([req.body.userid, {
            'text': req.body.textRequest,
            'sender': 'user'
        }], function(err, msg) {
            if (err) {
                res.status(500).send(err);
                return;
            }
        });

        //apiai request
        var request = ai.textRequest(req.body.textRequest, {
            sessionId: 'abbcfdlefsd'
        });

        //handles apiai response
        request.on('response', function(response) {
            console.log(response);
            if (response.result.score === 0) {
                msg = {
                    text: "I'm not sure what you mean. Try phrasing your question a different way"
                };
                db.create_message([req.body.userid, msg], function(err, ms) {
                    if (err) {
                        res.status(500).send(err);
                        return;
                    }
                    res.send(msg);
                });
            } else {
                if (response.result.source === 'domains') {
                    msg = {
                        text: response.result.fulfillment.speech
                    };
                    db.create_message([req.body.userid, msg], function(err, score) {
                        if (err) {
                            res.status(500).send(err);
                            return;
                        }
                        res.send(msg);
                    });

                } else if (response.result.action === 'get.game.score') {
                    getGameScore.getScore(response).then(function(result) {
                        //saves score to database and sends it as the response
                        db.create_message([req.body.userid, result], function(err, score) {
                            if (err) {
                                res.status(500).send(err);
                                return;
                            }
                            res.send(result);
                        });
                    });
                } else if (response.result.action === 'get.team.record') {
                    getTeamRecord.getRecord(response).then(function(result) {
                        db.create_message([req.body.userid, result], function(err, score) {
                            if (err) {
                                res.status(500).send(err);
                                return;
                            }
                            res.send(result);
                        });
                    });
                } else if (response.result.action === 'get.team.nextGame') {
                    getNextGame.getGame(response).then(function(result) {
                        db.create_message([req.body.userid, result], function(err, score) {
                            if (err) {
                                res.status(500).send(err);
                                return;
                            }
                            res.send(result);
                        });
                    });
                } else if (response.result.action.split('.')[1] === 'individual') {
                    getPlayerStat.getStat(response).then(function(result) {
                        db.create_message([req.body.userid, result], function(err, score) {
                            if (err) {
                                res.status(500).send(err);
                                return;
                            }
                            res.send(result);
                        });
                    });
                } else if (response.result.action === 'get.current.weather') {
                    getWeather.getWeather(response).then(function(result){
                        db.create_message([req.body.userid, result], function(err, score) {
                            if (err) {
                                res.status(500).send(err);
                                return;
                            }
                            res.send(result);
                        });
                    });
                } else if (response.result.action === 'get.future.weather') {
                    getFutureWeather.getFutureWeather(response).then(function(result){
                        db.create_message([req.body.userid, result], function(err, score) {
                            if (err) {
                                res.status(500).send(err);
                                return;
                            }
                            res.send(result);
                        });
                    });
                }
            }

        });

        request.on('error', function(err) {
            console.log(err);
            res.send(err);
        });

        request.end();
    }
};
