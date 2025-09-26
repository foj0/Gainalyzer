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

### todo:
* Need to Split the quick stats into (weight /cal) bubbles and have images in each (scale/food icons)
* Move all log colors down one. Darker looks better
* On the quick stats have a hover popup that says that the avg is taken over the last 7 days for weight/cal
* Start on Dashboard. Get a graph up for the bodyweight or something
    - app/dashboard/page should be server component, insert a separate client dashboard component within it.
    - Should I do similar thing to make loading pages faster? idk
* Might need to edit the FetchLogForDate function to use log_id and not log_date
* In the calendar picker highlight days with filled in logs?
* Setup some cache for date logs so we don't have to keep fetching from db every time
and delete the cache after some time. Or does supabase already do this?
* Look into why logout takes so long. Maybe just redirect to login page first while it loads the logout
* Consider disabling the log button until changes are made.
* add a little profile marker with pfp and email/full name at bottom by settings on sidebar
* Do I need to have a allow cookies thing? Look into when this is needed.
* For the log page, look into reducing the number of auth reqs. Is there a way to
do it once and keep that for the rest of the session?
