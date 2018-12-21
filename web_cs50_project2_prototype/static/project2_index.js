var channel_list = [];
var current_channel;

function clickHandler(channel_name) {

    let current_channel =  channel_name;
    
    // change fontWeight of all channels to normal: 
    document.querySelectorAll('.channel').forEach(td => {
        td.style.fontWeight = "normal";
    });

    //msgType = "PUBLIC";
    let channel_header = document.getElementById("channel_header");

    // current_channel <fontWeight> to bold
    document.getElementById(current_channel).style.fontWeight = "bold";

    channel_header.innerHTML = " Messages on " + current_channel + " channel";
    localStorage.setItem("channel", current_channel);
    //configure_msgs(global_current_channel, msgType);
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

/*
function get_channels() {
    // Get List of Channels
    const request = new XMLHttpRequest();
    request.open('POST', '/get_channels');
	 
    if (localStorage.getItem('current_channel')) {
	current_channel = localStorage.getItem('channel');
    }
    else {
    current_channel = "General";
    }
    // callback function 
    request.onload = () => {

	// Extract JSON data from request
	const response = JSON.parse(request.responseText);
		
	// unpack list of channels 
	if (response.true) {
	    var channels = data["channel_list"];
	    for (var i = 0, len = channels.length; i < len; i++) {
		if (channels[i] == current_channel){
		    add_channel(channels[i], 1);
		}
		else {
		    add_channel(channels[i],0);
		}
	    }
	}
	else {
	    console.log("function get_channels() did not work");
	}
    }
    request.send();
}
*/

// create a channel 
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
	    socket.emit("join", {"displayName": displayName, "room": id});
	    //get_channels();
	    //configure_users();
	});



    // the channel submit button is disabled by default:
    document.querySelector('#channel_submit').disabled = true;

     // Enable button only if there is text in the input field
    document.querySelector('#new_channel').onkeyup = () => {
        if (document.querySelector('#channel_name').value.length > 0) 
            document.querySelector('#channel_submit').disabled = false;
            
        else
            document.querySelector('#channel_submit').disabled = true;
            
        // if the channel name is a duplicate, don't allow submission:
        if (channel_list.length > 0)  
            if (channel_list.includes(document.querySelector('#channel_name').value))    
                document.querySelector('#channel_submit').disabled = true;
    };

// channel submit: 

    document.querySelector('#new_channel').onsubmit = () => {
        var channel = document.querySelector('#channel_name').value;
        // Clear input field
        document.querySelector('#channel_name').value = '';
        
        socket.emit('submit channel', channel);
        //console.log("submit channel emitted successfully")
        return false;
    };
        
    socket.on('create channel', channel_name => {
        //console.log("socket.on create channel ran")
        add_channel(channel_name, 1);
        
    })
        
    
});





