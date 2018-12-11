var global_channel_list = [];


// create a channel 
document.addEventListener('DOMContentLoaded', () => {
    // the channel submit button is disabled by default:
    document.querySelector('#channel_submit').disabled = false;

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

    document.querySelector('#new_channel').onsubmit = () => {
        
        const tr = document.createElement('tr');
        tr.innerHTML = document.querySelector('#channel_name').value;
        const channelName = document.querySelector('#channel_name').value;
        
        // Add channel_name to #channels table
        document.querySelector('#channels').append(tr);

        // append channel_name to global_channel_list:
        global_channel_list.push(channelName);

        // Clear input field
        document.querySelector('#channel_name').value = '';

        // Stop form from submitting
        return false;
    };
});





