// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: teal; icon-glyph: bell;
// Shows reminders that are due for today in a structured table. When triggered in Siri using a Siri Shortcut, Siri will read out loud the number of incomplete reminders for today.
let reminders = await Reminder.allIncomplete();
if (reminders.length == 0) {
  // There are no reminders
  let siri = 'There are no reminders due today.';
  if (config.runsWithSiri) {
    Speech.speak(siri);
  } else {
    QuickLook.present(siri);
  }
} else {
  // Present reminders in table
  let table = new UITable();
  for (reminder of reminders) {
    let row = new UITableRow();
    let emojiCell = row.addText(emoji(reminder));
    let titleCell = row.addText(reminder.title);
    emojiCell.widthWeight = 10;
    titleCell.widthWeight = 90;
    table.addRow(row);
  }
  QuickLook.present(table);
  // Read number of reminders left
  if (config.runsWithSiri) {
    let incomplete = reminders.filter(reminder => {
      return reminder.isCompleted == false;
    });
    let count = incomplete.length;
    let siri;
    if (count == 0) {
      siri = 'You have completed all reminders. good job!';
    } else {
      siri = 'You have ' + count + ' reminders left for today.';
    }
    Speech.speak(siri);
  }
}

function emoji(reminder) {
  let isOverdue = reminder.dueDate < new Date();
  if (reminder.isCompleted) {
    return '✅';
  } else if (isOverdue) {
    return '⚠️';
  } else {
    return '';
  }
}
