var global_channel_list = [];

function add_channel(channel_name) {
    var table_row = document.createElement('tr');
    
    var table_data = table_row.insertCell(-1);
    table_data.innerHTML = channel_name;

    // Add channel_name to #channels table
    document.querySelector('#channels').append(new_channel);

    // append channel_name to [client] global_channel_list:
    global_channel_list.push(channel_name);
    
};



// create a channel 
document.addEventListener('DOMContentLoaded', () => {
    
    // Connect to websocket
    var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

    // the channel submit button is disabled by default:
    document.querySelector('#channel_submit').disabled = true;

     // Enable button only if there is text in the input field
    document.querySelector('#new_channel').onkeyup = () => {
        if (document.querySelector('#channel_name').value.length > 0) 
            document.querySelector('#channel_submit').disabled = false;
            
        else
            document.querySelector('#channel_submit').disabled = true;
            
        // if the channel name is a duplicate, don't allow submission:
        if (global_channel_list.length > 0)  
            if (global_channel_list.includes(document.querySelector('#channel_name').value))    
                document.querySelector('#channel_submit').disabled = true;
    };

// channel submit: 

    document.querySelector('#new_channel').onsubmit = () => {
        var channel = document.querySelector('#channel_name').value;
        // Clear input field
        document.querySelector('#channel_name').value = '';
        
        socket.emit('submit channel', channel);

        return false;
    };
        
    socket.on('create channel', channel_name => {
        add_channel(channel_name);
        
    })
        
    
});





