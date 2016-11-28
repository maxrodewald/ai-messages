var request = require('request');
var q = require('q');
var apiai = require('apiai');
var config = require('../config.js');
var ai = apiai(config.apiaiToken);
var app = require('../server.js');
var getGameScore = require('./BasketballControllers/getGameScore.js');
var getTeamRecord = require('./BasketballControllers/getTeamRecord.js');
var session = require('express-session');

module.exports = {
    handleRequest: function(req, res, next) {
        var db = app.get('db');

        //saves user's message to database
        db.create_message(['117390815415116', {'message':req.body.textRequest, 'sender':'user'}], function(err, msg){
            if(err){
                res.status(500).send(err);
                return;
            }
        });

        //apiai request
        var request = ai.textRequest(req.body.textRequest, {
            sessionId: 'abbcccdddd'
        });

        request.on('response', function(response) {
            if (response.result.action === 'get.game.score') {
                getGameScore.getScore(response).then(function(result) {
                    //TODO: Use actual user ID
                    //saves score to database and sends it as the response
                    db.create_message(['117390815415116', result], function(err, score){
                        if(err){
                            res.status(500).send(err);
                            return;
                        }
                        res.send(result);
                    });
                });
            } else if (apiaiResponse.result.action === 'get.team.record') {
                getTeamRecord.getRecord(response).then(function(result) {
                    res.send(result);
                });
            }

        });
        request.on('error', function(err) {
            console.log(err);
            res.send(err);
        });

        request.end();
    }
};
