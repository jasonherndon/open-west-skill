'use strict';

const views = (function views() {
  return {
    Intent: {
      Launch: {
        ask: 'Welcome to the OpenWest Conference skill. OpenWest largest regional tech conference devoted to all things OPEN: Hardware, Standards, Source and Data. You can ask me about conference details or ask me to help you find an interesting talk. Would you like me to help you find an interesting talk?',
        reprompt: 'Would you like me to help you find an interesting talk?'
      },      
      Info: {
        tell: 'Join us for the annual OpenWest Conference, with topics for developers, designers, engineers, and business leaders who use open standards and technologies to solve business needs from the cloud to the desktop. The conference features a variety of presentations, workshops, and activities to address business needs, help individuals build a stronger skill set, and strengthen community user groups. Attendees will learn how emerging free and open source technologies shape the cloud, while networking with experts and peers from across a broad range of fields.',
      },
      Recommendation: {
        Main: {
          ask: 'Alright! Lets do this ... are you feeling adventurous and want to try something new or would you rather dive deeper and learn more about something you already new. You can say "something new" or "learn more". Which would you like to do?',
          reprompt: 'You can say "something new" or "learn more". Which would you like to do?'
        },
        No: {
          tell: 'No worries. Let me know if I can help answer questions for you about OpenWest or help you find an interesting session. Goodbye for now.',
        }
      },
      SomethingNew: {
        Main: {
          ask: 'Okay. I\'ve scanned through the conference talks about found some ones that look particularly interesting. I\'ll go through them one by one and after I tell you about them, you can tell me if you want to hear more about that one, or another one. sound good?',
          reprompt: 'Would you like to learn more about this talk or go to the next one? You can say "session details" or "next".'
        },
        Yes: {
          ask: '{RandomSessionDescription}',
        }
      },
      LearnAboutTopicIntent: {
        Main: {
          tell: 'Okay. I see that you want to learn more about {sessionTopic}. That\'s a good topic!',
          reprompt: 'Ready to find something new?'
        }
      },
      Help: {
        say: 'Some help text here.',
      },
      SessionDetail: {
        Main: {
          ask: '{SessionDetails} Would you like to learn more about another talk?',
          reprompt: 'Would you like to learn more about another talk?',
        }
      },
    },
  };
}());
module.exports = views;