'use strict';

exports.register = function register(skill) {

  skill.onIntent('LaunchIntent', () => ({ reply: 'Intent.Launch', to: 'launchRecommendationState' }));

  skill.onIntent('InfoIntent', () => ({ reply: 'Intent.Info', to: 'entry' }));

  skill.onState('launchRecommendationState', (request) => {
    if (request.intent.name === 'AMAZON.YesIntent') {
        return { reply: 'Intent.Recommendation.Main', to: 'recommendationState' };
    } else if (request.intent.name === 'AMAZON.NoIntent') {
    	return { reply: 'Intent.Recommendation.No', to: 'die' };
    }
  });

  skill.onState('recommendationState', (request) => {
    if (request.intent.name == 'SomethingNewIntent') {
        return { reply: 'Intent.SomethingNew.Main', to: 'somethingNewState' };
    }
    if (request.intent.name == 'LearnAboutTopicIntent') {
    	request.model.sessionTopic = request.intent.slots.sessionTopic.value;
        return { reply: 'Intent.LearnAboutTopicIntent.Main', to: 'entry' };
    }
  });

  skill.onState('somethingNewState', (request) => {
    if (request.intent.name === 'AMAZON.YesIntent') {
	    return { reply: 'Intent.SomethingNew.Yes', to: 'randomSessionState' };
    } else if (request.intent.name === 'AMAZON.NoIntent') {
    	return { reply: 'Intent.Recommendation.No', to: 'die' };
    }
  });

  skill.onState('randomSessionState', (request) => {
    if (request.intent.name === 'SessionDetailIntent') {
	    return { reply: 'Intent.SessionDetail.Main', to: 'sessionDetailState' };
    } else if ((request.intent.name === 'AMAZON.NextIntent') || (request.intent.name === 'TryAgainIntent')) {
	    return { reply: 'Intent.SomethingNew.Yes', to: 'randomSessionState' };
    }
  });

  skill.onState('sessionDetailState', (request) => {
    if (request.intent.name === 'AMAZON.YesIntent') {
	    return { reply: 'Intent.SomethingNew.Yes', to: 'randomSessionState' };
    } else if (request.intent.name === 'AMAZON.NoIntent') {
    	return { reply: 'Intent.Recommendation.No', to: 'die' };
    }
  });

  skill.onIntent('RecommendationIntent', () => ({ reply: 'Intent.Recommendation.Main', to: 'recommendationState' }));

  skill.onIntent('AMAZON.HelpIntent', () => ({ reply: 'Intent.Help', to: 'die' }));

};
