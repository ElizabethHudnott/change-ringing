import {NamedRow, Method, Cover} from './methods.js';
import {setNotes, getAudioContext, setBarCallback, getCurrentBar, repeatBar, setMusic} from './audio.js';
import {addWeavingRow, drawWeave} from './graphics.js';
window.addWeavingRow = addWeavingRow;
window.drawWeave = drawWeave;

const audioContext = getAudioContext();
const canvas = document.getElementById('canvas');
const context2d =  canvas.getContext('2d');

function resize() {
	canvas.width = canvas.clientWidth;
	canvas.height = canvas.clientHeight;
}

resize();
window.addEventListener('resize', resize);

let numberOfBells = 9;
let cover = Cover.EITHER;
setNotes(70, numberOfBells);
let animationID;

setBarCallback(function (row, startTime) {
	addWeavingRow(row, startTime);
});


function animate() {
	drawWeave(context2d, audioContext.currentTime);
	animationID = requestAnimationFrame(animate);
}

animationID = requestAnimationFrame(animate);

document.getElementById('btn-start').addEventListener('click', function (event) {
	audioContext.resume();
	repeatBar(NamedRow.rounds(numberOfBells));
});

document.getElementById('btn-hunt').addEventListener('pointerdown', function (event) {
	const newRows = Method.plainHunt(getCurrentBar(), undefined, cover);
	setMusic(newRows);
});

document.getElementById('btn-plain-bob').addEventListener('pointerdown', function (event) {
	const newRows = Method.plainBob(getCurrentBar(), undefined, cover);
	setMusic(newRows);
});

document.getElementById('btn-grandsire').addEventListener('pointerdown', function (event) {
	const newRows = Method.grandsire(getCurrentBar(), undefined, cover);
	setMusic(newRows);
});
