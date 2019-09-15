// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: orange; icon-glyph: magic;
const {getProjectSettings, saveProjectSettings} = importModule(
  './ProjectSettings'
);

const projectSettings = await getProjectSettings();
console.log(projectSettings);
const PRIORITIES = [3, 2, 1];

let shouldContinue = true;
while (shouldContinue) {
  const chooseToEdit = new Alert();
  chooseToEdit.addCancelAction('All done');
  projectSettingsArray = Object.values(projectSettings).sort((a, b) => {
    if (a.priority === b.priority) {
      return a.name > b.name;
    } else if (a.priority === 0) {
      return -1;
    } else if (b.priority === 0) {
      return 1;
    }
    return a.priority < b.priority;
  });

  projectSettingsArray.forEach(list => {
    chooseToEdit.addAction(`${list.name}: ${list.priority}`);
  });

  const choosen = await chooseToEdit.present();
  if (choosen === -1) {
    shouldContinue = false;
    continue;
  }

  const choosenPriorityAlert = new Alert();
  choosenPriorityAlert.title = `Priority for project: ${projectSettingsArray[choosen].name}`;
  PRIORITIES.forEach(t => choosenPriorityAlert.addAction(String(t)));

  const choosenPriority = await choosenPriorityAlert.presentAlert();

  projectSettings[projectSettingsArray[choosen].name].priority =
    PRIORITIES[choosenPriority];
  console.log(projectSettings);
}

saveProjectSettings(projectSettings);
