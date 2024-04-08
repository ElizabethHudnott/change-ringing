import {NamedRow, Method, Cover, homing} from './methods.js';
import {setNotes, getAudioContext, setBarCallback, getCurrentBar, repeatBar, setMusic} from './audio.js';
import {addWeavingRow, drawWeave} from './graphics.js';

const audioContext = getAudioContext();
const canvas = document.getElementById('canvas');
const context2d =  canvas.getContext('2d');

function resize() {
	canvas.width = canvas.clientWidth;
	canvas.height = canvas.clientHeight;
}

resize();
window.addEventListener('resize', resize);

let numberOfBells = 8;
let cover = Cover.EITHER;
let trebleNote = 70;
setNotes(trebleNote, numberOfBells);
let animationID;

setBarCallback(function (row, startTime) {
	addWeavingRow(row, startTime);
});


function animate() {
	drawWeave(context2d, audioContext.currentTime);
	animationID = requestAnimationFrame(animate);
}

animationID = requestAnimationFrame(animate);

let rowGenerator, compositionFunction;

function changeBarLength(bar, newLength) {
	let length = bar.length;
	if (newLength < length) {
		return bar.slice(0, newLength);
	}
	let minBell = bar[0];
	let maxBell = minBell;
	for (let i = 1; i < length; i++) {
		const bellNumber = bar[i];
		if (bellNumber < minBell) {
			minBell = bellNumber;
		} else if (bellNumber > maxBell) {
			maxBell = bellNumber;
		}
	}
	for (let i = minBell + 1; i < maxBell && length < newLength; i++) {
		if (!bar.includes(i)) {
			bar.push(i);
			length++;
		}
	}
	for (let i = minBell - 1; i > 0 && length < newLength; i--) {
		if(!bar.includes(i)) {
			bar.push(i);
			length++;
		}
	}
	for (let i = maxBell + 1; length < newLength; i++) {
		bar.push(i);
		length++;
	}
	return bar;
}

function runMethod(method) {
	const firstBar = getCurrentBar();
	const newRows = method(firstBar);
	setMusic(newRows);
	rowGenerator = method;
	compositionFunction = setMusic;
}

function homeInOnBar(rowFunction) {
	const firstBar = getCurrentBar();
	const newRows = homing(firstBar, rowFunction(numberOfBells));
	setMusic(newRows, newRows.length - 1);
	rowGenerator = row => homing(row, rowFunction(row.length));
	compositionFunction = rows => setMusic(rows, rows.length - 1);
}

document.getElementById('btn-start').addEventListener('click', function (event) {
	audioContext.resume();
	repeatBar(NamedRow.rounds(numberOfBells));
});

// Methods

document.getElementById('btn-hunt').addEventListener('pointerdown', function (event) {
	runMethod(row => Method.plainHunt(row, undefined, cover));
});

document.getElementById('btn-plain-bob').addEventListener('pointerdown', function (event) {
	runMethod(row => Method.plainBob(row, undefined, cover));
});

document.getElementById('btn-grandsire').addEventListener('pointerdown', function (event) {
	runMethod(row => Method.grandsire(row, undefined, cover));
});

// Named rows

document.getElementById('btn-rounds').addEventListener('pointerdown', function (event) {
	homeInOnBar(NamedRow.rounds);
});

document.getElementById('btn-back-rounds').addEventListener('pointerdown', function (event) {
	homeInOnBar(NamedRow.backRounds);
});

document.getElementById('btn-burdette').addEventListener('pointerdown', function (event) {
	homeInOnBar(NamedRow.burdette);
});

document.getElementById('btn-hagdyke').addEventListener('pointerdown', function (event) {
	homeInOnBar(NamedRow.hagdyke);
});

document.getElementById('btn-kings').addEventListener('pointerdown', function (event) {
	homeInOnBar(NamedRow.kings);
});

document.getElementById('btn-queens').addEventListener('pointerdown', function (event) {
	homeInOnBar(NamedRow.queens);
});

document.getElementById('btn-tittums').addEventListener('pointerdown', function (event) {
	homeInOnBar(NamedRow.tittums);
});

document.getElementById('btn-whittingtons').addEventListener('pointerdown', function (event) {
	homeInOnBar(NamedRow.whittingtons);
});

document.getElementById('num-bells').addEventListener('change', function (event) {
	const newNumberOfBells = parseInt(this.value);
	setNotes(trebleNote, newNumberOfBells)
	.then(function () {
		numberOfBells = newNumberOfBells;
		const firstBar = changeBarLength(getCurrentBar(), numberOfBells);
		const newRows = rowGenerator(firstBar);
		compositionFunction(newRows);
	});
});
