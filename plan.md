* Register / login system
* Email verifcation
* Log body weight, exercise weight/reps, calories
* Pick various exercises to track
* Select certain things to show on graph
* You can scroll or select different graphs to show different categories
so it's not all just on one graph, in case you want to see different things
    - like body weight and calories only as a "nutrition" graph
    - or a "legs" graph that shows specifically leg exercise progress
* gotta come up with some strength score function
* Setup stripe for some kind of premium version and to have a payment option
    - premium can be the thing to save workout templates. Otherwise you have to 
    add them manually each day or something. IDK I kind of want to make this
    actually easy to use though, so maybe i'll just have a donation type thing.
* Do I need to ask to accept cookies?

# Pages:
1. Login/Register
    - email/password, email verification
    - first thing you see when you go to page (unless you're already logged in)
2. Dashboard Page
    - Profile button to let you log out or whatever
    - Navbar at top
    - Main Graph system
    - Current stats (body weight, strength)
    - Goal progress bars
    - Some button to indicate input daily logs
    - A setting below graph to change timeline scale
    - a dropdown menu above graph title to change graph contents or category
    - A recently logged section showing recent activity feed

---------------------------------------------------------
|   Quick Stats                                          |
|  [ Current Weight ]  [ Avg Calories ]  [ Strength PR ] |
---------------------------------------------------------

---------------------------------------------------------
|                   Bodyweight Trend                    |
|   [ Line Chart over time + dropdown for 7d/30d/90d ]   |
---------------------------------------------------------

---------------------------------------------------------
|        Goals (if any)        |     Exercise Progress   |
|  [ Progress bars OR link ]   |  [ Carousel of charts   |
|                              |    Bench | Squat | ... ]|
---------------------------------------------------------

---------------------------------------------------------
| Calories vs Bodyweight       | Bodyweight vs Strength  |
|  [ Dual-axis line chart ]    | [ Scatter / biaxial ]  |
|                              |   (Exercise selector)   |
---------------------------------------------------------

---------------------------------------------------------
|            (Optional) Custom Comparisons              |
|  [ User picks any 2 metrics → generates chart ]        |
---------------------------------------------------------

Maybe make the bodyweight/cal and bodyweight/exercise charts on the same row (for desktop)
and stacked on mobile or smaller screens. The graphs look weird being really long.

New idea:
Instead of a lot of blank space, make everything scale larger and take up most of the screen.
Row 1:
    On top left have a big box saying welcome back [user name] wave emoji and three subboxes
    for the quick stats with emoji type images for the stat.
    To the right we have the goals section with a few progress bars (weight, estimated 1rm)
        progress (how much weight we've gone up / down)
        target (goal weight)
        daily calorie goal how much you ate
        a set fitness goals button
Row 2:
The bodyweight/exercise trend graph. on the left.
On the right have some AI generated response that analyzes your chart and tells you
if you're on the right track. Like are you gaining strength at a good rate, gaining too much
weight too fast? Not gaining enough weight? Etc. This is a good way to integrate AI.
50/50 each side.
Row 3:
A bar chart showing most frequent exercises or daily calories over the past week.
A carousel for exercises were it shows a table of your recent logs. Like date, weight, reps.

Mobile:
* At the top, not in a box, have the welcome user "wave"
* Below that we have a 2x2 grid with 4 boxes:
    1. Current weight: (most recent log weight, or N/A and tells you to log)
    2. Calories: (today's calories, no progress bar just a number and a icon or something)
    3. weekly avg weight (or null and say not enough info if haven't logged)
    4. protein: (daily protein, so we can have ai analyze if you're eating enough protein)
* Goals:
    1. bodyweight goal with progress (how much left to go/how much you've gained/loss)
    2. daily cal goal (circular progress bar or some other bar)
    3. Exercise goal (bench 225 x 1, your closest was x, using an estimated 1rm); will need a way to add exercises 
        without having to go to log.
    Some button right below this section to go to a goals page to add goals. "Add goals"
    Each goal can be its own larger box. takes up whole screen width, as opposed to the 2x2 grid section
* Bodyweight/exercise trend graph
* AI analyzer
* Don't think we need anything else that's the main thing. But optionally, at the end of everything can add
    -a carousel for exercises showing a table of recent logs.
    - a bar chart showing daily calories over a week or something

Desktop:
* At the top center: Welcome user *wave*
# Row1:
* 4 boxes in a row for quick stats instead of a grid in mobile
* Goal section
# Row2:
* Bodyweight/exercise trend graph
* AI analyzer
# Row3: optional
* exercise carousel
* weekly calorie bar chart

make desktop less width if looks too sparse with this stuff



3. Log
    - can delete or edit previously logged data
    - Calendar date picker at the top. default to today
    - Bodyweight and cals log. kg/lbs selector and converter depending on selection.
    - Have a + sign to add workout / exercises. Since not everyday needs to have it.
    - Once you start adding workout, you can choose to add from a dropdown of saved exercises
        by default you don't have any exercises so you have to click an add new exercise butotn to
        add them to create a a list.
        Maybe we can do something where you can save a workout template to easily add this
    - Once an exercise is selected or added have an input for weight and reps
        - optional notes input: like "felt strong. almost got 9th rep"
    - Can keep adding multiple exercises. So we can have a + button at first, to show no
    exercises, then as you click it and add more exercises the + moves down and
    you form a list of exercises.
    - Show existing logs that can be edited
    - Only need one entry per exercise since the point should be to track your
    top set to track strength progress.
    - Save Log button at bottom. Edit button next to each field.
    - Store exercise lists in a user-specific table to persist in future dropdown selections.

+----------------------------------------------------+
| [←] Date: Today  [Calendar Icon]                  |  <- Date Picker
+----------------------------------------------------
| Body Weight: [___] kg    Calories: [____] kcal    |  <- Quick inputs
+----------------------------------------------------+
| Exercises                                         |
| +------------------------------------------------+|
| | [Dropdown: Bench Press]  Weight: [__] Reps:[] | |
| | Notes: [__________]  [Delete]                 | |
| +------------------------------------------------+|
| | [Dropdown: Squat]  Weight: [__] Reps: [__]    | |
| | Notes: [__________]  [Delete]                 | |
| +------------------------------------------------+|
| [+ Add Exercise]                                  | <- Adds another row
+----------------------------------------------------+
| [Save Log]                                        |
+----------------------------------------------------+

When you click add exercise, opens a Dialog:
    * "Create New" exercise button to add a new exercise to the list
        - closes current dialog and opens a new one
        - Create New Exercise title, add a name input, save button
        - on save, have a toast or sonner popup saying exercise created
        - then open back up the prev dialog
    * Combobox to open a dropdown list with a search to select exercises
    * Add button to save and add
Then the dialog closes and an exercise card is added to the main log page,
which has some inputs you can edit: weight and reps, and optional notes. 
Delete option on the side.

Also need to do something to remove exercises from create exercise list


4. Goals
    - set goals
    - daily calorie goals (nah don't do this one, since we're not like myfitnesspal,
        we're just tracking the number, not macros or anything)
    - goal body weight
    - goal strength milestone
    - etc.
5. Settings/Profile
    - change email/password/pfp
    - export data
    - clear data

* Maybe before login page, have a home page that tells users what the app is meant for
  kind of like getcracked.io

* Change flow to redirect to home by default, from home have a login button 
  that takes to login page.

Inspo:
https://dribbble.com/shots/23445464--ANIMATION-FitPower-SaaS-Workout-Platform
