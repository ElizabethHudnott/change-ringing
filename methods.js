const Cover = Object.freeze({
	NONE:		0,
	LEFT:		1,
	RIGHT:	2,
	EITHER:	3,
});

function factorial(n) {
	let result = 1;
	while (n > 1) {
		result *= n;
	}
	return result;
}

function maxOddEven(n) {
	return (n & 1) ? [n, n - 1] : [n - 1, n];
}

const NamedRow = {

	rounds: function (n) {
		const row = new Array(n);
		for (let i = 1; i <= n; i++) {
			row[i - 1] = i;
		}
		return row;
	},

	backRounds: function (n) {
		const row = new Array(n);
		for (let i = 0; i < n - 1; i++) {
			row[i] = n - 1 - i;
		}
		row[n - 1] = n;
		return row;
	},

	burdette: function (n) {
		const row = [];
		const repetititions = Math.trunc(n / 3);
		let pattern;
		if (n % 3 === 0) {
			pattern = [1, -1, 0];
		} else {
			pattern = [1, 1, -2];
			let patternLength = 3;
			while (n % patternLength !== 0 && patternLength < n) {
				pattern.push(0);
				patternLength++;
			}
		}
		for (let i = 1; i <= n; i++) {
			row[i - 1 + pattern[(i - 1) % pattern.length]] = i;
		}
		return row;
	},

	hagdyke: function (n) {
		let prefixLength = 0, row = [];
		if (n % 4 === 0) {
			row = [1, 2];
			prefixLength = 2;
		}
		const pattern = [2, 2, -2, -2];
		for (let i = prefixLength + 1; i <= n - 2; i++) {
			row[i - 1 + pattern[(i - prefixLength - 1) % 4]] = i;
		}
		row[n - 2] = n - 1;
		row[n - 1] = n;
		return row;
	},

	kings: function (n) {
		const row = [];
		const maxEven = (n & 1) ? n - 1 : n;
		for (let i = maxEven - 1; i >= 1; i -= 2) {
			row.push(i);
		}
		for (let i = 2; i <= maxEven; i += 2) {
			row.push(i);
		}
		if (n & 1) {
			row[n - 1] = n;
		}
		return row;
	},

	queens: function (n) {
		const row = [];
		for (let i = 1 + (n & 1); i <= n - 1; i += 2) {
			row.push(i);
		}
		for (let i = 2 - (n & 1); i <= n; i += 2) {
			row.push(i);
		}
		return row;
	},

	tittums: function (n) {
		const row = [];
		let a = 1, b = Math.ceil(0.5 * n) + 1;
		for (let i = 0; i + 2 <= n; i += 2) {
			row.push(a, b);
			a++;
			b++;
		}
		if (n & 1) {
			row.unshift(a);
		}
		return row;
	},

	whittingtons: function whittingtons(n) {
		if (n >= 12) {
			return [5, 3, 1, 2, 4, 6].concat(whittingtons(n - 6).map(x => x + 6));
		}

		const [maxOdd, maxEven] = maxOddEven(n);
		const prefixLength = maxEven - 6;
		const row = [];
		for (let i = 1; i <= prefixLength; i++) {
			row.push(i);
		}
		for (let i = maxOdd; i > prefixLength - 1; i -= 2) {
			row.push(i);
		}
		for (let i = prefixLength + 2; i <= maxEven; i += 2) {
			row.push(i);
		}
		return row;
	},

};

function homing(previousRow, targetRow) {
	const prevNumBells = previousRow.length;
	const targetNumBells = targetRow.length;

	const output = [];
	let row = previousRow;

	const toAdd = targetRow.slice();					// List of values
	const toRemove = new Array(prevNumBells);		// List of true/false
	let numToRemove = 0;
	for (let i = 0; i < prevNumBells; i++) {
		const bellNumber = row[i];
		const index = toAdd.indexOf(bellNumber);
		if (index === -1) {
			toRemove[i] = true;
			numToRemove++;
		} else {
			toRemove[i] = false;
			toAdd.splice(index, 1);
		}
	}
	const common = targetRow.slice();
	for (let addedValue of toAdd) {
		common.splice(common.indexOf(addedValue), 1);
	}

	const sortNumBells = prevNumBells - Math.max(numToRemove - toAdd.length, 0);
	let sortedUpTo = -1;
	while (sortedUpTo < sortNumBells - 1) {
		while (sortedUpTo < sortNumBells - 1 && row[sortedUpTo + 1] === common[sortedUpTo + 1]) {
			sortedUpTo++;
		}
		const index = Math.trunc(Math.random() * (sortNumBells - sortedUpTo - 2)) + sortedUpTo + 1;
		row = row.slice();
		let removed = false;
		if (toRemove[index]) {
			row.splice(index, 1);
			toRemove.splice(index, 1);
			removed = true;
		} else if (toRemove[index + 1]) {
			row.splice(index + 1, 1);
			toRemove.splice(index + 1, 1);
			removed = true;
		} else {
			const value1 = row[index];
			const value2 = row[index + 1];
			if (common.indexOf(value1, sortedUpTo + 1) > common.indexOf(value2, sortedUpTo + 1)) {
				row[index] = value2;
				row[index + 1] = value1;
				output.push(row);
			}
		}
		if (removed) {
			if (toAdd.length > 0) {
				const valueToAdd = toAdd.shift();
				let insertIndex = sortedUpTo + 1;
				let insertIndex2 = insertIndex;
				const targetIndex = targetRow.indexOf(valueToAdd, insertIndex);
				while (
					insertIndex < row.length &&
					(
						toRemove[insertIndex] ||
						targetRow.indexOf(row[insertIndex], insertIndex2) < targetIndex
					)
				) {
					if (!toRemove[insertIndex]) {
						insertIndex2++;
					}
					insertIndex++;
				}
				row.splice(insertIndex, 0, valueToAdd);
				common.splice(insertIndex2, 0, valueToAdd);
				toRemove.splice(insertIndex, 0, false);
			}
			output.push(row);
		}
	}
	for (let addedValue of toAdd) {
		row = row.slice();
		const index = targetRow.indexOf(addedValue);
		row.splice(index, 0, addedValue);
		output.push(row);
	}
	if (output.length === 0) {
		output.push(targetRow.slice());
	}
	return output;
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
	const minBell = Math.min(...previousRow);
	let firstSwapper = 0, lastSwapper = numBells - 1;
	let numWeaving = numBells;
	if (cover !== Cover.NONE) {
		if (cover === Cover.EITHER) {
			cover = previousRow[0] > previousRow[numBells - 1] ? Cover.LEFT : Cover.RIGHT;
		}
		if (cover === Cover.LEFT) {
			firstSwapper = 1;
		} else {
			lastSwapper--;
		}
		numWeaving--;
	}
	if (firstSwap === undefined) {
		firstSwap = previousRow[firstSwapper] === minBell ? 0 : 1;
	}
	if (numRows === undefined) {
		numRows = 2 * numWeaving;
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
	const minBell = Math.min(...previousRow);
	let firstSwapper = 0, lastSwapper = numBells - 1;
	let numWeaving = numBells;
	if (cover !== Cover.NONE) {
		if (cover === Cover.EITHER) {
			cover = previousRow[0] > previousRow[numBells - 1] ? Cover.LEFT : Cover.RIGHT;
		}
		if (cover === Cover.LEFT) {
			firstSwapper = 1;
		} else {
			lastSwapper--;
		}
		numWeaving--;
	}
	if (firstSwap === undefined) {
		firstSwap = previousRow[firstSwapper] === minBell ? 0 : 1;
	}
	if (numRows === undefined) {
		numRows = 2 * numWeaving * (numWeaving - 1);
	}

	const output = [];
	let row = previousRow;
	for (let i = 0; i < numRows; i++) {
		const nextRow = row.slice();
		let lowerSwap;
		if (row[firstSwapper] === minBell && firstSwap === 1) {
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
	const minBell = Math.min(...previousRow);
	let firstSwapper = 0, lastSwapper = numBells - 1;
	let numWeaving = numBells;
	if (cover !== Cover.NONE && numBells > 3) {
		if (cover === Cover.EITHER) {
			cover = previousRow[0] > previousRow[numBells - 1] ? Cover.LEFT : Cover.RIGHT;
		}
		if (cover === Cover.LEFT) {
			firstSwapper = 1;
		} else {
			lastSwapper--;
		}
		numWeaving--;
	}
	if (firstSwap === undefined) {
		firstSwap = previousRow[firstSwapper] === minBell ? 0 : 1;
	}
	if (numRows === undefined) {
		if (numWeaving === 3) {
			numRows = 12;
		} else {
			numRows = 2 * numWeaving * (numWeaving - 2);
		}
	}

	const output = [];
	let row = previousRow;
	for (let i = 0; i < numRows; i++) {
		const nextRow = row.slice();
		let lowerSwap;
		if (row[firstSwapper] === minBell) {
			if (firstSwap === 0) {
				nextRow[firstSwapper] = row[firstSwapper + 1];
				nextRow[firstSwapper + 1] = row[firstSwapper];
				lowerSwap = firstSwapper + 3;
			} else if (numWeaving === 3) {
				lowerSwap = firstSwapper + 3;
			}
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

const Method = {
	plainHunt: plainHunt,
	plainBob: plainBob,
	grandsire: grandsire,
}

export {
	NamedRow,
	Cover,
	Method,
	homing,
}
