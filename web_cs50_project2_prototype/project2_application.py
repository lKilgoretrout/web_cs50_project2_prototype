import os, datetime
from flask import Flask, render_template, url_for, request, session, redirect, jsonify
from flask_socketio import SocketIO, emit, join_room, leave_room
from flask_session import Session

app = Flask(__name__)
app.config["SECRET_KEY"] = 'super secret key'
app.config["SESSION_PERMANENT"] = False
app.config["SESSION_TYPE"] = "filesystem"
socketio = SocketIO(app)
Session(app)

display_names_list = []
channel_list = ["General"]
time = datetime.datetime.now()
now = time

rooms = {}

startup_message = {
    "channel": "General",
    "user_from": "Flack",
    "user_to": "",
    "timestamp": now.strftime("%a %b %d %I:%M:%S"), 
    "msg_txt": "Welcome to my WebCS50 Project2: 'Flack' ",
    "deleteID": None }

channel_messages = {
    "General": {
        'messages': [startup_message]
}}



@app.route('/')
def index():
    if 'user_id' in session:
        user_id = session['user_id']
        return render_template("project2_index.html", message=f"Welcome to my WebCS50 Project2, {user_id}", user_id=user_id)
    else:
        return render_template("project2_register.html", message=f"Please enter a user_id (1-32 characters)", user_id=None)
        
        
@app.route('/logout')
def logout():
   # remove the username from the session if it is there
   session.pop('user_id', None)
   return redirect(url_for('index'))
   
@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        session['user_id'] = request.form['user_id']
        user_id = session['user_id']
        return render_template('project2_index.html', \
            user_id=user_id, message=f"Welcome to my WebCS50 Project2, {user_id}")
    else:
        return render_template('project2_register.html', \
            message=f"Please enter a user_id", user_id=None)

@app.route("/get_messages", methods=["POST"])
def get_messages():
    ''' within 'channel_messages' list of messages found at :
        channel_messages[channel]['messages']'''
    channel = request.form.get("channel")
    display_name = request.form.get("displayName")

    #print('@app.route("/get_messages", methods=["POST"])')
    #print('channel = ', channel)
    
    # if no messages, set to startup_message
    try:
        message_list = channel_messages[channel]['messages']
        return jsonify({"success": True, "messages": message_list})

    except KeyError:
        message_list = channel_messages['General']['messages']
        return jsonify({"success": False, "messages": message_list})
    
              
  
@socketio.on("submit message")
def new_message(data):
    '''
     data = socket.emit('submit message', {'msg_txt': msg_txt, 'channel': channel,'timestamp': current_time, 'user_from': displayName});
    '''
    channel = data["channel"]
    user_from = data["user_from"]
    msg_txt = data["msg_txt"]
    timestamp = data["timestamp"]
    deleteID = data["deleteID"]

    message = {"msg_txt": msg_txt,
               "channel": channel,
               "timestamp": timestamp,
               "user_from": user_from,
               "deleteID": deleteID }

    ''' channel_messages = {
            "General": {
                'messages': [startup_message]
            }
            "channel": {
                'messages': [] 
            }
    }
    '''
    # create 'channel' key in channel_messages
    if channel not in channel_messages:
        channel_messages[channel] = {'messages': [] }
    
    # if the number of messages in a channel exceeds 100, delete first message
    if len(channel_messages[channel]['messages']) >= 100:
        del channel_messages[channel]['messages'][0]

    channel_messages[channel]['messages'].append(message)

##################
    #print('within @socketio.on("submit message")')
    #print('[channel] = ', channel)
    #print("channel_messages[channel]['messages']", channel_messages[channel]['messages'])

    emit("create message", message, broadcast=True)
        
    return jsonify({"success": True})
    

@socketio.on('submit channel')
def create_channel(channel):
    '''Gets channel submit form, adds it to server channel list, 
       emits this data back to the webpage'''
    channel_name = channel
    channel_list.append(channel_name)
    emit("create channel", channel_name, broadcast=True)
    
@socketio.on('join')
def join(data):
    display_name = data['displayName']
    room = data['room']
    join_room(room)
    rooms[display_name] = room
    
    return jsonify({"success": True})

@socketio.on('delete channel')
def delete_message(deleteID, channel):
    for msg in channel_messages[channel]['messages']:
        if msg['deleteID'] == deleteID:
            del channel_messages[channel]['messages'][msg]

'''    
    channel_messages = {
    "General": {
        'messages': [startup_message]
    }}
'''
    


if __name__ == "__main__":
    app.run()