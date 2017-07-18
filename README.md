# Unofficial Todoist Gnome Shell extension

This is an unofficial Gnome Shell extension to access and interact with Todoist items that are due.  I hacked this together in a day from [ubuntudroid's](https://github.com/ubuntudroid/todoist-gnome-shell-extension) code so it is a rough work in progress currently when I have time. So beware.

It displays currently open tasks in the top right of your Gnome Shell. Upon clicking on it:
* You'll see Overdue and Today items.
* Items will be in their day's sorted order
* It displays their projects wih the appropiate color
* Complete an item by clicking on the check mark
* Update Now
* View/edit settings

It is a forked from the great work by [ubuntudroid](https://github.com/ubuntudroid/todoist-gnome-shell-extension).  The original code was heavily influenced by [this](http://smasue.github.io/gnome-shell-tw) & [this](http://www.mibus.org/2013/02/15/making-gnome-shell-plugins-save-their-config/) blogpost, and reading the source from [clipboard indicator](https://github.com/Tudmotu/gnome-shell-extension-clipboard-indicator) & [todolist](https://github.com/bsaleil/todolist-gnome-shell-extension). Thanks guys! :)

![Screenshot](assets/screenshot_dropdown.png?raw=true "Screenshot")

# Setup

Clone the repository to `~./local/share/gnome-shell/extensions/` into a folder named `todoist@pringlized.gmail.com` using the following command:

    git clone git@github.com:pringlized/todoist-gnome-shell-extension.git todoist@pringlized.gmail.com
    
The name of the directory is important because Gnome Shell won't recognize the extension otherwise.

If you are running Wayland, you'll have to logout and log back in.  Otherwise restart Gnome Shell (ALT-F2 and then 'r') and navigate to https://extensions.gnome.org/local/. You can also open the Gnome Tweak Tool if you have that installed. You can enable the extension and specify your Todoist API token in the settings.  Do a manual Update, or just wait 5 mintutes after updating your token

#### Note:
* Tested on Gnome Shell 3.24.2
* It has not yet been submitted to the Gnome Shell extension directory.
* Extension updates automatically every 5 minutes.

#### Issues:
* Sort order is corrent on init but not correct on update.  Todoist isn't returning items with changed order

#### Todo:
* Add an update duration field to Settings
* Enter new task for Today that takes #ProjectName
* Drag and drop order
* Display priority
* Add project colors for Premium members
* Edit button to: change due date, change project, edit notes, priority

#### Resources:
* [ST Referencal Manual](https://developer.gnome.org/st/3.24/)
* [Soup API](https://people.gnome.org/~gcampagna/docs/Soup-2.4/index.html)