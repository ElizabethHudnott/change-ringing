import {NamedRow, Method, Cover} from './methods.js';
window.NamedRow = NamedRow;
window.Method = Method;

const SAMPLE_PATH = 'samples/MusyngKite/';
let instrument = 'tubular_bells';

const NOTE_NAMES = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

function midiNoteToName(noteNumber) {
	const octave = Math.trunc(noteNumber / 12) - 1;
	const noteName = NOTE_NAMES[noteNumber % 12];
	return noteName + octave;
}

function sampleURL(instrument, noteNumber) {
	return SAMPLE_PATH + instrument + '-mp3/' + midiNoteToName(noteNumber) + '.mp3';
}

const context = new AudioContext();
let samples = [];
const sourceNodes = [];

const fetchSample = noteNumber =>
	fetch(sampleURL(instrument, noteNumber), {cache: 'force-cache'})
	.then(response => response.ok ? response.arrayBuffer() : Promise.reject(new Error('HTTP ' + response.status + ' ' + response.statusText)))
	.then(arrayBuffer => context.decodeAudioData(arrayBuffer))
	.then(audioBuffer => [noteNumber, audioBuffer]);

const Scales = {
	MAJOR: [2, 2, 1, 2, 2, 2, 1],
}

let scale = Scales.MAJOR;
let numberOfBells = 6;
let noteNumbers = [65];

function loadSamples() {
	let currentNote = noteNumbers[0];
	const newNotes = [];
	let index = scale.length - 1;
	for (let i = 0; i < numberOfBells; i++) {
		newNotes.push(currentNote);
		currentNote -= scale[index];
		index--;
		if (index === -1) {
			index = scale.length - 1;
		}
	}

	const promises = [];
	for (let note of newNotes) {
		if (samples[note] === undefined) {
			const promise = fetchSample(note)
			.then(data => samples[data[0]] = data[1]);
			promises.push(promise);
		}
	}
	Promise.all(promises).then(() => noteNumbers = newNotes);
}

loadSamples();

function playNote(bellNumber, time) {
	const midiNote = noteNumbers[bellNumber - 1];
	const sample = samples[midiNote];
	if (sample === undefined) {
		return;
	}
	const newNode = new AudioBufferSourceNode(context);
	newNode.buffer = sample;
	newNode.connect(context.destination);
	newNode.start(time);
	const oldNode = sourceNodes[midiNote];
	if (oldNode !== undefined) {
		oldNode.stop(time);
	}
	sourceNodes[midiNote] = newNode;
}

let rows = [];
let firstRowNumber = 0;
let currentRowNumber = 0;
let nextColumnNumber = 0;
let noteLength = 60 / 104;
let lastScheduled;
const LOOKAHEAD_TIME = 0.1;
const SCHEDULING_INTERVAL = 0.025;

function nextQuantum() {
	// Current time + 2 frames
	return context.currentTime + 255 / context.sampleRate;
}

function scheduleNotes() {
	let row = rows[currentRowNumber];
	let numNotesInRow = row.length;
	let nextNoteTime = lastScheduled + noteLength;
	const maxSchedule = context.currentTime + LOOKAHEAD_TIME;
	while (nextNoteTime <= maxSchedule) {
		const nextBell = row[nextColumnNumber];
		playNote(nextBell, nextNoteTime);
		lastScheduled = nextNoteTime;
		nextNoteTime += noteLength;
		nextColumnNumber++;
		if (nextColumnNumber === numNotesInRow) {
			nextColumnNumber = 0;
			currentRowNumber++;
			const numRows = rows.length;
			if (currentRowNumber === numRows) {
				currentRowNumber = firstRowNumber;
			}
			row = rows[currentRowNumber];
			numNotesInRow = row.length;
		}
	}
	setTimeout(scheduleNotes, SCHEDULING_INTERVAL);
}

function setNewRows(newRows) {
	if (nextColumnNumber === 0) {
		rows = newRows;
		firstRowNumber = 0;
	} else {
		rows = [rows[currentRowNumber]].concat(newRows);
		firstRowNumber = 1;
	}
}

document.getElementById('btn-start').addEventListener('click', function (event) {
	context.resume();
	rows = [ NamedRow.rounds(numberOfBells) ];
	lastScheduled = nextQuantum() - noteLength;
	scheduleNotes();
});

document.getElementById('btn-grandsire').addEventListener('pointerdown', function (event) {
	const newRows = Method.grandsire(rows[currentRowNumber], undefined, Cover.EITHER);
	setNewRows(newRows);
});
