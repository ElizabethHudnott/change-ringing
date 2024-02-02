const Cover = Object.freeze({
	NONE:		0,
	LEFT:		1,
	RIGHT:	2,
	EITHER:	3,
});

// Maps time to pitch (descending from 1).
let rows = [round(4)];

function factorial(n) {
	let result = 1;
	while (n > 1) {
		result *= n;
	}
	return result;
}

function round(n) {
	const row = new Array(n);
	for (let i = 1; i <= n; i++) {
		row[i - 1] = i;
	}
	return row;
}

/**
 * Requires at least 3 bells.
 * @param {number} [numRows] How many rows of plain hunting to return or undefined to
 * produce a single complete cycle.
 * @param {number} [firstSwap] The position of the first swap, disregarding covering (0 or 1)
 * or undefined to decide automatically.
 */
function plainHunt(previousRow, numRows, cover = Cover.NONE, firstSwap = undefined) {
	const numBells = previousRow.length;
	let firstSwapper = 0, lastSwapper = numBells - 1;
	let numBobbing = numBells;
	if (cover !== Cover.NONE) {
		if (cover === Cover.EITHER) {
			cover = previousRow[0] > previousRow[numBells - 1] ? Cover.LEFT : Cover.RIGHT;
		}
		if (cover === Cover.LEFT) {
			firstSwapper = 1;
		} else {
			lastSwapper--;
		}
		numBobbing--;
	}
	if (firstSwap === undefined) {
		const indexOf1 = previousRow.indexOf(1);
		firstSwap = indexOf1 === firstSwapper || indexOf1 === lastSwapper ? 0 : 1;
	}
	if (numRows === undefined) {
		numRows = 2 * numBobbing;
	}

	const output = [];
	let row = previousRow;
	for (let i = 0; i < numRows; i++) {
		const nextRow = row.slice();
		for (let j = firstSwapper + firstSwap; j + 1 <= lastSwapper; j += 2) {
			nextRow[j] = row[j + 1];
			nextRow[j + 1] = row[j];
		}
		output.push(nextRow);
		row = nextRow;
		firstSwap = 1 - firstSwap;
	}
	return output;
}

/**
 * Requires at least 4 bells.
 */
function plainBob(previousRow, numRows, cover = Cover.NONE, firstSwap = undefined) {
	const numBells = previousRow.length;
	let firstSwapper = 0, lastSwapper = numBells - 1;
	let numBobbing = numBells;
	if (cover !== Cover.NONE) {
		if (cover === Cover.EITHER) {
			cover = previousRow[0] > previousRow[numBells - 1] ? Cover.LEFT : Cover.RIGHT;
		}
		if (cover === Cover.LEFT) {
			firstSwapper = 1;
		} else {
			lastSwapper--;
		}
		numBobbing--;
	}
	if (firstSwap === undefined) {
		const indexOf1 = previousRow.indexOf(1);
		firstSwap = indexOf1 === firstSwapper || indexOf1 === lastSwapper ? 0 : 1;
	}
	if (numRows === undefined) {
		numRows = 2 * numBobbing * (numBobbing - 1);
	}

	const output = [];
	let row = previousRow;
	for (let i = 0; i < numRows; i++) {
		const nextRow = row.slice();
		let lowerSwap;
		if (row[firstSwapper] === 1 && firstSwap === 1) {
			lowerSwap = firstSwapper + 2;
		} else {
			lowerSwap = firstSwapper + firstSwap;
		}
		for (let j = lowerSwap; j + 1 <= lastSwapper; j += 2) {
			nextRow[j] = row[j + 1];
			nextRow[j + 1] = row[j];
		}
		output.push(nextRow);
		row = nextRow;
		firstSwap = 1 - firstSwap;
	}
	return output;
}

/**
 * Requires at least 4 bells.
 */
function grandsire(previousRow, numRows, cover = Cover.NONE, firstSwap = undefined) {
	const numBells = previousRow.length;
	let firstSwapper = 0, lastSwapper = numBells - 1;
	let numBobbing = numBells;
	if (cover !== Cover.NONE) {
		if (cover === Cover.EITHER) {
			cover = previousRow[0] > previousRow[numBells - 1] ? Cover.LEFT : Cover.RIGHT;
		}
		if (cover === Cover.LEFT) {
			firstSwapper = 1;
		} else {
			lastSwapper--;
		}
		numBobbing--;
	}
	if (firstSwap === undefined) {
		const indexOf1 = previousRow.indexOf(1);
		firstSwap = indexOf1 === firstSwapper || indexOf1 === lastSwapper ? 0 : 1;
	}
	if (numRows === undefined) {
		numRows = 2 * numBobbing * (numBobbing - 2);
	}

	const output = [];
	let row = previousRow;
	for (let i = 0; i < numRows; i++) {
		const nextRow = row.slice();
		let lowerSwap;
		if (row[firstSwapper] === 1 && firstSwap === 0) {
			nextRow[firstSwapper] = row[firstSwapper + 1];
			nextRow[firstSwapper + 1] = row[firstSwapper];
			lowerSwap = firstSwapper + 3;
		} else {
			lowerSwap = firstSwapper + firstSwap;
		}
		for (let j = lowerSwap; j + 1 <= lastSwapper; j += 2) {
			nextRow[j] = row[j + 1];
			nextRow[j + 1] = row[j];
		}
		output.push(nextRow);
		row = nextRow;
		firstSwap = 1 - firstSwap;
	}
	return output;
}
