Messages = new Mongo.Collection('messages');

Router.route('/', function () 
{
	this.render('guestBook'); // render guestbook template
	this.layout('layout'); // set main layout template
});

Router.route('/about', function () 
{
	this.render('about');
	this.layout('layout');
});

Router.route('/messages/:_id', function()
// to get :_id, go to Console and type Messages.find({}).fetch()
{
	this.render('messages', 
	{
		data: function () 
		{
			return Messages.findOne({_id: this.params._id});
		}
	});
	this.layout('layout');
},
// allows the messages to be clicked on in the main section, and brought up in localhost:3000/messages/....
{
	name: 'message.show'
}
);

if (Meteor.isClient)
{
	Meteor.subscribe("messages");
	
	Template.guestBook.events({});
	
	Template.guestBook.events
	({
		'submit form':function(event)
		{
			event.preventDefault();
			var messageBox = $(event.target).find('textarea[name=guestBookMessage]');
			var messageText = messageBox.val();
			//var nameBox = $(event.target).find('input[name=guestName]');
			var name = nameBox.val();
			
			Messages.insert({message: messageText, name: Meteor.user().username, createdOn: Date.now()});
			
			// clear field after submission
			messageBox.val('');
			//nameBox.val('');
		}
	});
	
	Template.guestBook.helpers({
		'messages':function()
		{
			return Messages.find({}, {sort: {createdOn: -1}}) || {};
		}
	});
	
	Accouts.ui.config
	({
		passwordsSIgnupFields: "USERNAME_ONLY"
	})
}

if (Meteor.isServer)
{
	Meteor.startup(function ()
	{
		smtp = 
		{
			username: 'yourmail@mail.com',
			password: 'mySecretPassword',
			server: 'smtp.gmail.com',
			//port 580
		};
	});
	
	Accounts.onCreateUser(function(options, user)
	{
		if (options.profile)
		{
			user.profile = options.profile;
		}
		else
		{
			user.profile = {};
		}
		
		// default properties
		user.profile.rank = "1";
		user.profile.experience = 0;
		
		// send verification email
		if (options.email)
		{
			Accounts.emailTemplates.siteName = "Guestbook";
			Accounts.emailTemplates.from = 'Stacey';
			Accounts.sendVerificationEmail(users._id);
		}
		
		return user;
	});
	
	// this code only runs on the server
	Meteor.publish("messages", function()
	{
		return Messages.find();
	});
}