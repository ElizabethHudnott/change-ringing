
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
 * @param {number} [numRows] How many rows of plain hunting to return or undefined to
 * produce a single complete cycle.
 * @param {boolean} [coverLeft] True if the bell which is initially in Position 0 covers,
 * false if the bell in last position covers, or undefined to decide automatically.
 * @param {number} [firstSwap] The position of the first swap, disregarding covering (0 or 1)
 * or undefined to decide automatically.
 */
function plainHunt(previousRow, numRows, coverLeft, firstSwap) {
	const numBells = previousRow.length;
	let firstSwapper = 0, lastSwapper = numBells - 1;
	if (numBells & 1) {
		if (coverLeft === undefined) {
			coverLeft = previousRow[0] > previousRow[numBells - 1];
		}
		if (coverLeft) {
			firstSwapper = 1;
		} else {
			lastSwapper--;
		}
	}
	if (firstSwap === undefined) {
		const indexOf1 = previousRow.indexOf(1);
		firstSwap = indexOf1 === firstSwapper || indexOf1 === lastSwapper ? 0 : 1;
	}
	if (numRows === undefined) {
		numRows = 2 * (lastSwapper - firstSwapper + 1);
	}

	const output = [];
	let row = previousRow;
	for (let i = 0; i < numRows; i++) {
		const nextRow = row.slice();
		for (let j = firstSwapper + firstSwap; j < lastSwapper - firstSwap; j += 2) {
			nextRow[j] = row[j + 1];
			nextRow[j + 1] = row[j];
		}
		output.push(nextRow);
		row = nextRow;
		firstSwap = 1 - firstSwap;
	}
	return output;
}

function plainBob(previousRow, numRows, coverLeft, firstSwap) {
	const numBells = previousRow.length;
	let firstSwapper = 0, lastSwapper = numBells - 1;
	if (numBells & 1) {
		if (coverLeft === undefined) {
			coverLeft = previousRow[0] > previousRow[numBells - 1];
		}
		if (coverLeft) {
			firstSwapper = 1;
		} else {
			lastSwapper--;
		}
	}
	if (firstSwap === undefined) {
		const indexOf1 = previousRow.indexOf(1);
		firstSwap = indexOf1 === firstSwapper || indexOf1 === lastSwapper ? 0 : 1;
	}
	if (numRows === undefined) {
		numRows = factorial(lastSwapper - firstSwapper + 1);
	}

	const output = [];
	let row = previousRow;
	for (let i = 0; i < numRows; i++) {
		const nextRow = row.slice();
		let lowerSwap, upperSwap;
		if (row[firstSwapper] === 1 && firstSwap === 1) {
			lowerSwap = firstSwapper + 2;
			upperSwap = lastSwapper - 1;
		} else {
			lowerSwap = firstSwapper + firstSwap;
			upperSwap = lastSwapper - firstSwap - 1;
		}
		for (let j = lowerSwap; j <= upperSwap; j += 2) {
			nextRow[j] = row[j + 1];
			nextRow[j + 1] = row[j];
		}
		output.push(nextRow);
		row = nextRow;
		firstSwap = 1 - firstSwap;
	}
	return output;
}
