const MAX_THREADS = 19;

let colors = [
	[0, 100, 50, 1],
	[120, 100, 50, 1],
	[240, 100, 50, 1],
	[60, 100, 50, 1],
	[180, 100, 50, 1],
	[300, 100, 50, 1],
	[30, 100, 50, 1],
	[150, 100, 50, 1],
	[270, 100, 50, 1],
	[90, 100, 50, 1],
	[210, 100, 50, 1],
	[330, 100, 50, 1],
	[45, 100, 50, 1],
	[165, 100, 50, 1],
	[285, 100, 50, 1],
	[15, 100, 50, 1],
	[105, 100, 50, 1],
	[225, 100, 50, 1],
	[345, 100, 50, 1],
];

class Thread {

	constructor(bellNumber, initialRowNum) {
		this.bellNumber = bellNumber;
		this.positions = [];
		// Whether this thread appears in the last row that was processed.
		this.active = true;
		this.initialRowNum = initialRowNum;
		this.color = colors[bellNumber - 1];
		this.threadWidths = [0.5];
	}

	addRow(position, width) {
		this.positions.push(position);
		this.threadWidths.push(width);
	}

	get numberOfRows() {
		return this.positions.length;
	}

	trim(rowNum) {
		const numTrim = Math.max(rowNum - this.initialRowNum, 0);
		this.positions.splice(0, numTrim);
		this.threadWidths.splice(0, numTrim);
		this.initialRowNum = Math.max(this.initialRowNum - numTrim, 0);
	}

}

let threads = [];
let rowTimes = [];
let maxThreadWidth = 0.5;
let userZoom = 1;
let animationSpeed = 20;	// in pixels per second
let lastXOffset, lastDrawTime;

function addRow(row, time) {
	let numRows = rowTimes.length;
	rowTimes[numRows] = time;
	numRows++;

	const numThreads = threads.length;
	const activeThreadIndexes = [];
	const newThreads = [];
	const rowLength = row.length;
	const initialWidth = 0.5;

	for (let i = 0; i < rowLength; i++) {
		const bellNumber = row[i];
		if (bellNumber > numThreads) {
			// Brand new bell playing a fundamental frequency that hasn't been used yet.
			const thread = new Thread(bellNumber, numRows - 1);
			thread.addRow(i + 1, initialWidth);
			newThreads.push(thread);
		} else {
			// Try to find an existing bell with the required pitch if one exists.
			let found = false;
			let stillActive;
			for (let j = numThreads - 1; j >= 0; j--) {
				const thread = threads[j];

				if (thread.bellNumber === bellNumber) {
					found = true;
					stillActive = thread.active;
					if (stillActive) {
						thread.addRow(i + 1, initialWidth);
						activeThreadIndexes.push(j);
					}
					break;
				}
			}
			if (!found || !stillActive) {
				const thread = new Thread(bellNumber, numRows - 1);
				thread.addRow(i + 1, initialWidth);
				newThreads.push(thread);
			}
		}
	}
	for (let thread of threads) {
		thread.active = false;
	}
	for (let threadIndex of activeThreadIndexes) {
		threads[threadIndex].active = true;
	}
	threads = threads.concat(newThreads);
}

function hslaToString(color) {
	return `hsla(${color[0]}, ${color[1]}%, ${color[2]}%, ${color[3]})`;
}

function draw(context, time) {
	const canvas = context.canvas;
	const canvasWidth = canvas.width;
	const canvasHeight = canvas.height;
	const numTimes = rowTimes.length;

	let nextNextTime, nextTime;
	let rowNum = numTimes - 1;
	let rowTime = rowTimes[rowNum];
	while (rowNum >= 0 && rowTime > time) {
		nextNextTime = nextTime;
		nextTime = rowTime;
		rowNum--;
		rowTime = rowTimes[rowNum];
	}
	const lastRowNum = rowNum;

	const maxWidth = MAX_THREADS + maxThreadWidth;
	const activeThreads = new Set();
	let maxColumn = 1;
	let minColumn = 88;
	let numColumns;
	let pixelsPerSecond = 0;
	while (rowNum >= 0 && canvasHeight > Math.round((time - rowTime) * pixelsPerSecond)) {
		for (let thread of threads) {
			const initialRowNum = thread.initialRowNum;
			const lastRowNum =  initialRowNum + thread.numberOfRows - 1;
			if (initialRowNum <= rowNum && lastRowNum >= rowNum) {
				const column = thread.positions[rowNum - initialRowNum];
				minColumn = Math.min(minColumn, column);
				maxColumn = Math.max(maxColumn, column);
				activeThreads.add(thread);
			}
		}
		numColumns = maxColumn - minColumn + 1;
		pixelsPerSecond = animationSpeed * maxWidth / (numColumns - 1 + maxThreadWidth);
		rowNum--;
		rowTime = rowTimes[rowNum];
	}

	context.clearRect(0, 0, canvasWidth, canvasHeight);
	if (maxColumn < minColumn) {
		return;
	}
	const firstRowNum = Math.max(rowNum, 0);
	const firstRowTime = rowTimes[firstRowNum];

	const zoomX = canvasWidth / (numColumns - 1 + maxThreadWidth);
	const offsetX = 0.5 * maxThreadWidth - minColumn;
	const height = Math.round((time - firstRowTime) * pixelsPerSecond);
	const offsetY = Math.min(height - canvasHeight, 0);

	for (let thread of activeThreads) {
		const threadFirstRowNum = thread.initialRowNum;
		const threadLastRowNum = Math.min(threadFirstRowNum + thread.numberOfRows - 1, lastRowNum);
		rowNum = Math.max(firstRowNum, threadFirstRowNum);
		rowTime = rowTimes[rowNum];
		let positionX = (thread.positions[rowNum - threadFirstRowNum] + offsetX) * zoomX;
		let positionY = canvasHeight - (time - rowTime) * pixelsPerSecond + offsetY;
		context.beginPath();
		context.moveTo(positionX, positionY);
		context.lineWidth = Math.min(thread.threadWidths[0] * userZoom, 1) * zoomX;
		context.strokeStyle = hslaToString(thread.color);
		while (rowNum <= threadLastRowNum) {
			rowNum++;
			rowTime = rowTimes[rowNum];
			positionX = (thread.positions[rowNum - threadFirstRowNum] + offsetX) * zoomX;
			positionY = canvasHeight - (time - rowTime) * pixelsPerSecond + offsetY;
			context.lineTo(positionX, positionY);
		}
		context.stroke();
	}

	let rowNumToKeep = firstRowNum;
	// 8 pixels per second is minimum animation speed to retain fluid motion.
	while (rowNumToKeep > 0 && screen.height > Math.round((time - rowTimes[rowNumToKeep]) * 8)) {
		rowNumToKeep--;
	}
	for (let thread of threads) {
		thread.trim(rowNumToKeep);
	}
	rowTimes.splice(0, rowNumToKeep);
}

function setZoom(amount) {
	userZoom = amount;
}

export {
	addRow as addWeavingRow,
	draw as drawWeave,
	setZoom,
}
