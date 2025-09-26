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
