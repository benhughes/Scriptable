// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: green; icon-glyph: magic;
const fm = FileManager.iCloud();
const PROJECT_SETTINGS_PATH = `${fm.documentsDirectory()}/projects-data/project-settings.json`;
const PROJECT_DEFAULT = {
  name: 'missing',
  priority: 0,
};

async function getProjectSettings() {
  const lists = await Calendar.forReminders();
  fm.downloadFileFromiCloud(PROJECT_SETTINGS_PATH);
  const projectSettingsString = fm.readString(PROJECT_SETTINGS_PATH) || '{}';
  const projectSettings = JSON.parse(projectSettingsString);

  return lists.reduce(
    (returnedProjectSettings, {title}) => ({
      ...returnedProjectSettings,
      [title]: projectSettings[title]
        ? {
            ...PROJECT_DEFAULT,
            ...projectSettings[title],
          }
        : {
            ...PROJECT_DEFAULT,
            name: title,
          },
    }),
    {}
  );
}

function saveProjectSettings(newJSON) {
  fm.writeString(PROJECT_SETTINGS_PATH, JSON.stringify(newJSON, null, 2));
}

module.exports = {
  getProjectSettings,
  saveProjectSettings,
};
