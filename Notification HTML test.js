// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: red; icon-glyph: magic;
const showdown = importModule('./showdown');

const context = {
  id: 'work',
  displayName: 'Work',
  tag: '#work',
  highlightBookmark: 'punchlist-highlight',
  fileBookmark: 'punchlist-work',
};

const reminders = await Reminder.allIncomplete();

const text = `
### Upcoming 

|||
|:---|:-----|
|12:00-13:00| Such and such (MR7)|
|12:00-13:00| Such and such (MR7)|

---

### Timer

12:15: Fix thingy issue (Personal Admin) [Stop](scripatable://)

---

###  Front Burner

- Break tasks into physical actions
- Every to should start with a verb....
	- can I force that????
- probably need to find a way to easily convert a task into a project... or at least fake some sub tasks
- [ ] this is a test
`;

const converter = new showdown.Converter({
  tables: true,
  tasklists: true,
  strikethrough: true,
});
const html = converter.makeHtml(text); //generatePunchlistMarkdown(context, reminders));

const darkMode = false;
const fm = FileManager.iCloud();
const css = fm.readString(
  `${fm.documentsDirectory()}/${
    darkMode ? 'bulmaswatch.min.txt' : 'bulma.min.css'
  }`
);
console.log(css);

const htmlOutput = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Hello Bulma!</title>
    <style>${css}</style>
  </head>
  <body>
  <section class="section">
    <div class="container">
      <div class="content">${html}</div>
     </div>
  </section>
  </body>
</html>
`;

const cssWithHtml = `<style>${css}</style>`;

// QuickLook.present(html)

const view = new WebView();
view.loadHTML(htmlOutput);
view.present();
