# Unofficial Todoist Gnome Shell extension

This is an unofficial Gnome Shell extension to access and interact with Todoist items that are due.  I hacked this together in a day from [ubuntudroid's](https://github.com/ubuntudroid/todoist-gnome-shell-extension) code so it is a heavry work in progress currently when I have time.

It displays currently open tasks in the top right of your Gnome Shell. Upon clicking on it:
* You'll see Overdue and Today items 
* It displays their projects wih the appropiate color
* Complete an item by clicking on the check mark
* Update Now
* View/edit settings

It is a forked from the great work by [ubuntudroid](https://github.com/ubuntudroid/todoist-gnome-shell-extension).  The original code was heavily influenced by [this](http://smasue.github.io/gnome-shell-tw) and [this](http://www.mibus.org/2013/02/15/making-gnome-shell-plugins-save-their-config/) blogpost. Thanks guys! :)

![Screenshot](assets/todoist-gnome-shell-extension.png?raw=true "Screenshot")

# Setup

Clone the repository to `~./local/share/gnome-shell/extensions/` into a folder named `todoist@ubuntudroid.gmail.com` using the following command:

    git clone git@github.com:ubuntudroid/todoist-gnome-shell-extension.git todoist@ubuntudroid.gmail.com
    
The name of the directory is important because Gnome Shell won't recognize the extension otherwise.

If you are running Wayland, you'll have to logout and log back in.  Otherwise restart Gnome Shell (ALT-F2 and then 'r') and navigate to https://extensions.gnome.org/local/. You can also open the Gnome Tweak Tool if you have that installed. You can enable the extension and specify your Todoist API token there.  Do a manual Update, or just wait 5 mintutes after updating your token

#### Note:
* It has not yet been submitted to the Gnome Shell extension directory.
* I have not updated the metedata yet, so this will not be able to run if you have the original extension this was forked from installed.
* Extension updates automatically every 5 minutes.

#### Todo:
* Add an update duration field to Settings
* Sync token is set to *.  Update to do incremental updating
* Enter new task for Today that takes #ProjectName
* Drag and drop order
* Display priority
* Add project colors for Premium members
* Edit button to: change due date, change project, edit notes, priority