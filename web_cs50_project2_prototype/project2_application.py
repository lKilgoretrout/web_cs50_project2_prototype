import os, time

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


@app.route('/')
def index():
    if 'user_id' in session:
        user_id = session['user_id']
        return render_template("project2_index.html", message=f"Welcome to my WebCS50 Project2, {user_id}", user_id=user_id)
    else:
        return render_template("project2_register.html", message=f"Please enter a user_id", user_id=None)
        
        
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

@app.route("/get_channels", methods=["POST"])
def get_channels():
    return jsonify({"success": True, "channel_list": channel_list})

###########

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








if __name__ == "__main__":
    app.run()