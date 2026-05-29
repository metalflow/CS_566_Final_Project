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

  //put our conditioned input text on top and separate with a carriage return for display
  let output = input.text();
  output += "\n";

  //begin processing
  if (!input.has("hey siskel")) {
    output += "you must say 'hey siskel' to activate siskel";
    synthesis.speak(
      new SpeechSynthesisUtterance(
        "you must say 'hey siskel' to activate siskel",
      ),
    );
    return output;
  }

  let phrase = input.after("hey siskel").out("array");
  //let sentences = input.sentences().out("array");
  let verbs = input.nouns().out("array");
  let nouns = input.verbs().out("array");
  let subjects = input.verbs().subjects();
  let places = input.places();
  let people = input.people().parse();

  console.log(phrase);
  //console.log(sentences);
  console.log(verbs);
  console.log(nouns);
  console.log(subjects);
  console.log(places);
  console.log(people);
  output += "yes sir";

  return output;
}
