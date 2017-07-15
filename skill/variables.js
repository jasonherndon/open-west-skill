'use strict';

const requestPromise = require('request-promise');
const moment = require('moment');

exports.sessionTopic = function sessionTopic(model) {
  return model.sessionTopic;
};

exports.RandomSessionDescription = function RandomSessionDescription(model) {
	const randomTalk = Math.floor(Math.random() * (221-1) + 1);
	let options = {
	    uri: `https://api.joind.in/v2.1/events/6314/talks?start=${randomTalk}&resultsperpage=1`,
	    headers: {
	        'User-Agent': 'Request-Promise'
	    },
	    json: true,
	    model: model
	};
	return requestPromise(options)
	    .then(function (res) {
			var days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
	    	const randomTalk = res.talks[0];

			var roomAndTrack = randomTalk.tracks[0].track_name;
			var roomAndTrackSplit = roomAndTrack.split(' - ');

	    	const randomTalkTitle = randomTalk.talk_title;
	    	const randomTalkDescription = randomTalk.talk_description;
	    	const randomTalkSpeaker = randomTalk.speakers[0].speaker_name;
	    	const randomTalkDate = moment(randomTalk.start_date).format("dddd");
	    	const randomTalkTime = moment(randomTalk.start_date).format("h:mm a");
	    	const randomTalkRoom = roomAndTrackSplit[0];
	    	const randomTalkTrack = roomAndTrackSplit[1];

	    	// save it to the model
	    	model.storedTalkDetails = {
	    		randomTalk,
	    		randomTalkTitle,
	    		randomTalkDescription,
	    		randomTalkSpeaker,
	    		randomTalkDate,
	    		randomTalkTime,
	    		randomTalkRoom,
	    		randomTalkTrack
	    	};

	        return `On ${randomTalkDate} ${randomTalkSpeaker} will be presenting a talk called ${randomTalkTitle}. ${randomTalkDescription} <break time="0.5s"/> Wanna learn more or go to the next one?`;
	    })
	    .catch(function (err) {
	    	// @todo add "try again" support for this session
	    	return 'Sorry we could not find any talks for OpenWest. Would you like to try again or exit?';
	    });
};

exports.SessionDetails = function SessionDetails(model) {
	const randomTalkTitle = model.storedTalkDetails.randomTalkTitle;
	const randomTalkSpeaker = model.storedTalkDetails.randomTalkSpeaker;
	const randomTalkDate = model.storedTalkDetails.randomTalkDate;
	const randomTalkTime = model.storedTalkDetails.randomTalkTime;
	const randomTalkRoom = model.storedTalkDetails.randomTalkRoom;
	const randomTalkTrack = model.storedTalkDetails.randomTalkTrack;

	// clear the model
	model.storedTalkDetails = {};

    return `${randomTalkSpeaker} will be presenting their ${randomTalkTitle} talk on ${randomTalkDate} at ${randomTalkTime} in room ${randomTalkRoom} as part of the ${randomTalkTrack} track. <break time="0.5s"/> Wanna to hear about another talk?`;
};