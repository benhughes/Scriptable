// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: purple; icon-glyph: magic;
const writeGood = importModule('./libs/write-good').default;

const paste = Pasteboard.paste();
const feedbackResults = writeGood(paste);

const resultsToDisplay = [];

feedbackResults.forEach(feedback => {
  const {index, offset, reason} = feedback;
  const text = [...paste];
  text.splice(index, 0, '^');
  text.splice(index + offset + 1, 0, '^');
  const highlightedText = text
    .join('')
    .slice(Math.max(index - 50, 0), index + offset + 50);

  console.log(feedback);
  const resultText = `
-------------------------------------
${highlightedText}
-------------------------------------
${reason}
  
`;
  resultsToDisplay.push(resultText);
});

const display = `${paste}

${resultsToDisplay.join('')}
`;
QuickLook.present(display);
