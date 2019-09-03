// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-purple; icon-glyph: magic;

const fm = FileManager.iCloud();

const BURN_LIST_PROJECT_PATH = `${fm.documentsDirectory()}/BurnListData/projects.json`;
const FRONT_BURNER_PROJECT_KEY = 'frontBurnerProjectName';
const BACK_BURNER_PROJECT_KEY = 'backBurnerProjectName';

const loadHighlightedProjects = () => {
  const projectString = fm.readString(BURN_LIST_PROJECT_PATH);
  return JSON.parse(projectString);
};

const saveHighlightedProjects = newJSON => {
  fm.writeString(BURN_LIST_PROJECT_PATH, JSON.stringify(newJSON, null, 2));
};

module.exports = {
  loadHighlightedProjects,
  saveHighlightedProjects,
  FRONT_BURNER_PROJECT_KEY,
  BACK_BURNER_PROJECT_KEY,
};
