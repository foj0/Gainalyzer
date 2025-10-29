# Work log:
## 8-13: 
* Got signup/signin with email working
* Setup Brevo for custom SMTP email send
* Prevent access to pages when not yet registered or email/account confirmed.
* If you signed in with Google, you can't try to sign in with email. Has to be through
Google again.
* Tried to use Resend instead of Brevo, looks nicer, but I'd need to buy my own Domain name.
* Tomorrow will try to set up a nicer login/register page system
* Also I think maybe putting the redirect in data options in signup
will make it not redirect until confirmation by default?
* Maybe add anonymous user login and have a demo with fake data to easily show off the app features

## 8-14:
* Designed more of the login/register component
* Got more familiar with css and tailwind. Specifically with handling dynamic sizing and width
* need to make states now to handle showing only the login part or only register
* Also do stuff so button isn't active until valid email and password have been entered.

## 8-15:
* started working on making register inputs invalid when not filled out properly

## 8-16:
* nothing

## 8-17:
* Finished making register/login inputs red and showing error messages
when not filled out correctly
* Made submit buttons grayed out when disabled
* need to show an error when you submit but get an error (whether login info is wrong
or there's already an account registered with an email or something)
* Also need to do reset password

## 8-18:
* Worked on more error handling on login/register
* Need to add option to set a password from account if they initially registered with google
* If they registered using email and password just show option to reset password
* so also get the reset password flow working on login page

## 8-19:
* Got add/reset password to work from the accounts page
* Still need to do reset password from login screen w/ email

## 8-20:
* setup reset password from login page
* after email is sent do nothing on that page, just tell them to check inbox
* after user changes password theys should be logged in and taken to main page. /account for now.
* need to fix it so the password reset page is only accessible from the email magic link

## 8-21:
* break

## 8-22:
* Finally got it so password recovery page only works if coming from email link
* need to fix the styling for those pages now

## 8-23:
* nothing

## 8-24:
nothing

## 8-25:
* fixed styling in password reset flow pages
* Made cancel button send back to home page on password reset page
* refactors styling to use tailwind's dark/light mode.
* Need to add a dark mode toggle button. Prob to every page in top right?

## 8-26:
* did some research on mobile first development. Learned some media query stuff.
* Added a theme toggle button to most pages. I don't think it needs to go on pages
like the password reset or email request page.

ipod; asdfasdf

## 8-27:
* Fixed the toggle darkmode button only showing moon icon. Issue was we needed 
to have @custom-variant dark (&:is(.dark *)); to allow us to use dark: styles.
* Fixed some warnings on supabase about mutable search path. Added explicit search_path
* Now need to start adding database stuff to log workout and weight


# Didn't do anything till 9-8....

## 9-8:
* Did desktop and mobile navbars

## 9-9:
* Made theme toggle just click, no dropdown menu
* add settings to side panel bottom on desktop

## 9-10:
* Added the settings stuff to mobile navbar
* Fixed colors on mobile navbar
* polished navbar sidebar stuff a lot more
* Started making the log page and planned out the design

## 9-11:
* made a function to get the date and display it on log
* Got calendar date picker component working.
* Make left and right arrows to the left and right of the date to
quickly change date without needing to open the date picker.

## 9-12:
* started on the weight/cals inputs, got stuck trying to make it mobile friendly

## 9-15:
* got the weight/cals inputs done and change handlers to validate inputs
* Also got local storage stuff to save input text on refresh
* Added save button for log form. Still doesn't do anything, though. I'll do that later.
* Starting exercise logs
* Planned out how the exercise adding should go

## 9-16:
* Made the add and new exercise actually add an exercise card to log page
* Made the log page main section be centered and not full screen

## 9-17:
* Fixed exercise card input handlers
* Added tables for user log info
* Tested exercise insert, delete, select
* Need to set up exercise insert from the create exercise modal
* Delete exercise will be throughs settings? Or add an option in the create menu
* On loading the add exercise modal we load up the exercises

## 9-18:
* Fixed bug where we're constantly sending requests to supabase when we open
    AddExercise; by removing exercises from the dependency list in ExerciseCombobox useEffect
* Added duplicate exercise error msg and success sonner toast popups on exercise creation
* Got the save log stuff setup
* Had to refactor exercise ids not matching up from react components to supabase
* need to fix RLS for the other log tables

## 9-19:
* Setup RLS policies for the rest of the tables
* Had to refactor exercise id stuff to get handleSaveLog to work properly.
* Added weight/rep cols to log_exercises. Don't need log_sets anymore. Each exercise
should only have one set.
* Kind of understand how the table relationships work

## 9-22:
* Edited log layout a little to make it look less empty. Responsive sizing.
* Fixed exercise combobox not scrolling; set popover modal={true}
* Fixed login/register inputs again... finally done for good now. I hope. Got their own class.
* Added index for exercises that references user id
* Added composite index for log_exercises on log_date and user_id
* Added index for log_exercises on exercise_id. Might not be used. Remove later if not needed
* Handled all 5 Performance Advisor suggestions for indexs
* Fixed supabase performance warnings:
    Calling auth.uid() (or current_setting()) directly inside a policy can cause it to be re-evaluated per-row, harming performance at scale.
    Supabase recommends wrapping such calls in a scalar subquery form (SELECT auth.uid()) so the function is evaluated once per statement, not per row.

## 9-23:
* Moved the exercises fetch from ExerciseCombobox to AddExercises, so no delay in loading them in dropdown list.
* Order exercises by name alphabetically in add exercise combobox
* Looked into different chart libraries and decided in ReCharts
* Fixed bug causing infinite supabase requests in AddExercise, fixed by using refreshKey instead of exercises in fetch dependency list.

## 9-24:
* Took time to better understand how the supabase postgres api works and making database calls myself.
* Spent hrs trying to figure out how to correctly type the supabase responses and how to filter and preprocess them.
to avoid any typescript errors or complaints.

## 9-25:
* got gpt to give me a layout design for the dashboard
* Made a quick stats section with current bodyweight, avg bodyweight, and avg calories (7 days)
* Got the chart to scale according to the selected date range
* need to make the hover show the date as well as the weight values
* Made the bodyweight trend graph. Still working on getting it customized fully.
    - might need to fix the all option? not sure, will have to fill in more dummy data to test

## 9-26:
* Made the BiaxialLineChart for weight/cals.
* Spent some time polishing it to be responsive for mobile

## 9-29:
* Fixed quick stats section handling null values

## 9-30:
* Worked on getting the exercise info and logging it.
* Transformed Type Log into Exercise log, calculating the estimated 1RM and making it
into a type that we can easily plot.
* Really tried doing things myself, not using AI to generate code for me.

## 10-01:
* got the line chart to show exercise info
* Fixed exercise combobox search not working. Changed input value to use name not id.

## 10-02:
* Planned out more of how the dashboard will look
* Started the new welcome section.
* Fixed the x axis ticks on chart not being sparse enough

## 10-08:
* I did some stuff but I forgot...
* Also had to set up dev environment for windows since I got new pc and couldn't access my linux partition

## 10-09:
* worked on improving the dashboard layout once more

## 10-10:
* Settled on a dashboard setup, worked on getting that done and looking nice
* got most of things done, need to implement actually dynamically loading the data

## 10-13:
* Got some boiler plate stuff for the AI analyze section
* Started actually pulling data for the quick stats section

## 10-14:
* started goal section

## 10-15:
* Goal section saving.
* Added goals supabase table

## 10-16:
* Finished goals section.
* added more edge cases for clearing goals and stuff like that
* got dashboard to pull users's bw goal

## 10-20:
* Finished the goal section (at least the part when we have a valid goal set)
* Starting the empty goal set for when goals still haven't been set.
* Strength goal section complete too. May still go back and edit a bit.

## 10-21:
* Finished the calories. Didn't realize it wasn't actually using real data.
* Need to fix the sizing/centering for the goals sections. It looks off on smaller screen sizes
* Also trie to make all the gaol sections the same width. The calories is too wide.
    * Probably just need to make the whole dashboard area wider again. I think it's too narrow

## 10-22:
* Adjusted the responsiveness of the dashboard layout a bit more
* Added protein to log and made dashboard fetch it with logs
* Started the exercises page

## 10-24:
* Exercises page displays users exercises
* Got exercise table to show dropdown list of logs
* Exercise name edit and exercise deletion working.
* Look into making edit not completely refresh exercises table

## 10-25:
* Added loading icon to exercises while the table loads, so it doesn't flash
"No exercises" but instead just shows a loading circle.
* Creating exercises now works.
* Sort on creating so new exercise is added in order

## 10-27:
* Starting templates page
* Going to make a new exercise selector. Popup dialog that lists out exercises in row
and you click click on them to mark and then when you hit add all marked exercises are added.
Replacing the dropdown menu cause that's ugly.

## 10-28:
* Fixed nested dialog issue of closing one closes all. I guess for some reason having a 
form submit causes them all to close as opposed to just a button that calls the same function.
Also specify the button to be in <DialogClose></DialogClose> to actually close the dialog
not just setOpen(false).
I already had the nested dialogs working so I'll leave it. But a better design is to
just use one dialog and load different content based on what we select.
* NVM nested dialogs made state management cancer. Did conditional rendering on one dialog
and works easily now.
* Template resets on open/close now

## 10-29:
* template grid


### todo:
* After renmaing an exercise is there a way to not reload the whole exercises list, but only update that one exercise name?
* Fix goal section colors in light mode
* Maybe have some top bar along the top of the screen. Not a navbar, but some bar, with maybe a pfp thing.
    would help fill up the screen a little more. So don't put the pfp thing at the bottom of the side panel like i was thinking.
* Make an exercises page where you can select an exercise and it displays a table of all your logs for that specific exercise
and a graph for it.
    - each exercise is just an item in a list.
    We have a kind of table and each exercise is a row with borders on every side.
    Have a search bar on top to filter exercises by name
    On the far right of the row, have a dropdown arrow and a delete button and an edit name button with pencil icon
        - delete just deletes
        - edit can change the exercise name
        - drop down arrow displays another table with all your logs for that exercise
        - Idk if i should store this data again or if theres some way to reference the logs table
* Have a fixed aspect ratio for the exercise bw chart so it doesn't get elongated height wise. Should always be wider.
* idk. Move the isMObile check from the exercisebodyweight chart to the dashboard page and do pass it down as props to everything else.
* Redo the exercise and date range selects to be better looking and limit how many options show at once on exercise select.
* Fix the x axis ticks. They're not changing for some reason.
* Fix the "All" on the first bodyweight chart
* Should make a thing to create a workout template and add all those exercises in one go.
* Make the pick date calendar start at the current log date, not today's actual date.
* Make it so that you can't save a log without filling in the weight/reps in an exercise card
* Create an exercise selector dropdown that pulls from the users exercises, default to the most recently added
, and show blank or just "exercise" if there's none.
* Move all log colors down one. Darker looks better. Or invert to where we have lighter background than the section cards
* On the quick stats have a hover popup that says that the avg is taken over the last 7 days for weight/cal
* Might need to edit the FetchLogForDate function to use log_id and not log_date
* In the calendar picker highlight days with filled in logs?
* Setup some cache for date logs so we don't have to keep fetching from db every time
and delete the cache after some time. Or does supabase already do this?
* Look into why logout takes so long. Maybe just redirect to login page first while it loads the logout
* Consider disabling the log button until changes are made.
* Do I need to have a allow cookies thing? Look into when this is needed.
* For the log page, look into reducing the number of auth reqs. Is there a way to
do it once and keep that for the rest of the session?
* Maybe add a little chart thingy that highlights days you've logged this week to dashboard.
So we can have like 7 circles, sun - sat, and days that you did log are filled in green or lit up,
otherwise they are grayed out.
