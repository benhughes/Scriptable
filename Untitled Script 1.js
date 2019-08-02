// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: yellow; icon-glyph: magic;
async function getData() {
  const input = new Alert()
  input.title = "Paste omnifocus data here"
  input.addTextField()
  input.addAction("Done")
  input.addAction("Another")
  const returned = await input.presentSheet()
  console.log(returned)
  return input.textFieldValue()
}



const clipboard = await getData()

console.log(clipboard.split(" -"))