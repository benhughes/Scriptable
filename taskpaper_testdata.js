// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: light-gray; icon-glyph: magic;
const TEST_DATA = `- Contact Virgin Trains  
	https://www.virgintrains.co.uk/help-and-contact/lost-property

  @parallel(true) @autodone(false) @context(work) @tags(work, now, shortcut) @due(2019-05-07 19:00)
	https://www.virgintrains.co.uk/help-and-contact/lost-property

- wash ipad screen  @parallel(true) @autodone(false) @context(routine) @tags(routine, work, shortcut) @due(2019-05-13 11:00) @defer(2019-05-13 00:00) @repeat-method(due-after-completion) @repeat-rule(FREQ=WEEKLY;BYDAY=MO,WE,FR)
- create ticket for new postings. See notes from 10-05 @parallel(true) @autodone(false) @context(work) @tags(work, shortcut) @due(2019-05-14 19:00)
	calshow:591966000

- Water plants @parallel(true) @autodone(false) @context(routine) @tags(routine, work) @due(2019-05-15 19:00) @defer(2019-05-15 00:00) @repeat-method(due-after-completion) @repeat-rule(FREQ=WEEKLY;BYDAY=WE)
- Book Friday Barre @parallel(true) @autodone(false) @context(routine) @tags(routine, work) @due(2019-05-17 19:00) @defer(2019-05-17 00:00) @repeat-method(due-after-completion) @repeat-rule(FREQ=WEEKLY;BYDAY=FR)
- Book Football @parallel(true) @autodone(false) @context(routine) @tags(routine, work) @due(2019-05-17 19:00) @defer(2019-05-17 00:00) @repeat-method(due-after-completion) @repeat-rule(FREQ=WEEKLY;BYDAY=FR)
	https://better.legendonlineservices.co.uk/Finsbury_LC/account/login

- Buy work snacks @parallel(true) @autodone(false) @context(routine) @tags(routine, work, lunch, morning, now) @due(2019-05-20 09:00) @defer(2019-05-20 00:00) @repeat-method(due-after-completion) @repeat-rule(FREQ=WEEKLY;BYDAY=MO)
- Review FPR daily @parallel(true) @autodone(false) @context(work) @tags(work, now) @due(2019-05-20 19:00) @repeat-method(due-after-completion) @repeat-rule(FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR)
- dudders feedback @parallel(true) @autodone(false) @context(work) @tags(work, shortcut) @due(2019-05-20 19:00)
- Talk to Eileen @parallel(true) @autodone(false) @context(work) @tags(work, now, shortcut) @due(2019-05-20 19:00)
- email feedback requests @parallel(true) @autodone(false) @context(work) @tags(work, shortcut) @due(2019-05-20 19:00)
- when does klaus contract end? @parallel(true) @autodone(false) @context(work) @tags(work, shortcut) @due(2019-05-20 19:00)
- One one with Sam @parallel(true) @autodone(false) @context(work) @tags(work, shortcut) @due(2019-05-20 19:00)
- One on one with Anne  @parallel(true) @autodone(false) @context(work) @tags(work, shortcut) @due(2019-05-20 19:00)
- Chat with Ewan about progs and make sure he's ok  
 @parallel(true) @autodone(false) @context(work) @tags(work, shortcut) @due(2019-05-20 19:00)
- exit criteria for docs @parallel(true) @autodone(false) @context(work) @tags(work, now) @due(2019-05-20 19:00)
- Andy Progs - Get Buddy feedback @parallel(true) @autodone(false) @context(work) @tags(work, now) @due(2019-05-20 19:00)
- Adam Progs - Get Buddy nominations @parallel(true) @autodone(false) @context(work) @tags(work, now) @due(2019-05-20 19:00)
- Hamish Progs - Get Buddy feedback @parallel(true) @autodone(false) @context(work) @tags(work, now) @due(2019-05-20 19:00)
- Ewan Progs - Get Buddy nominations @parallel(true) @autodone(false) @context(work) @tags(work, now) @due(2019-05-20 19:00)
- Reschedule notes @parallel(true) @autodone(false) @context(work) @tags(work, now, shortcut)
`

module.exports = TEST_DATA;
