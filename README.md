
## Alexa Skill Setup and Tutorial Using Voxa


----------


### PART ONE: THE FRAMEWORK

#### Quick:
To quickly get up and running, simply clone one of the sample projects found at:
[https://github.com/mediarain/voxa/tree/master/samples](https://github.com/mediarain/voxa/tree/master/samples)

#### Manual:
The more longhand way, which will help you understand each piece of what we're doing is this manual process.

First, let's make a directory for your new project by running `mkdir myproject` and then, running `npm init` to get NPM setup (NPM assumes your main file from which node is run is `index.js`, while the Voxa framework assumes it is `server.js`. Each is fine, I prefer `index.js` so that's what we'll use, but just know that in case you're following along with Voxa documentation).

Then, we'll pull down and save the Voxa framework package by running the following command:

```
npm install voxa --save
```

Next, we'll make the following directories that we'll need throughout this project. We'll go thru these one by one as we fill them out, but for now they'll serve as guideposts for us to walk thru the code together.

```
mkdir config services skill speechAssets
```

##### CONFIG

Here we'll put all of your config `json` files. We'll use a couple third party packages to help management environments and bundle each of these `json` files so that you have them available to you according to which environment you are in.

As with any web project, it's important that you have a local working environment as well as an understanding of what your production environment looks like. With Amazon Skills, a production environment means [Lambda](https://aws.amazon.com/lambda/). And while there are local Docker or Vagrant packages for Lambda, I've found that the cost of setup for these is much higher (at the moment) than is worth it.

!! DOCKER / VAGRANT LINKS

So, let's setup our `development` and `production` config files. First, we'll pull in those third party config packages I mentioned - it's called [Config](https://www.npmjs.com/package/config) and basically, it abstracts the `NODE_ENV` process variable. I suggest you dig into those docs, but for the moment that's all we need to know.

```
npm install config --save
```

The second is called [Dotenv](https://www.npmjs.com/package/dotenv) and basically, it loads values from a `.env` file at the root of our directory and loads them into the Node process.env.

```
npm install dotenv --save
```

The difference between the two (as I would suggest) is that the `.env` file should be used for setting up environment variables in the sense of Node **server** environments while the config variables would be better served for those values which your **code** will consume as variables (development versus production keys, for instance). This will become clearer once we move this onto a live server.

So first, let's setup our **server** environments. This is easy as we only have one need at the moment. Create a `.env` file in the root of your directory and add the following line to it:

```js
NODE_ENV=development
```

(or, local, if you prefer)

That's it for that file. Now let's create two files inside of our `config` directory for **code** variables. One we'll call `development.json` (if you used `local` in the step above, you'd call this file `local.json`) and the next we'll call `production.json`. Inside of each, add the following code:

```js
{
  "server": {
    "port": 3000,
    "hostSkill": true
  }
}
```

For now, our environment variables are set. As we continue the tutorial, we'll go thru and change add values to these, but for now we're good to move on.

##### SKILL SETUP

First, we'll want to modify the default `index.js` that NPM created that was created when you ran `npm init` (or `server.js` if you copied it from Voxa). Let's add some code, which will start our server.

**index.js**
```js
'use strict';

require('dotenv').config()
const config = require('config');
const skill = require('./skill/MainStateMachine');

skill.startServer(config.get('server.port'));
```

Now, let's add some boilerplate scripts from Voxa to make this work. Inside of the `skill` directory we've created, add a file named `MainStateMachine.js` with the following code:

```js
'use strict';

// Include the state machine module and the replyWith function
const Voxa = require('voxa');
const views = require('./views');
const variables = require('./variables');
const states = require('./states');

const skill = new Voxa({ variables, views });
states.register(skill);
module.exports = skill;
```

You'll notice those three requires up top after the main Voxa package do not exist. We'll have to add these as well as an `index.js` to load the above script. So, inside of the `skills` folder we'll add the following:

**skills/index.js**
```js
'use strict';

// Include the state machine module, the state machine,
// the responses and variables to be used in this skill
const skill = require('./MainStateMachine');

exports.handler = skill.lambda();
```

**skills/views.js**
```js
'use strict';

const views = (function views() {
  return {
    Intent: {
      Launch: {
        tell: 'Welcome!',
      },
      Help: {
        say: 'Some help text here.',
      },
    },
  };
}());
module.exports = views;
```

> It's important to note that this file above is really where the magic of Voxa happens. See that `Launch` object? It has a lot of properties that you can give it to easily control how Alexa responds, any associated images or media to play and when to listen out for a response. All of the specific Alexa code which handles how each of those is abstracted away and all that you have to worry about is whether things are an `ask` or a `tell` and so on. It's a pretty clean interface that will grow and evolve over time, but it simplifies the amount of code you have to write to a *large* degree.


**skills/variables.js**
```js
'use strict';

// TODO build variables here
```

**skills/states.js**
```js
'use strict';

exports.register = function register(skill) {
  skill.onIntent('LaunchIntent', () => ({ reply: 'Intent.Launch', to: 'entry' }));
  skill.onIntent('AMAZON.HelpIntent', () => ({ reply: 'Intent.Help', to: 'die' }));
};
```

##### SPEECH ASSETS

We'll come back to this in a moment, but in order to setup the Amazon listing of the skill in a few moments, we'll need some sample data. For now, let's stub a couple files out.

**speechAssets/IntentSchema.json**

```json
{
  "intents": [
    {
      "intent": "AMAZON.CancelIntent"
    },
    {
      "intent": "AMAZON.HelpIntent"
    },
    {
      "intent": "AMAZON.NextIntent"
    },
    {
      "intent": "AMAZON.NoIntent"
    },
    {
      "intent": "AMAZON.PauseIntent"
    },
    {
      "intent": "AMAZON.PreviousIntent"
    },
    {
      "intent": "AMAZON.RepeatIntent"
    },
    {
      "intent": "AMAZON.ResumeIntent"
    },
    {
      "intent": "AMAZON.StartOverIntent"
    },
    {
      "intent": "AMAZON.StopIntent"
    },
    {
      "intent": "AMAZON.YesIntent"
    }
  ]
}
```

**speechAssets/SampleUtterances.txt**

```
AMAZON.HelpIntent Tell me more about this skill
```

That'll do it for now. We'll cover more about what *Intents* and *Utterances* are a bit more

##### RUNNING IT

Before we go any further, let's do some quick work to make sure that everything is setup and running with Node the way we want. So, let's add some files and check some settings. At present, the following are not tied directly to the Voxa framework, but the following setup is provided on Github at the sample link above so we'll step thru each portion of it, but know that if you want to use different toolsets here you can.

**Node Version**
If you're not using [NVM](https://github.com/creationix/nvm/blob/master/README.md) I highly recommend it. After you install it, you can easily tell your local machine which version of Node you're wanted to use. Voxa uses `6.10` so let's `nvm use 6.10`. If you don't have that installed you can run `nvm install 6.10` to make sure that it's downloaded and that you're currently using that version of Node.

Let's add a `.nvmrc` file bash script to specify the node version we'd like to use on the server. Create that file with these contents:

```
v6.10
```

**GULP & NODEMON**

*OPTION 1: THE VOXA WAY*

First, we'll look at the way that Voxa handles local server setup. To package assets and aid in local development, we will use `gulp` and `gulp-nodemon` so you'll want to:

```
npm install gulp gulp-nodemon --save-dev
```

Then, create a file in your root directory called `.gulpfile.js` and add the following contents:

```js
'use strict';

const gulp = require('gulp');
const nodemon = require('gulp-nodemon');

gulp.task('watch', () =>
  nodemon({
    script: 'index.js',
    watch: ['config/*', 'services/*', 'skill/*', 'index.js'],
    ext: 'json js',
    ignore: ['node_modules/**/*'],
  }));

gulp.task('run', () =>
  require('./index.js'));
```

*Again, Voxa assumes `server.js` while I use the standard `index.js` convention. Either is fine, just remember to check your code*

The above script will watch your index.js files and other related directories and run a local server for you anytime that changes happen.

To get your server running, simply call `gulp watch` from the console.

*OPTION 2: Simpler Setup*

While the above is an easy way to do it, I prefer just straight Nodemon. To do this, simply:

```
npm install nodemon --save
```

Then, inside of your `package.json` simply add the following to the `scripts` field:

```js
'dev': 'nodemon -e js,json  --exec node index.js',
```

Then, you can run your server by calling `npm run dev`. I prefer this method as it reduces the number of files and dependencies for the project. The rest of this tutorial assumes you've set it up this way.

**Misc**
There's a couple other files in the [Starter Kit](https://github.com/mediarain/voxa/tree/master/samples/starterKit) and `FirstPodcast` sample project you may want to pull over. Specifically, the `.eslint` and `.gitignore` files.

Okay! So at this point you should be able to `npm run dev` (or `gulp` if you're using Voxa's method) and your server should be started.


----------


### PART TWO: THE SKILL SETUP

In order to get a full end to end setup going, we'll need to configure a skill listing in the Amazon environment, hook our skill up to it using an NGROK tunnel and, finally, setup an Alexa device to use the developer application. When we're done, we'll have a full setup in the sense that we can add a feature to our code, update our skill listing, use the voice commands to try the skill out and continue development from there.

#### NGROK

Finally, we're going to need to use a tool called NGROK to create a publicly accessible URL to link to our local code for the skill which Amazon will use when setting the skill up (which is the next step).

Go to [https://ngrok.com/download](https://ngrok.com/download) to download this tool and follow the setup procedures listed there for installation.

Then, open a new window or tab in Terminal and navigate to your working directory. In it, run the following command, to tell NGROK start listening to traffic on port 3000 of your local machine.

```
ngrok http 3300
```

You'll see a bit of stuff in the output and, assuming no errors, you should see an https url that looks something like `https://92832de0.ngrok.io`. We'll need that later, so leave that window running.


#### Creating an account on the developer portal
Okay, let's take a break from the code for a moment and turn to the web. Head over to [Amazon's Developer Portal](https://developer.amazon.com/) (which is different than their AWS Portal for services like S3 or EC2 which you may have used in the past).

Sign up for an account here and then login.

#### Listing a skill
After you've logged in to the developer portal, from the top nav bar, select `Alexa > Alexa Skills Kit` or click [this link](https://developer.amazon.com/edw/home.html#/skills) to jump right there.

In the top right corner, select `Add a New Skill`.

The screen you see now (currently in create form, later in edit form) is what we will refer to as the **Skill Listing Page** or the **Development Portal Skill Listing** or something similar. Basically, it is Amazon's record of the skill and a contract for how your code will integrate with it.

There's a few things going on here, so we'll step thru them one by one.

**Step One: Skill Information**
This is the basic skill listing information and, most importantly, contains information about how your users will launch the skill.

*Skill Type* - We'll be using the Custom Interaction Model
*Language* - The language of the skill.
*Name* - This is the name as it appears in the Alexa Skill store.
*Invocation Name* - The name people use to launch the skill. There are rules about what you can and can't use as invocation names, so be sure to read thru the [invocation name guidelines](https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/choosing-the-invocation-name-for-an-alexa-skill#invocation-name-requirements). For example, with `Alexa, open Starbucks` the invocation name would be `Starbucks` . And for `Alexa, open Magic Door` the invocation name would be `Magic Door`.
*Global Fields* - We're still getting our feet wet, so for now we'll leave these blank.

Click "Next" to continue to the next screen of the skill listing page.

**Step Two: Interaction Model**

You can read more about the interaction model in the [Amazon docs](https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/defining-the-voice-interface#The%20Intent%20Schema), and if you're planning to develop skills. The interaction model is a set of instructions that inform the natural language processing portions of the Alexa Voice Service (AVS) exactly how your specific skill will be interacted with.

Think of it like a map, wherein we give the AVS key value pairs for things you want users to be able to say (**Utterances**) and different responses that you want Alexa to send your skill (**Intents**).

*Intents*
The intents (commands for your skill) live in a JSON file in our code (**speechAssets/IntentSchema.json**) and it is simply a list of all the expected responses you expect to receive from Alexa in JSON format. On the console, under "Intent Schema" copy/past the code from **speechAssets/IntentSchema.json** into the console input area for intents.

*Custom Slot Types*
You'll notice a section called *Custom Slot Types* under the intents input area. For now, we'll skip these. But we'll come back to them later, for sure.

*Utterances*
The utterances (things people say to trigger the intents) live in a TXT file in our code (**speechAssets/SampleUtterances.txt**). Let's say that you had an Intent called "SubmitOrderIntent" that was meant to represent the key your skill would be sent from Alexa. You'd want to account for all of the ways that a user say "submit my order" in natural language - all of which you'd want to trigger one specific set of code.

Essentially, you provide sample utterances to Amazon and it uses it's natural language models to build a fully robust interaction model. So for the "SubmitOrderIntent", some sample utterances you would add might be:

```
SubmitOrderIntent let's submit that order
SubmitOrderIntent submit the order
SubmitOrderIntent submit my order please
```

However, that doesn't mean that there are only three ways a user could trigger the `SubmitOrderIntent`. That's why we call this text file "SampleUtterances". The natural language models will build a ton of variances to include things like:

```
SubmitOrderIntent let us now submit that order
SubmitOrderIntent submit that order now
SubmitOrderIntent submit my order for the love of god
```

Thus, the mapping from Sample Utterances to Intents is always inherently fuzzy, but should be thought of as highly accurate.

For now, let's just add that one sample utterance from **speechAssets/SampleUtterances.txt** into the console input for Sample Utterances.


*The Interaction Model*
Combined, the way that Utterances, Slot Types and Intents work together is called the Interaction Model. If you're working on a team, someone with Voice Design or User Experience Design should help craft this interaction model, working closely with developers and QA. If you're a smaller team, or an individual developer, you'd want to study up on voice experience design as it's a critical part of how your skill will function. In addition to the Amazon developer docs linked above, and their [Voice Design Guide](https://developer.amazon.com/alexa/voice-design), some links to good resources, all from the amazing folks at UXBooth are:

```
http://www.uxbooth.com/articles/the-future-of-voice-design/
https://medium.com/cbc-digital-labs/adventures-in-conversational-interface-designing-for-the-amazon-echo-be15d792ae49
http://www.uxbooth.com/articles/chatbox-ux-crafting-a-valuable-conversation/
```

Click "Next" to continue to the next screen of the skill listing page.

**Step Three: Configuration**

You've basically got two buckets of ways for hosting a skill. You can use an AWS Lambda (which will we setup together later) or you can use `https` to any web server. You can select North America or Europe depending on where your target customers/servers are.

If you were using a real web server, this is where that address would go, but for now, we'll use the `https` option and paste in our https address from NGROK. (The one that looked like `https://92832de0.ngrok.io`).

The default endpoint within VOXA for skills is at `/skill`. So the URL you'd enter would be something like:

```
https://92832de0.ngrok.io/skill
```

For now, we can ignore the other settings on the page for Account Linking and Permissions.

Click "Next" to continue to the next screen of the skill listing page.

**SSL Certificate**

For the SSL, you'll want to upload a .pem file that gets created after following the instructions here: https://developer.amazon.com/docs/custom-skills/configure-web-service-self-signed-certificate.html

Click "Next" to continue to the next screen of the skill listing page.

**Test**

On the test panel of the web console, scroll down to the *Service Simulator* and in the text panel enter the following text, where "myskill" is the name of the skill that you used on the Invocation Name setting in the configuration.

```
launch myskill
```

You should see the following output in the *Service Response* below:

```json
{
  "version": "1.0",
  "response": {
    "outputSpeech": {
      "type": "SSML",
      "ssml": "<speak>Welcome!</speak>"
    },
    "speechletResponse": {
      "outputSpeech": {
        "ssml": "<speak>Welcome!</speak>"
      },
      "shouldEndSession": true
    }
  },
  "sessionAttributes": {
    "modelData": {},
    "state": "entry"
  }
}
```

This text: "Welcome" ... is coming from your skill! We've just completed the "Hello World" equivalent for Skill development with Voxa. In fact, let's change that text to something else and try again.

In your code editor, navigate to **skill/views.js** and change the `Intent.Launch.Tell` object to anything else you'd like. Run the test service simulator again and see your response.

I changed mine to the following:

```json
{
  "version": "1.0",
  "response": {
    "outputSpeech": {
      "type": "SSML",
      "ssml": "<speak>Hello Fellow Programmers!</speak>"
    },
    "speechletResponse": {
      "outputSpeech": {
        "ssml": "<speak>Hello Fellow Programmers!</speak>"
      },
      "shouldEndSession": true
    }
  },
  "sessionAttributes": {
    "modelData": {},
    "state": "entry"
  }
}
```

We'll break each of those parts down later and play around with different types of responses.

**Publishing Information & Privacy/Compliance**
We'll skip these for now and circle back to them when we're ready to publish our skill.


----------


### PART THREE: BUILDING YOUR SKILL

#### A Simple Interaction

Okay! At this point we have a fully end-to-end skill working locally. It just doesn't do anything but say hello. Let's change that. From here on out, you'll see how all of the setup work we did early on, let's us move quickly.

So where should we start? Let's add a feature to our skill. You can think of something you may want to add for the sample skill you're building, but for the sake of this project, I've been building an "Open West" skill for this conference (unofficially).

For now let's start with a simple question and answer feature, no API calls or complicated conversations yet. You should change the names and text used below to add some new feature to your skill, but the process is the same.

I'm going to add start by adding support for the user to ask "What is Open West?"

##### SPEECHASSETS

First, I'll want to open **speechAssets/SampleUtterances.txt** and think about how the user might want to ask about Open West. Pretty simple, but I came up with the following:

```
InfoIntent what is open west
InfoIntent what's open west about
InfoIntent I want to learn more about open west
InfoIntent tell me more about open west
```

Notice, I've chosen an *IntentName* at this point: **InfoIntent**.  Now, I'll add this to the **speechAssets/IntentSchema.json** file

```json
{
  "intents": [
    {
      "intent": "LaunchIntent"
    },
    {
      "intent": "InfoIntent"
    },
    ....
```

At this point, I'll go ahead and update the copy of both of those files in the Amazon Developer Portal skill listing page under the "Interaction Model" tab. After I've copied those values in (making sure to hit "Save" at the bottom) - the interaction model will update.

If I navigate to the Test panel now and try the following command out in the Service Simulator, it should fail.

```
ask openwest what is open west
```

Perfect! I get a *An unrecoverable error occurred.* message. That means that the request happened, but our code doesn't know what to do with it. Let's fix that.

##### THE STATE MACHINE

Open up your **skill/states.js** file and add something along the following line:

```js
'use strict';

exports.register = function register(skill) {
  skill.onIntent('LaunchIntent', () => ({ reply: 'Intent.Launch', to: 'entry' }));
  skill.onIntent('InfoIntent', () => ({ reply: 'Intent.Launch', to: 'entry' }));
  skill.onIntent('AMAZON.HelpIntent', () => ({ reply: 'Intent.Help', to: 'die' }));
};
```

Notice the new line above that begins `skill.onIntent('InfoIntent',`. This tells the skill that when Alexa sends a response to it after having mapped a users utterances to the intent "InfoIntent" (based on the sample utterances you provided) that you want to reply with the Intent Info view. The `to: 'entry'` line just means

Since that Intent Info view we just referenced doesn't exist yet, let's create it. But before we move on I want to note one more thing about this file.

The `skill` object can handle two types of arguments which represent the two ways you can navigate users from their spoken intent to the code you want to execute in responses. The arguments are:

* onItent
* onState

We're using the `onIntent` above. In a bit, we'll try out the `onState` argument but for now we're using the simpler `onIntent` helper above. Okay - on to create that view!

Navigate to the **skill/states.js** file and add an object to the `Intent` object for the response you'd like Alexa to give. Again - we're keeping it simple here for now, so it's a straight forward answer to our question we defined in the sample utterances. For example:

```js
'use strict';

const views = (function views() {
  return {
    Intent: {
      Launch: {
        tell: 'Hello Fellow Programmers!',
      },
      Info: {
        tell: 'Join us for the annual OpenWest Conference...',
      },
      ...
```

Now, return back to the Service Simulator on the web and ask your skill your question. You should get your response. In my case I entered `ask openwest what is open west` and got the correct response.


#### A More Complex Interaction w/ Sessions

Okay, now that we've got the hang of small interactions, let's try our hand at something a bit more complex. Again, feel free to contextualize this with what it is that you're looking for with the skill your building and please assume that there's been a TON more forethought in terms of what the conversational experience that you're building is. But for now, let's start coding.

I'm going to try to create a recommendation feature to the skill that will allow users to find information on a new or interesting topic. They can "search" in this way by either choosing to "discover something new" or "learn more" about your native programming skillset (like PHP or NodeJS).

Functionally, this is going to introduce us to *managing states* and *sessions*, how to use *standard Amazon Intents*, *SSML* and *variables*, a good workflow for *API calls* and *understanding conversational flow*.

Okay - let's start tackling that.

First, I'm going to create an intent for the recommendation feature I'm creating, and at the same time extend my `Launch` response to prompt a user that the feature exists.

As always, I'll start with the user.

**speechAssets/SampleUtterances.txt**
```
...
InfoIntent tell me more about open west

RecommendationIntent find a talk
RecommendationIntent help me find a session
RecommendationIntent find a new session
RecommendationIntent discover a new session
```

**speechAssets/IntentSchema.json**
```json
{
  "intents": [
    {
      "intent": "LaunchIntent"
    },
    {
      "intent": "InfoIntent"
    },
    {
      "intent": "RecommendationIntent"
    },
    ...
```

> Of course, I'm updating the web console's copy of those two files each time I make a change to them.

**skill/views.js**
```js
'use strict';

const views = (function views() {
  return {
    Intent: {
      Launch: {
        ask: 'Welcome to the OpenWest Conference skill. OpenWest largest regional tech conference devoted to all things OPEN: Hardware, Standards, Source and Data. You can ask me about conference details or ask me to help you find an interesting talk. Would you like me to help you find an interesting talk?',
      },
      Info: {
        tell: 'Join us for the annual OpenWest Conference...',
      },
      Recommendation: {
        ask: 'Alright! Let's do this ... are you feeling adventurous and want to try something new or would you rather dive deeper and learn more about something you already new. You can say "something new" or "learn more". Which would you like to do?',
      },
      ...
```

Notice anything about that first LaunchIntent that we changed? When we had stubbed data we used a `Launch.tell` object to pass the response back to the user. Now we're using a `Launch.ask` (and a `Recommendation.ask`).

There's two things to note about this. First, the objects `tell` and `ask` come from the Voxa frameworks. And two, the difference between `ask` and `tell` is that they tell Alexa whether or not she should be listening for a response. Basically, are you telling the user something (so don't listen for a response) or are you asking the user something (listen for a response).

When you send a request back to Alexa as a tell, a variable called `shouldEndSession` is sent back on the object depending on whether or not the interaction is ended.

```
with a tell:
'shouldEndSession': false

with an ask:
'shouldEndSession': true
```

We'll dive deeper into session management in a moment, but for now, let's edit the final file we need to make that RecommendationIntent work. We just need to add it to the exported module in the file for states.

**skill/states.js**
```js
...
  skill.onIntent('LaunchIntent', () => ({ reply: 'Intent.Launch', to: 'launchRecommendationState' }));
  skill.onIntent('InfoIntent', () => ({ reply: 'Intent.Info', to: 'entry' }));
  skill.onIntent('RecommendationIntent', () => ({ reply: 'Intent.Recommendation', to: 'recommendationState' }));
...
```

Again, you will notice that not only did we add the listing for the RecommendationIntent but we changed a value on the LaunchIntent. Now, both of these intents have different values of the `to` object parameter: `recommendationState` and `launchRecommendationState` .

In Voxa, the `to` parameter is used to tell Alexa what should be happening next. From the Voxa docs:

> The to key should be the name of a state in your state machine, when present it indicates to the framework that it should move to a new state. If absent it’s assumed that the framework should move to the die state.

There are a couple built in ones:

**entry:** Means that the interaction is over and no next state is expected. The skill is back at the beginning, blank state. Think of this like "home" or the "lobby". It keeps the current session open.

**die:** Means that the interaction is over, no next state is expected (much like `entry`) but in this case the session will end.

On top of this, you can create any `to: stateName` that you desire. So here, we've created a `recommendationState` and pointed both the `LaunchIntent` and the `RecommendationIntent` to it.

Okay, let's tackle adding support for that `launchRecommendationState` now.

First, let's add support for that intent to the **skill/states.js** file. Previously, we've been using Voxa's `skill.onIntent` directive. Now, we'll introduce another. The `onState` directive looks like this. It takes the incoming request as an argument and passes it to a closure where we'll handle the request.

**skill/states.js**
```js
  skill.onState('launchRecommendationState', (request) => {
    // handle the request
  });
```


Since the intent here is to capture the response to the question, "Would you like me to help you find an interesting talk?", we need to be able to capture a "yes" and capture a "no".

*The problem?* There are a lot of ways that a person could say yes and no. To help with that, we have access to some baked in Intents from Amazon as part of the Alexa Voice Service. For times like these, we turn to [Amazon's Standard Intents](https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/built-in-intent-ref/standard-intents) which give us access to basic intents. In these cases, we don't have to think of all the ways that a user could respond yes or no, we can use the `AMAZON.YesIntent` and the `AMAZON.NoIntent`. Like this

**skill/states.js**
```js
  skill.onState('launchRecommendationState', (request) => {
    if (request.intent.name === 'AMAZON.YesIntent') {
        // handle the yes response
    } else if (request.intent.name === 'AMAZON.NoIntent') {
        // handle the no response
    }
  });
```

Perfect! We're almost there. So, how do we want to handle if the user say's yes? Well, I think we'd want to send them to the same place where someone who asked for a recommendation would end up.

**skill/states.js**
```js
  skill.onState('launchRecommendationState', (request) => {
    if (request.intent.name === 'AMAZON.YesIntent') {
        return { reply: 'Intent.Recommendation', to: 'recommendationState' };
    } else if (request.intent.name === 'AMAZON.NoIntent') {
        // handle the no response
    }
  });
```

And if they said no, we'd want to tell them something like, "Okay, no worries." or something. So to do that, we'd have to add that custom response to our **skill/views.js** file and then reference that in our **skill/states.js** file. To do that, I'm going to restructure my both of those files so that they each now look like this:

> Notice that I've added a `reprompt` value to any an object below that is an "ask". This is best practice for any time that you're asking a question, as Alexa will listen for a few moments and then prompt the user to respond if it hears nothing.

**skill/views.js**
```js
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
      Help: {
        say: 'Some help text here.',
      },
    },
  };
}());
module.exports = views;
```

**skill/states.js**
```js
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
    // handle the request
  });

  skill.onIntent('RecommendationIntent', () => ({ reply: 'Intent.Recommendation.Main', to: 'recommendationState' }));

  skill.onIntent('AMAZON.HelpIntent', () => ({ reply: 'Intent.Help', to: 'die' }));

};

```

Great!

This means, from a User Experience flow perspective, both a `cold open` of the skill ("Alexa launch openwest") and a `direct open` of the skill ("Alexa, ask openwest to help me find a session"), while they have different responses, both should eventually lead to the `recommendationState` and the expected response to both in this case is assumed to be the same.

**This is why voice experience planning is so important to your process.** Notice the two questions that can lead to the `recommendationState`:

```
From `LaunchRecommendationIntent`:
You can choose to find "something new" or "learn more". Which would you like to do?

From `RecommendationIntent`:
You can say "something new" or "learn more". Which would you like to do?
```

Though they are phrased slightly differently to the user they both have the same expected response. Either the user says "something new" or "learn more", right? Thus, though we took two different paths to get there, getting into the `recommendationState` is a consistent experience. If one of the above questions was phrased differently, the user experience would break down.

Okay, now that we've got our two ways the user can enter the recommendation feature ironed out, let's finish the rest of the recommendation feature.

So, we need to handle for what happens here:

```js
  skill.onState('recommendationState', (request) => {
    // handle the request
  });
```

We're asking for whether or not a user wants to find out info on something new or something they already know. Let's tackle them one by one. First, the easier one: "something new".

Let's start as always by thinking of how the user will interact and adding support for "something new" to our utterances. Here's a sampling of the list I came up with (notice how I'm going to try to account for people who might say "I don't know" as sort of a default response which sends them to "something new".

**speechAssets/SampleUtterances.txt**
```
...
RecommendationIntent find a new session
RecommendationIntent discover a new session

SomethingNewIntent something new
SomethingNewIntent something new please
SomethingNewIntent new
SomethingNewIntent find something new
SomethingNewIntent i want to learn something new
SomethingNewIntent learn something new
SomethingNewIntent discover something new
SomethingNewIntent find a new session
SomethingNewIntent find a new talk
SomethingNewIntent either one
SomethingNewIntent i don't know
SomethingNewIntent i don't care
SomethingNewIntent whatever you want
```

I'll add the following to my Intent Schema and update both of these in the Amazon developer portal listing for the skill:

**speechAssets/IntentSchema.json**
```json
{
  "intents": [
    {
      "intent": "LaunchIntent"
    },
    {
      "intent": "InfoIntent"
    },
    {
      "intent": "RecommendationIntent"
    },
    {
      "intent": "SomethingNewIntent"
    },
    ...
```

Now, let's add that to the states registry:

**skill/states.js**
```js
  skill.onState('recommendationState', (request) => {
    if (request.intent.name == 'SomethingNewIntent') {
        return { reply: 'Intent.SomethingNew.Main', to: 'somethingNewState' };
    }
    // handle learn more request
  });
```

Now, let's add that to our view to make it work:

**skill/views.js**
```js
...
      SomethingNew: {
        Main: {
          ask: 'Okay. I\'ve scanned through the conference talks about found some ones that look particularly interesting. I\'ll go through them one by one and after I tell you about them, you can tell me if you want to hear more about that one, or another one. sound good?',
          reprompt: 'Do you want me to start sharing some featured talks? You can tell me 'Yes' or 'No'.'
        },
      },
...
```

Perfect.

Lets go ahead and add support for how a user might respond to that Yes or No question.

**skill/states.js**
```js
  skill.onState('somethingNewState', (request) => {
    if (request.intent.name === 'AMAZON.YesIntent') {
        return { reply: 'Intent.SomethingNew.Yes', to: 'randomSessionState' };
    } else if (request.intent.name === 'AMAZON.NoIntent') {
      return { reply: 'Intent.Recommendation.No', to: 'die' };
    }
  });

  skill.onState('randomSessionState', (request) => {
    // handle the request
  });
```

Let's update the view to make sure that the `SomethingNew.Yes` has a stubbed value and test it out:

**skill/views.js**
```js
...
      SomethingNew: {
        Main: {
          ask: 'Okay. I\'ve scanned through the conference talks about found some ones that look particularly interesting. I\'ll go through them one by one and after I tell you about them, you can tell me if you want to hear more about that one, or another one. sound good?',
          reprompt: 'Would you like me to start helping you find an interesting session?'
        },
        Yes: {
          ask: 'Here is a featured talk. Wanna learn more or go to the next one?',
          reprompt: 'Would you like to learn more about this talk or go to the next one? You can say "session details" or "next".'
        }
...
```

So we added support for the `somethingNewState` to our states registry and mapped the Yes response to a new state we're calling `randomSessionState` which, presumably, will showcase a random session. For now that's just stubbed out with a response that says "Here is a featured talk". And we've mapped the No response to our same `Recommendation.No` object which exits the skill.

Before we go any further, let's test out that the code we've done so far is working. Go to the developer portal and navigate to the Service Simulator to test out the following commands. If you don't get the correct flow, go through the above portions of the tutorial again.

```
input: launch openwest
input: yes
input: something new
input: yes
expected state: "Here is a featured talk..."

Hit RESET

input: ask openwest to help me find a session
input: something new
input: yes
expected state: "Here is a featured talk..."
```

When the user responds that they are ready to start going through the featured (here, random) sessions we want to fetch the session information from JoindIn and then concat that with some basic instructional information "Wanna learn more or go to the next one?"

There are a lot of ways that we could fetch that data from the web. JoinedIn has an OAUTH API that we could take the trouble of authenticating with, but all of the data for all of their listed conferences is public, so really, we just need to hit a URL and grab the contents.

For this, let's pull in the native `request-promise` NPM package and make a get request to the endpoint. In a terminal console window or tab that's not running the dev server or NGROK, navigate to the project directory and run the two following commands (request is a peer dependency so they have to be run separately):

```
npm install --save request
npm install --save request-promise
```

Now, let's replace that stubbed response "Here is a featured talk..." with an actual response. In order to do that, we're going to have to create a variable for our views to consume. Let's start by editing the views. In Voxa, we can use curly braces to represent variable view data so that the `SomethingNew.Yes` object can take a variable, like this:

**skill/views.js**
```js
...
      SomethingNew: {
        ...
        Yes: {
          ask: '{RandomSessionDescription}',
        }
...
```

We then use the `skill/variables.js` file that we created earlier to tell Voxa what to use in place of that variable. That's where we'll make our call to the API and fetch a random session to feature. That code would look like:

**skill/variables.js**
```js
'use strict';

const requestPromise = require('request-promise');

exports.RandomSessionDescription = function RandomSessionDescription(model) {
  const randomTalk = Math.floor(Math.random() * (221-1) + 1);
  let options = {
      uri: `https://api.joind.in/v2.1/events/6314/talks?start=${randomTalk}&resultsperpage=1`,
      headers: {
          'User-Agent': 'Request-Promise'
      },
      json: true
  };
  return requestPromise(options)
      .then(function (res) {
      var days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
        const randomTalk = res.talks[0];
        const randomTalkTitle = randomTalk.talk_title;
        const randomTalkDescription = randomTalk.talk_description;
        const randomTalkSpeaker = randomTalk.speakers[0].speaker_name;
        const randomTalkDate = days[new Date(randomTalk.start_date).getDay()];
        // @todo add "learn more" and "next one" support for this session
          return `On ${randomTalkDate} ${randomTalkSpeaker} will be presending a talk called ${randomTalkTitle}. ${randomTalkDescription} <break time="0.5s"/> Wanna learn more or go to the next one? You can say "session details" or "next"?`;
      })
      .catch(function (err) {
        // @todo add "try again" support for this session
        return 'Sorry we could not find any talks for OpenWest. Would you like to try again or exit?';
      });
};
```

Behind the scenes, Voxa inserts the resolution of this function to the variable with the same name. In particular, this code is doing a few more things:

* Introducing SSML: A universal syntax language built for voice interfaces. The `<break time="0.5s"/>` tells Alexa to pause. To read more about supported SSML Tags, [go here](https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/speech-synthesis-markup-language-ssml-reference).
* I introduced a question at the end of that response `Wanna learn more or go to the next one?` .... neither are supported yet, so we'll want to add those
* We'll also want to add that "try again" that I'm using if the API call fails
* Notice that on the `//@todo` notes, I say "in this session". This is part of state management in that I don't want the "try again" or "learn more" to be global responses, but rather tied to this specific portion of the codebase.
* **NOTE:** I cheated and hardcoded the max number of results from the API to the number of total talks for OpenWest. While this isn't necessarily ideal for production, it's not terrible since theoretically, this feature can really only exist after the talks are already set. But still, for production I'd want to fetch that number dynamically.

Feel free to go ahead and try this out in the Service Simulator online, I'm going to keep going with finishing up this "SomethingMoreIntent" by wrapping up those `//@todo` notes.

You'll notice on the **skill/states.js** that after we've given someone a random session description, we're setting the state as `randomSessionState`. It's inside there that we'll want to add support for the three ways that a user could respond.

* Learn more about a specific session
* Find another one
* Try again (if the API call failed)

We don't have to add support for the "exit" command that I prompt users is available to them if the API call fails as that is always globally accessible with Amazon.

Okay, as always, we start with where how the user will interact with the code. I've added sample utterances for the following:

**speechAssets/SampleUtterances.txt**
```
...
SomethingNewIntent whatever you want

SessionDetailIntent session details
SessionDetailIntent talk details
SessionDetailIntent session
SessionDetailIntent details

AMAZON.NextIntent next
AMAZON.NextIntent another one
AMAZON.NextIntent another session
AMAZON.NextIntent another talk
AMAZON.NextIntent new talk
AMAZON.NextIntent new session

TryAgainIntent try again
TryAgainIntent try more
```

I'll add the `SessionDetailIntent` and `TryAgainIntent` to the intent schema (there was already a listing for `Amazon.NextIntent`):

**speechAssets/IntentSchema.json**
```json
{
  "intents": [
    {
      "intent": "LaunchIntent"
    },
    {
      "intent": "InfoIntent"
    },
    {
      "intent": "RecommendationIntent"
    },
    {
      "intent": "SomethingNewIntent"
    },
    {
      "intent": "SessionDetailIntent"
    },
    {
      "intent": "TryAgainIntent"
    },
...
```

(Of course, I'll update the interaction model on the developer portal as well).

Okay, now we need to add support for the `sessionDetailState` to the states registry.

**skill/states.js**
```js
  skill.onState('randomSessionState', (request) => {
    if (request.intent.name === 'SessionDetailIntent') {
      return { reply: 'Intent.SessionDetail.Main', to: 'sessionDetailState' };
    } else if ((request.intent.name === 'AMAZON.NextIntent') || (request.intent.name === 'TryAgainIntent')) {
      return { reply: 'Intent.SomethingNew.Yes', to: 'randomSessionState' };
    }
  });

  skill.onState('sessionDetailState', (request) => {
    //
  });
```

Note that I'm mapping the "Next" and the "Try again" to the same place - the `randomSessionState` which we just previously built. So now, to complete this feature all we have to do is create the `Intent.SessionDetail.Main` and handle any response after we give the user that session details. That last one should be simple enough as I imagine that after I give the user details about the session, I'll just have Alexa ask if they want to hear another one or exit. So I can probably just do the same thing we did previously when we asked if they wanted to hear about a new interesting talk for the `somethingNewState`:

**skill/states.js**
```js
  skill.onState('sessionDetailState', (request) => {
    if (request.intent.name === 'AMAZON.YesIntent') {
      return { reply: 'Intent.SomethingNew.Yes', to: 'randomSessionState' };
    } else if (request.intent.name === 'AMAZON.NoIntent') {
      return { reply: 'Intent.Recommendation.No', to: 'die' };
    }
  });
```

Great! Now to add support for the `Intent.SessionDetail.Main` and call this feature done. We only need to update a couple files to do this. Our big will be to remember what session we were fetching info for since we previously had chosen one at random. In order to dive deeper into that talk, we'll need to remember a few things about that talk. First, let's add the info to the view to support this intent:

**skill/views.js**
```js
...
      SessionDetail: {
        Main: {
          ask: '{SessionDetails} Would you like to learn more about another talk?',
          reprompt: 'Would you like to learn more about another talk?',
        }
      },
...
```

Obviously, that variable `SessionDetails` doesn't exist yet. So let's head over to our **skill/variables.js** file and add that. But before we put code to it, let's think about how we might do that.

The big question for me is, do we want to make another API call? If I take a look at the URL I used on that first API call as part of the `RandomSessionDescription` variable, I think I can get everything I need from it.

For instance, `https://api.joind.in/v2.1/events/6314/talks?start=43&resultsperpage=1` has information we've already used (like the day, title, description and presenter) but it also contains information about the time and place of the talk, as well as the track it belongs to. I think that should be enough. So rather than make another call, I really just want to grab that information when I make my first call and remember it.

To do that with Voxa and Alexa, we could take advantage of the model object to store session attributes that are passed back to Alexa, stored for us, and then returned on the next request. So that would look something like:

**skill/variables.js**
```js
'use strict';

const requestPromise = require('request-promise');
const moment = require('moment');

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
```

> Note: I ran `npm install moment --save` to install MomentJS for easy formatting of dates/times and have required it at the top of that script.

Okay - We're all done. Feel free to had over to the Service Simulator online and test it out.

We've just covered a lot. Mainly:

* Use of variable responses
* A good workflow for fetching info from an API
* How to manage states
* SSML
* Standard Amazon Intents
* Understanding conversational flow

Next, we'll learn about custom slot types and capturing user responses to use as variables in your skill.

> I feel the need to note that the **speechAssets/SampleUtterances.txt** file is really bare bones. Ideally, I'd have dozens of more sample combinations of how people could

#### A More Complex Interaction w/ Custom Slot Types

Next, if we refer back to that above conversation diagram, we'll tackle the "learn something new" portion of  the conversation. So, when a user opens the skill, they have an option between "finding something new" wherein we serve up sample OpenWest session details at random or "learning more" about a skill set they already have.

The "finding something new" can be thought of as a guided path which we've already created. The user gets to say things like "yes" or "no" or "another one" but doesn't get to give us any specific information about what they want to know.

The "learning more" is going to require us to use feedback from the user in order to craft the conversation.

I imagine that if the user were to select "learn more" they'd be asked by Alexa what they want to learn about. Then, we'd return some featured talks on that topic. In order to do this, we're going to have to use "Custom Slot Types".

Custom Slot Types represent variable things that people might say. Consider the example wherein you want the user to order an item off a menu. You might have a Custom Slot Type for "BreakfastFoods", "LunchFoods" or "Drinks". Let's take "BreakfastFoods" for example. You don't want to have a specific Intent for every conceivable type of breakfast food. That would get a bit crazy. What you want instead is a generic "breakfast foods" response that uses the requested item as a variable (slot) in the response:

```
Alexa: "What can I get you for breakfast?"
User: "I want ${breakfastItem}."
Alexa: "Okay, I will get you your ${breakfastItem} ordered up shortly."
```

We'll use this same type of interaction model for our skill.

```
Alexa: "What do you want to learn more about?"
User: "I want to learn about ${sessionTopic}."
Alexa: "Great! Here's an interesting talk about ${sessionTopic}..."
```

So, as always, let's start with what we the user would say. So I'll add some sample utterances to my text file:

**speechAssets/SampleUtterances.txt**
```
LearnSomethingIntent I want to learn more about {sessionTopic}
LearnSomethingIntent learn about {sessionTopic}
LearnSomethingIntent dive deeper into {sessionTopic}
LearnSomethingIntent learn more on {sessionTopic}
LearnSomethingIntent go to sessions about {sessionTopic}
LearnSomethingIntent learn {sessionTopic}
```

Then, I'll add that`LearnSomethingIntent` intent to my intent schema.

**speechAssets/IntentSchema.json**
```
...
    {
      "intent": "TryAgainIntent"
    },
    {
      "intent": "LearnSomethingIntent"
    },
    {
      "intent": "AMAZON.CancelIntent"
    },
    {
 ...
```

Obviously, I'll add both of those to my Interaction Model in the web panel, but did you notice that we added a variable to the utterances?

```
LearnSomethingIntent learn {sessionTopic}
```

Here, `{sessionTopic}` represents a variable. So how does Alexa know that? If you've been looking at the Interaction Model page on the developer portal, you'll notice that in between the Intent Schema and Sample Utterances sections, there is a section in between those two that is for Custom Slot Types.

And while you could build these from the web console, we'll follow a Voxa convention for creating these in your code and then, like the other parts of the interaction model, copy/paste them to the developer console.

So, back in our code, we'll create a folder inside of the **speechAssets** folder which will be named `customSlotTypes`. In it we'll put a text file for each custom slot type, here called `SESSION_TOPIC.txt`. So that you're directory should look like this:

```
/speechAssets
  /customSlotTypes
    SESSION_TOPIC.txt
```

 The contents of that text file would be all of the variables that we want to account for. For this example, we'll use the name of the tracks at OpenWest this year:

```
data
ops
cloud
tools
web
programming
tutorials
beginners
hardware
mobile
general
community
```

After I've done that, I'll return back to the web console. Under the `Add a Slot Type` form I'll give it the slot type the name `sessionTopic` and for the values I'll copy/paste the above list.

Now, if you try to save it - you should get an error. Why? Because Slot types need to be added to the IntentSchema based on where they are likely to occur:

**speechAssets/IntentSchema.json**
```
    {
      "intent": "LearnAboutTopicIntent",
      "slots":  [
        {
          "name": "sessionTopic",
          "type": "SESSION_TOPIC"
        },
      ]
    },
```

Okay! Now we just need to add the controller (**states.js**) and view (**views.js**) logic to make these work.

I imagine that if the user selected that they wanted to learn more about tutorials or hardware that they would be able to only hear about talks that those tracks had. Unfortunately, the Joindin API docs don't have an endpoint for that `There is no general talks collection, instead you can find talks by event or by speaker.` So we'll have to use our imaginations here. But as we've already covered how to add HTTP requests into the lifecycle of an intent, we'll focus here on just making sure that our custom slot type is working.

So to do that, we'll want to update the **states.js** file and add this to the state machine. It allows Alexa to respond to something via the `LearnAboutTopicIntent` after opening the skill. It will store the slot value `slots.sessionTopic.value` on the model for later consumption.

**skill/states.js**
```
...
  skill.onState('recommendationState', (request) => {
    if (request.intent.name == 'SomethingNewIntent') {
        return { reply: 'Intent.SomethingNew.Main', to: 'somethingNewState' };
    }
    if (request.intent.name == 'LearnAboutTopicIntent') {
      request.model.sessionTopic = request.intent.slots.sessionTopic.value;
        return { reply: 'Intent.LearnAboutTopicIntent.Main', to: 'die' };
    }
  });
...
```

Next, we need to add the session topic to the model in order to consume that stored variable. That's simple enough:

**skill/variables.js**
```
exports.sessionTopic = function sessionTopic(model) {
  return model.sessionTopic;
};
```

Then, inside of our **views.js** file, we'll add the following JS:
**skill/views.js**
```
      LearnSomethingIntent: {
        Main: {
          ask: 'Okay. I see that you want to learn more about {sessionTopic}. That\'s a good topic!',
          reprompt: 'Ready to find something new?'
        }
      },
```

Okay - you should be good to test it out now with the following flow, using any value for `sessionTopic` that we defined in the schema:

```
launch openwest
yes
learn about {sessionTopic}
```

#### Notes for Refactoring

* Opportunities for Deep Links
* Implementing caching

#### Account Linking

*We did not get to cover this* ... basically it's OAuth. For further reference, visit: https://github.com/mediarain/voxa/tree/master/samples/accountLinking

### PART FOUR: LAUNCH & CERTIFICATION

#### Hosting Setup
You can use any host setup you'd like for your skill. Feel free to spin up a Heroku app, or a Digital Ocean server, Linode or whatever you'd like. For this tutorial, I am going to use the AWS environment's Lambda server. The reasons for this are:

 1. It's serverless, so you're not incurring costs at rest and you can scale horizontally
 2. It's fast (though sometimes the container takes a moment to spin up if not warm)
 3. It's AWS so you've got room to integrate databases, SNS, API Gateway, Route 53 or any other kind of service you might need.
 4. It's AWS, so the skill is sort of built to work it with the Lambda service out of the box
 5. Lambda is a "Free Tier" product, so ... it's free to try.

##### Create an Account with AWS

Navigate to the [AWS Console](https://aws.amazon.com/). If you have an account, go ahead and log in. If not, you can create one. While a credit card is required to setup the account, no charges are necessary.

##### Creating a Lambda Server

From the compute section of services in the AWS dashboard, you can create a Lambda function for the Alexa Skill. In the AWS console, go to the Lambda console and create a new one with the following settings:

**Blueprint**: Select Node JS 4.3 and then “Blank Function”
**Triggers**: Alexa Skills Kit
**Name**: anything-you-want

On the configure function panel:
**Runtime**: Node JS 4.3
**Description**: Anything...

**Lambda function code pane**l:
**Code entry type**: Edit inline code
**Encryption/Environment variables**: none

Lambda function handler and role panel:
**Handler**: skill/index.handler (this looks for the exports.handler on the skill/index.js file in the code, so changing this would require a code change)
**Role**: Choose an existing role
**Existing Role**: lambda_basic_execution

You can leave the rest of the settings the way they are (in time, Memory allocation could be adjusted but that would need much more traffic before it became necessary).

Copy and paste the ARN Number from the Lambda dashboard. You will replace the NGROK url in the Developer portal for your skill with this Lambda ARN number.

##### Connect Your AWS Device to Your Account To Test

If you sign in to the Amazon companion app on your mobile device with the same login that your AWS developer portal is under and (assuming your phone is connected to your mobile device), browse the skills to enable, you should see that the skill that you'd added in the Developer Portal. You can enable that skill and test it out on an actual Lambda running your sites's code.
