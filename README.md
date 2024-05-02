# Demystifying the Churchyard
**Digital sensory exploration**
Jason's photo prompted memories of my village church growing up, at home hearing the bells ringing out across the allotment and seeing the shapes of the gravestones and the Celtic weaving patterns in the same village churchyard. Early on in the project I stumbled across an online lecture called *The Mathematics of Bell Ringing*. These technicalities weren't something I was previously familiar with but are the kind of geeky combination of music, physics and maths that excites me. This solidified my choice of photograph and inspired my creativity and desire to delve further. Coding lets me think about both the specific and the general aspects, for example contemplating making visualizations of other forms of music.

## Aperture into the Code
```javascript
function scheduleNotes() {
	let row = rows[currentRowNumber];
	let numNotesInRow = row.length;
	const currentTime = context.currentTime;
	let nextNoteTime = Math.max(lastScheduled + noteLength, currentTime + 255 / context.sampleRate);
	const maxSchedule = currentTime + LOOKAHEAD_TIME;
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
			if (onrow) {
				onrow(row, nextNoteTime);
			}
		}
	}
	setTimeout(scheduleNotes, SCHEDULING_INTERVAL * 1000);
}
```
