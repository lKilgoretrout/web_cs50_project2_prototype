var channel_list = [];
var current_channel;

function clickHandler(channel_name) {
    /** function runs from ClickHandlerObject stored in each
     * channel's table_data (inside add_channel())
     * Sets current channel to bold and configure's messages
     */

    current_channel = channel_name;
    
    //let current_channel = localStorage.getItem('current_channel');

    // change fontWeight of all channels to normal: 
    document.querySelectorAll('.channel').forEach(td => {
        td.style.fontWeight = "normal";
    });

    let channel_header = document.getElementById("channel_header");

    // current_channel <fontWeight> to bold
    document.getElementById(current_channel).style.fontWeight = "bold";

    channel_header.innerHTML = " Messages on " + current_channel + " channel";
    localStorage.setItem("current_channel", current_channel);
    configure_messages(current_channel);
}

// Clear messages when switching channels
function clear_messages() {
    var messageList = document.getElementById('message_list');

    while (messageList.firstChild) {
	messageList.removeChild(messageList.firstChild);
    }
}

function create_message(message) {
/** message = {"msg_txt": msg_txt,
               "channel": channel,
               "timestamp": timestamp,
               "user_from": user_from
               "deleteID": deleteID} 
*/
    var channel = message['channel']
    var deleteID = message['deleteID']
    var table_row = document.createElement('tr');
    var table_data = table_row.insertCell(-1);
    table_data.setAttribute("id", message["user_from"])
    table_data.setAttribute("data-deleteID", deleteID);

    let timeStamp = String("<font class='timeStamp'>" + message["timestamp"] + "</font>");
    let displayName = String("<font class='displayName'> @" + message["user_from"] + "</font><br>");
    let messageText = String(message["msg_txt"]);

    let newMessage = timeStamp + ' ' + displayName + ' ' + messageText;
    table_data.innerHTML = newMessage

    // event handler for deleting messages:
    // clicking on a message runs deleteMessage()
    var deleteMessageHandler = table_row.querySelector("td");
    deleteMessageHandler.addEventListener("click", function () {deleteMessage(deleteID, channel);});
    
    document.querySelector('#message_list').append(table_row);
}

function deleteMessage(deleteID, channel) {
    // Connect to websocket
    var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

    
    //var match = messages.querySelector("tr[data-deleteID= deleteID]");
    //var messageToDelete = document.querySelectorAll("[data-deleteID='" + deleteID + "']");
    //var messages = document.querySelector("#message_list");
    //console.log(messageToDelete);

    if (confirm("Do you want to delete this message forever and ever ?")) {
        
        //messages.removeChild(messageToDelete.parentNode);
        
        socket.emit("delete message", deleteID, channel);
        configure_messages(channel);
      } else {
        alert("Whatever... I wasn't going to delete that message anyway");
      } 
    }

function add_channel(channel_name, select) {
/** adds channel as table_row with table_data into (id=channels) table 
*   if select = 1 : uses clickHandler to change font and message_header in room (channel)  
*/
    var table_row = document.createElement('tr');
    var table_data = table_row.insertCell(-1);
    table_data.innerHTML = channel_name;
    table_data.setAttribute("id", channel_name);
    table_data.setAttribute("class", "channel")

    // append channel_name to [client] channel_list:
    channel_list.push(channel_name);
    
    // if no current_channel, set added channel into local storage as current_channel:
    if (!localStorage.getItem('current_channel'))
        current_channel = localStorage.setItem('current_channel', channel_name)
    
    // clicking on a table_row (data) runs clickHandler
    var clickHandlerObject = table_row.querySelector("td");
    clickHandlerObject.addEventListener("click", function() {clickHandler(channel_name);});
    
    // Add table_row to #channels table
    document.querySelector('#channels').append(table_row);

    if (select == 1) {
	clickHandler(channel_name);
    }
};

function configure_messages(channel) {
/** runs inside clickhandler, gets messages for respective channels 
*/
    // Clear out old message list
    clear_messages();

    // Get Messages on this channel
    const request = new XMLHttpRequest();
    request.open('POST', '/get_messages');

    // Callback function for when request completes
    request.onload = () => {

	const data = JSON.parse(request.responseText);
	
    // Extract dictionary of messages and populate message pane
	if (data.success) {
	    console.log("configure_messages: success.")
	    var messages = data["messages"];
	    for (var i = 0, len = messages.length; i < len; i++) {
		create_message(messages[i]);
	    }
    }
    else {
        console.log('No messages in get_Messages, using startup_message');
        
        create_message(data["messages"][0]);
    }
    }

    // Add data to send with request for messages on this channel
    const data = new FormData();
    //let current_channel = localStorage.getItem('current_channel');
    data.append('channel', channel);
    data.append('displayName', displayName);

    // Send request
    request.send(data);
    return false;
}


document.addEventListener('DOMContentLoaded', () => {
    
    // Connect to websocket
    var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

    // get \ set displayname
    var displayName = document.querySelector("#displayName").innerHTML;
    var dn; 
    if (dn != displayName) {
    displayName = dn;
    localStorage.setItem("displayName", dn);
    }

    socket.on('connect', () => {
	    var id = socket.io.engine.id;
        var displayName = localStorage.getItem('dn')
	    socket.emit("join", {"displayName": displayName, "room": id});
	});

    // the channel/message submit button is disabled by default:
    document.querySelector('#channel_submit').disabled = true;
    document.querySelector('#submit_message').disabled = true;

     // Enable channel button only if there is text in the input field
    document.querySelector('#new_channel').onkeyup = () => {
        if (document.querySelector('#channel_name').value.length > 0) {
            document.querySelector('#channel_submit').disabled = false;

        } else {
            document.querySelector('#channel_submit').disabled = true;

        }
        // if the channel name is a duplicate, don't allow submission:
        if (channel_list.length > 0)  
            if (channel_list.includes(document.querySelector('#channel_name').value))    
                document.querySelector('#channel_submit').disabled = true;

        // limit channel names to < 32 characters
        if (document.querySelector('#channel_name').value.length > 32) {
            document.querySelector('#channel_submit').disabled = true;
            alert("Channel names must be fewer than 32 characters");
        }
    };
    
    // Enable message button only if (0 < message_text < 65)
    document.querySelector('#new_message').onkeyup = () => {
        if (document.querySelector('#message_text').value.length < 1)
            document.querySelector('#submit_message').disabled = false;
            
        if (document.querySelector('#message_text').value.length > 64) {
            document.querySelector('#submit_message').disabled = false;
            alert("Messages must be fewer than 64 characters")
            

        } else {
            document.querySelector('#submit_message').disabled = false;
        };
    };
    

    // channel submit form handler: 

    document.querySelector('#new_channel').onsubmit = () => {
        var channel = document.querySelector('#channel_name').value;
        // Clear input field
        document.querySelector('#channel_name').value = '';
        localStorage.setItem('current_channel', channel)
        current_channel = channel;
        socket.emit('submit channel', channel);
        return false;
    };
        
    socket.on('create channel', channel_name => {
        add_channel(channel_name, 1);
    })
    

    // message submit form handler

    document.getElementById("new_message").onsubmit = () => {
	    
	var msg_txt  = document.getElementById('message_text').value;
	var current_time = new Date().toLocaleTimeString();
	var displayName = document.getElementById('displayName').innerHTML;
    var channel = localStorage.getItem('current_channel')
    var deleteID = Math.floor(new Date().getTime());

	document.getElementById('message_text').value = "";
	//document.getElementById('submit_message').disabled = true;
	
	// send message form data to server 
    socket.emit('submit message', 
        {'msg_txt': msg_txt,
         'channel': channel,
         'timestamp': current_time,
         'user_from': displayName,
         'deleteID': deleteID});

    //console.log('socket.emit ("submit message") done sent!')
	return false;
    };
    
    
    // When a new message is announced, add to the message list
    socket.on('create message', message => {
	    //if (data["channel"] == current_channel) {
		create_message(message);
        //console.log("socket.on('create message') received response")
	    //}
	});
});





