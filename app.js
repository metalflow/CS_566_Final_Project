//import libraries
import nlp from "./node_modules/compromise/builds/three/compromise-three.mjs";
/* https://github.com/spencermountain/compromise/blob/master/README.md
Compromise Key methods and functions 
.normalize({}) - clean-up the text in various ways
Selections:
.people(): Find names of people.
.places(): Find locations.
.dates(): Extract and format dates (e.g., doc.dates().format('{month} {date}')).
.match(): Use a regex-like syntax for custom searches (e.g., doc.match('#Adjective #Noun')).
Transformations:
.toUpperCase() / .toLowerCase(): Change case.
.toNegative() / .toPositive(): Flip the sentiment of sentences.
.verbs().toPastTense(): Change verb tenses automatically.
Output:
.text(): Return the modified string.
.json(): Return the parsed data as an object for further programmatic use.
Verbs:
.verbs().parse() - get tokenized verb-phrase
.verbs().subjects() - what is doing the verb action
Nouns:
.nouns().toSingular()
*/
//import synonyms from "./node_modules/synonyms/";
import axios from "./node_modules/axios/index.cjs";

// Create new instance - speech synthesis
const synthesis = window.speechSynthesis;
// speech variable needs global scope
let speech;

// Establish that browser has speech recognition
window.SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

// Create new instance - speech recognition
const recognition = new SpeechRecognition();
recognition.interimResults = false;
recognition.continuous = true;
recognition.lang = "en-US";

// Grab elements from the DOM
let startRecognition = document.querySelector("#start");
let stopRecognition = document.querySelector("#stop");
let clearTranscript = document.querySelector("#clear");
//let playSpeech = document.querySelector("#play");
let transcript = document.querySelector("#transcript");

// Add event listeners
startRecognition.addEventListener("click", handleStartRecognition);
stopRecognition.addEventListener("click", handleStopRecognition);
clearTranscript.addEventListener("click", handleClearTranscript);
//playSpeech.addEventListener("click", handlePlaySpeech);

const HelpSpeech =
  "I know how to get the duration of a movie, get a review for a movie, find out if an actor was in a movie, and find a movie theater near a location you provide.";

async function getOMDBAPIdata(movieTitle) {
  try {
    const URL = "https://www.omdbapi.com/?t=";
    const KEY = "&apikey=191c50ee";
    const query = (URL += movieTitle += KEY);
    const response = await axios.get(query);
    console.log(response.data); // Logs parsed data object
    console.log(response.status); // Logs HTTP status code (e.g., 200)
  } catch (error) {
    console.error("Error fetching data:", error.message);
  }
  return response;
}

function handleStartRecognition(event) {
  console.log("start speech recognition");

  recognition.addEventListener("error", (event) => {
    console.log("an error occurred");
  });

  recognition.addEventListener("result", (event) => {
    let lastIndex = event.results.length - 1;
    speech = nlp(event.results[lastIndex][0].transcript).normalize();

    const results = speech.text();

    console.log(results);
    transcript.textContent = heySiskel(speech);
  });

  recognition.start();
}

function handleStopRecognition(event) {
  console.log("stop speech recognition");
  recognition.stop();
}

function handleClearTranscript(event) {
  transcript.textContent = "";
}

function handlePlaySpeech(event) {
  console.log("speech synthesis");

  let utterance = new SpeechSynthesisUtterance(transcript.textContent);
  synthesis.speak(utterance);
}

function heySiskel(input) {
  //condition our input
  input.toLowerCase();
  //SpeechRecognition often mistakes Siskel for Cisco
  input.replace("hey cisco", "hey siskel");
  //input.replace("hey sisco", "hey siskel");

  //put our conditioned input text on top and separate with a carriage return for display
  let output = input.text();
  output += "\n";

  //begin processing
  if (!input.has("hey ~siskel~", null, { fuzzy: 0.7 })) {
    output += "you must say 'hey siskel' to activate siskel";
    synthesis.speak(
      new SpeechSynthesisUtterance(
        "you must say 'hey siskel' to activate siskel",
      ),
    );
    return output;
  }

  //break up input by activation phrase with one verb and one noun
  let phrase = input.match("hey ~siskel~ *", null, {
    fuzzy: 0.7,
  });
  console.log(phrase.out("array"));

  //check for multiple utterances
  if (phrase.length > 1) {
    let error =
      "You said 'Hey Siskel' more than once. I will only process the first phrase, which was ";
    error += phrase.out("array")[0];
    console.log(error);
    synthesis.speak(new SpeechSynthesisUtterance(error));
  }

  //reparse and target down to just one phrase
  phrase = nlp(phrase.out("array")[0]).remove("hey siskel");
  console.log(phrase.text());

  let verbs = phrase.verbs().out("array");
  let adverbs = phrase.adverbs().out("array");
  let nouns = phrase.nouns().out("array");
  let pronouns = phrase.pronouns().out("array");
  let subjects = phrase.verbs().subjects().out("array");
  let places = phrase.places().out("array");
  let people = phrase.people().out("array");
  let question = phrase
    .match("(who|what|when|where|how) * #verb * #noun")
    .out("array");

  console.log(verbs);
  console.log(adverbs);
  console.log(nouns);
  console.log(pronouns);
  console.log(subjects);
  console.log(places);
  console.log(people);
  console.log(question);

  //decision tree for deciding which function to apply
  let speech;
  switch (true) {
    case phrase.has("how long is"):
      speech = getMovieDuration(phrase.nouns().out("array")[0]);
      //speech = "you asked about the duration of ";
      //speech += phrase.nouns().out("array")[0];
      break;
    case phrase.has("runtime") ||
      phrase.has("run time") ||
      phrase.has("duration"):
      speech = "you asked about the duration of ";
      speech += phrase.nouns().out("array")[1];
      break;
    default:
      speech = "I didn't understand that question.  ";
      speech += HelpSpeech;
      break;
  }

  synthesis.speak(new SpeechSynthesisUtterance(speech));
  return (output += speech);
}

function getMovieDuration(movieTitle) {
  const data = getOMDBAPIdata(movieTitle);
  let speech = movieTitle;
  speech += " is ";
  speech += data.Runtime;
  speech += " long.";
  return speech;
}
