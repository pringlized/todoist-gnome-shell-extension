// TODO:
// - generic resource type loader
// - load items and projects

const St = imports.gi.St;
const Gtk = imports.gi.Gtk;
const Main = imports.ui.main;
const Soup = imports.gi.Soup;
const Lang = imports.lang;
const Mainloop = imports.mainloop;
const Clutter = imports.gi.Clutter;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;
const ExtensionUtils = imports.misc.extensionUtils;
const Util = imports.misc.util;
const Me = ExtensionUtils.getCurrentExtension();
const Convenience = Me.imports.convenience;
const Polyfill = Me.imports.polyfill;
const Utils = Me.imports.utils;

const URL = 'https://todoist.com/API/v7/sync';


let _httpSession;
let _syncToken;
let _completeSyncToken;
let _openItems;
let _schema;
let _projects;

const MAX_LENGTH = 100;
const KEY_RETURN = 65293;
const KEY_ENTER  = 65421;

const TodoistIndicator = new Lang.Class({
		Name: 'Todoist.Indicator',
		Extends: PanelMenu.Button,

		_init: function () {
			this.parent(0.0, "Todoist Indicator", false);
			this.buttonText = new St.Label({
				text: _("Loading..."),
				y_align: Clutter.ActorAlign.CENTER
			});
			this.actor.add_actor(this.buttonText);

			this._loadProjects();			
			this._buildUI();
			this._refresh();
		},

		_refresh: function () {
			this._loadProjects();
			this._loadData(this._refreshUI);
			this._removeTimeout();
			this._timeout = Mainloop.timeout_add_seconds(300, Lang.bind(this, this._refresh));		

			return true;
		},

		// Build popup ui
		_buildUI: function (){
			// Destroy previous box
			if (this.mainBox != null)
				this.mainBox.destroy();

			// Create main box
			this.mainBox = new St.BoxLayout();
			this.mainBox.set_vertical(true);

			// Create todos box
			this.todosBox = new St.BoxLayout();
			this.todosBox.set_vertical(true);

			// Create todos scrollview
			var scrollView = new St.ScrollView({style_class: 'vfade',
				hscrollbar_policy: Gtk.PolicyType.NEVER,
				vscrollbar_policy: Gtk.PolicyType.AUTOMATIC});
			scrollView.add_actor(this.todosBox);
			this.mainBox.add_actor(scrollView);

			// Separator
			var separator = new PopupMenu.PopupSeparatorMenuItem();
			this.mainBox.add_actor(separator.actor);

			// Add 'Update Now' menu item
            let updateMenuItem = new PopupMenu.PopupMenuItem(_('Update Now'));
			this.mainBox.add_actor(updateMenuItem.actor);
            updateMenuItem.connect('activate', Lang.bind(this, function() {
					this.menu.close();	
					this._refresh();
				})
			);			
						
            // Add 'Settings' menu item to open settings
            let settingsMenuItem = new PopupMenu.PopupMenuItem(_('Settings'));
            this.mainBox.add_actor(settingsMenuItem.actor);
            settingsMenuItem.connect('activate', Lang.bind(this, this._openSettings));

			this.menu.box.add(this.mainBox);
		},	

		_openSettings: function () {
			Util.spawn([
				"gnome-shell-extension-prefs",
				Me.uuid
			]);
		},		

		_loadData: function () {
			let token = _schema.get_string('api-token');
			let params = {
				token: token,
				sync_token: _syncToken,
				resource_types: '["items"]'	
			}
			_httpSession = new Soup.Session();
			let message = Soup.form_request_new_from_hash('POST', URL, params);
			_httpSession.queue_message(message, Lang.bind(this, function (_httpSession, message) {
						if (message.status_code !== 200) {
							log('TODOIST loadData failed with status code: ' + message.status_code.toString());
							log('TODOIST loadData response_body: ' + message.response_body);
							return;
						}
						let json = JSON.parse(message.response_body.data);
						//log('TODOIST load tasks: ' + JSON.stringify(json.items.filter(Utils.isDueToday)));
						this._refreshUI(json);
					}
				)
			);
		},

		_loadProjects: function() {
			let token = _schema.get_string('api-token');
			let params = {
				token: token,
				sync_token: '*',
				resource_types: '["projects"]'	
			}
			_httpSession = new Soup.Session();
			let message = Soup.form_request_new_from_hash('POST', URL, params);
			_httpSession.queue_message(message, Lang.bind(this, function (_httpSession, message) {
						if (message.status_code !== 200) {
							log('TODOIST loadProjects failed with status code: ' + message.status_code.toString());
							log('TODOIST loadProjects response_body: ' + message.response_body);						
							return;
						}
						let json = JSON.parse(message.response_body.data);
						//log('PROJECTS: '+JSON.stringify(json));
						if (json.projects.length > 0) {
							_projects = json.projects;
						}
					}
				)
			);		
		},

		_getProjectData: function(id) {
			for (key in _projects) {		
				if (_projects[key].id == id) {
					return _projects[key];
				}
			}
			return null;
		},

		/*
		_removeItem: function(id) {
			for (key in _openItems) {		
				if (_openItems[key].id == id) {
					_openItems.splice(key, 1);
					return true;
				}
			}
			return false;		
		},
		*/
		
		_completeItem: function(item) {
			// HACK: destory the item for now to eliminate delay
			// NOTE: below if the update fails, log the error
			item.destroy();

			//log('TODOIST sendComplete');			
			//log('TODOIST id:' + item.id.toString());
			//log('TODOIST content:' + item.content);
			let token = _schema.get_string('api-token');

			// data to complete an individual item
			let commands = [{ 
				type: "item_complete",
          		uuid: this._guid(),
          		args: { 
					  ids: [item.id] 
				} 
			}];

			// params
			let params = {
				token: token,
				sync_token: _syncToken,
				resource_types: '["items"]',			
				commands: JSON.stringify(commands)
			}

			//log('TODOIST sending:' + JSON.stringify(params));
			_httpSession = new Soup.Session();
			let message = Soup.form_request_new_from_hash('POST', URL, params);
			//log('TODOIST sendComplete code:' + message.status_code.toString());			
			_httpSession.queue_message(message, Lang.bind(this, function (_httpSession, message) {	
						//log('TODOIST sendComplete code:' + message.status_code.toString());				
						if (message.status_code !== 200) {
							log('TODOIST completeItem failed with status code: ' + message.status_code.toString());
							log('TODOIST completeItem response_body: ' + message.response_body);							
							return;
						}
						let json = JSON.parse(message.response_body.data);
						//log('TODOIST sendComplete json data: ' + message.response_body.data);
						this._refreshUI(json);
					}
				)
			);						
		},

		_isDoneOrDeletedOrArchived: function (item) {
			return item.checked === 1 || item.is_deleted === 1 || item.is_archived;
		},

		_isNotDone: function (item) {
			return item.checked === 0;
		},

		_extractId: function (item) {
			return item.id;
		},

		_removeIfInList: function (item) {
			let index = _openItems.findIndex(openItem => openItem.id === item.id);
			if (index > -1)
				_openItems.splice(index, 1);
		},

		_addOrUpdate: function (item) {
			let index = _openItems.findIndex(openItem => openItem.id === item.id);
			if (index === -1)
				_openItems.splice(_openItems.length, 0, item);
			else
				_openItems[index] = item
		},

		_getTextForTaskCount: function (count) {
			switch (count) {
				case 0: return "no due tasks";
				case 1: return "one due task";
				default: return count + " due tasks";
			}
		},

		_parseItemJson: function (data) {
			_syncToken = data.sync_token;
			//log("TODOIST parseItemJson:" + JSON.stringify(data));

			let undoneItems = data.items.filter(this._isNotDone);
			let doneItems = data.items.filter(this._isDoneOrDeletedOrArchived);
			//log("TODOIST doneItems:" + JSON.stringify(doneItems));
			undoneItems.forEach(this._addOrUpdate);
			doneItems.forEach(this._removeIfInList);
		},

		_refreshUI: function (data) {
			this._parseItemJson(data);

			// Add all tasks to ui
			this.todosBox.destroy_all_children();
			let dueToday = _openItems.filter(Utils.isDueToday);
			let pastDue = _openItems.filter(Utils.isPastDue);
			let content = _openItems.filter(Utils.isDueDateInPast);
			let tasks = 0;

			// sort content
			pastDue.sort(function (a, b) {
				return a.day_order - b.day_order;
			});	
			dueToday.sort(function (a, b) {
				return a.day_order - b.day_order;
			});						

			// list past due
			if (pastDue.length > 0) {
				let pastDueHeader = new St.Label({
					text: 'PAST DUE',
					style_class: 'todoist-header-past'
				});			
				this.todosBox.add(pastDueHeader);
				for (let i=0; i<pastDue.length; i++)
				{
					let item = this._createItem(pastDue[i]);
					this.todosBox.add(item.actor);
					tasks += 1;
				}
				
				// Separator
				var separator = new PopupMenu.PopupSeparatorMenuItem();
				this.todosBox.add(separator.actor);		
			}

			// list items due today
			if (dueToday.length) {
				let headerStyle = (pastDue.length == 0) ? 'todoist-header-today-padding' :  'todoist-header-today';
				let dueTodayHeader = new St.Label({
					text: 'TODAY',
					style_class: headerStyle
				});				
				this.todosBox.add(dueTodayHeader);			

				for (let i=0; i<dueToday.length; i++)
				{
					let item = this._createItem(dueToday[i]);
					this.todosBox.add(item.actor);
					tasks += 1;
				}
			}	
			
			let count = _openItems.filter(Utils.isDueDateInPast).length;
			this.buttonText.set_text(this._getTextForTaskCount(count));
		},

		_createItem: function(data) {
			// get necessary data
			let itemId = data.id;
			let projectId = data.project_id;
			let dayOrder = data.day_order;
			let task = data.content;				

			// create new item for the content
			let item = new PopupMenu.PopupMenuItem(task);
			item.id = itemId;
			item.content = data.content;
			item.projectId = data.project_id;
			item.dayOrderrder = data.day_order;

			// Get project name and color
			let projectData = this._getProjectData(data.project_id);
			let projectName = (projectData != null) ? projectData.name : data.project_id.toString();
			let projectColorStyle = (projectData != null) ? 'todoist-project-color-'+projectData.color : 'todoist-project-color-none'
			let projectLabel = new St.Label({
				text: projectName,
				style_class: 'todoist-item-project-name '+projectColorStyle
			});
			projectLabel.set_x_align(Clutter.ActorAlign.END);
			projectLabel.set_x_expand(true);
			projectLabel.set_y_expand(true);
			item.actor.add_child(projectLabel);
			
			// Add the 'complete task' icon
			let completeIcon = new St.Icon({
				icon_name: 'object-select-symbolic',
				style_class: 'system-status-icon'
			});
			let completeIcoBtn = new St.Button({
				style_class: 'todoist-action-btn',
				x_fill: true,
				can_focus: true,
				child: completeIcon
			});
			completeIcoBtn.set_x_align(Clutter.ActorAlign.END);
			//completeIcoBtn.set_x_expand(true);
			//completeIcoBtn.set_y_expand(true);

			// add the icon button and connect click event
			item.actor.add_child(completeIcoBtn);
			item.completeIcoBtn = completeIcoBtn;
			item.completePressId = completeIcoBtn.connect('button-press-event',
				Lang.bind(this, function () {
					//this.menu.close();
					this._completeItem(item);
				})
			);

			return item;
		},

		_removeTimeout: function () {
			if (this._timeout) {
				Mainloop.source_remove(this._timeout);
				this._timeout = null;
			}
		},

		_guid: function() {
			function s4() {
				return Math.floor((1 + Math.random()) * 0x10000)
				.toString(16)
				.substring(1);
			}
			return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
				s4() + '-' + s4() + s4() + s4();
		},	

		stop: function () {
			if (_httpSession !== undefined)
				_httpSession.abort();
			_httpSession = undefined;

			if (this._timeout)
				Mainloop.source_remove(this._timeout);
			this._timeout = undefined;

			this.menu.removeAll();
		}
	}
);

let todoistMenu;

function init() {
	_syncToken = '*';
	_completeSyncToken = '*';
	_openItems = [];
	_schema = Convenience.getSettings();
}

function enable() {
	todoistMenu = new TodoistIndicator;
	Main.panel.addToStatusArea('todoist-indicator', todoistMenu);
}

function disable() {
	todoistMenu.stop();
	todoistMenu.destroy();
}
