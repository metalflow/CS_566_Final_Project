//import libraries
import nlp from 'compromise/three';
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
const synonyms = require("synonyms");

// Create new instance - speech synthesis
const synthesis = window.speechSynthesis;


// Establish that browser has speech recognition
window.SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

// Create new instance - speech recognition
const recognition = new SpeechRecognition();
recognition.interimResults = true;
recognition.continuous = true;
recognition.lang = 'en-US';

// Grab elements from the DOM
let startRecognition = document.querySelector('#start');
let stopRecognition = document.querySelector('#stop');
let clearTranscript = document.querySelector('#clear');
let playSpeech = document.querySelector('#play');
let transcript = document.querySelector('#transcript');

// Add event listeners
startRecognition.addEventListener('click', handleStartRecognition);
stopRecognition.addEventListener('click', handleStopRecognition);
clearTranscript.addEventListener('click', handleClearTranscript);
playSpeech.addEventListener('click', handlePlaySpeech);

function handleStartRecognition(event) {
  console.log('start speech recognition');

  recognition.addEventListener('error', (event) => {
    console.log('an error occurred');
  });

  recognition.addEventListener('result', (event) => {
    const results = Array.from(event.results)
      .map((item) => item[0].transcript)
      .join('');

    console.log(results);
    transcript.textContent = results;
  });

  recognition.start();
}

function handleStopRecognition(event) {
  console.log('stop speech recognition');
  recognition.stop();
}

function handleClearTranscript(event) {
  transcript.textContent = '';
}

function handlePlaySpeech(event) {
  console.log('speech synthesis');

  let utterance = new SpeechSynthesisUtterance(transcript.textContent);
  synthesis.speak(utterance);
}
