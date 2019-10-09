from __future__ import print_function
from quart import Quart, websocket, jsonify, request, render_template, make_push_promise, url_for
from functools import wraps
import sys
import ssl
import json
from utils.database import WebChatDatabase

app = Quart(__name__)
database =WebChatDatabase("localhost", 27017)
users_list = database.list_user()
connected_ws = {}
connected = set()
print(users_list)

def collect_websocket(func):
    @wraps(func)
    async def wrapper(*args, **kwargs):
        global connected
        global connected_ws
        connected.add(websocket._get_current_object())
        try:
            return await func(*args, **kwargs)
        finally:
            connected.remove(websocket._get_current_object())
            key = None
            for key, value in connected_ws.items():
                if value == websocket._get_current_object():
                    print("DELETE CONNECTION TO : ",key)
                    del connected_ws[key]
                    break
            for remaining_key, value in connected_ws.items():
                send_data = {"from": key, "to": remaining_key, "text":"Goodbye I'm {}".format(key), "type":"quit"}
                await value.send(json.dumps(send_data))
    return wrapper


@app.route('/')
async def hello():
    await make_push_promise(url_for('static', filename='index.js'))
    await make_push_promise(url_for('static', filename='index.css'))
    return await render_template("index.html")
    
@app.websocket('/ws')
@collect_websocket
async def ws():
    while True:
        data = await websocket.receive()
        data = json.loads(data)
        username = data.get("username", None)
        print(connected_ws.keys())
        print(str(connected_ws))
        if not username in connected_ws:
            print("NEW LOG IN")
            connected_ws.setdefault(username, websocket._get_current_object())
            for key, value in connected_ws.items():
                if key == username:
                    continue
                send_data = {"from": username, "to": key, "text":"Hello I'm {}".format(username), "type":"join"}
                echo_data = {"from" : key, "to" : username, "text" : "Hello back, I'm {}".format(key), "type":"join"}
                await connected_ws[username].send(json.dumps(echo_data))
                await value.send(json.dumps(send_data))
        elif data["type"] == "join":
            print("DUPLICATE SESSION FOR ", username)
            await connected_ws[username].send("Your session is terminated because you account is logged in elsewhere")
            connected_ws[username] = websocket._get_current_object()
            for key, value in connected_ws.items():
                if key == username:
                    continue
                echo_data = {"from" : key, "to" : username, "text" : "Hello back, I'm {}".format(key), "type":"join"}
                await connected_ws[username].send(json.dumps(echo_data))
        elif data["type"] == "chat":
            print("{} is chatting ".format(username))
            with_person = data["with_person"]
            if with_person in connected_ws:
                send_data = {"from": username, "to": with_person, "text":data["text"], "type":"chat"}
                await connected_ws[with_person].send(json.dumps(send_data))

            for key, value in connected_ws.items():
                await value.send("Hello {}, i'm {}, {}".format(key, username, data["text"]))

        print(str(data))
        await websocket.send('hello'+ username)
        # await websocket.send(json.dumps(data))

@app.route('/insert_user', methods=["POST"])
async def insert_user():
    # print("header : ",request.headers)
    form = await request.data
    print("form = ", form)
    form = json.loads(form)
    username = form.get("username", None)
    print(username)
    if username is None:
        return jsonify({"result" : "Cannot receive username"}), 404
    flag = database.insert_new_user(username)
    if flag:
        users_list.append(username)
        users_list.sort()
        return jsonify({"result" : "Successfully", "status": "First time log in"}), 200
    else:
        return jsonify({"result" : "Successfully", "status": "Log in to existed account"}), 200
    return jsonify({"result" : "Server error while inserting new user"}), 500

@app.route('/list_users', methods=["GET"])
async def list_users():
    data = users_list
    print(type(data))
    print(data)
    return jsonify({"list_user": data}), 200


@app.route('/show_existed_chat', methods=["POST"])
async def show_existed_chat():
    form = await request.data
    form = json.loads(form)
    latest = form.get("latest", None)
    from_time = form.get("from_time", None)
    to_time = form.get("to_time", None)



# @app.route('')
    

if __name__ == "__main__":
    ssl_context = ssl.create_default_context(
        ssl.Purpose.CLIENT_AUTH,
    )
    ssl_context.options |= ssl.OP_NO_TLSv1 | ssl.OP_NO_TLSv1_1
    ssl_context.set_ciphers('ECDHE+AESGCM')
    ssl_context.load_cert_chain(
        certfile='cert.pem', keyfile='key.pem',
    )
    ssl_context.set_alpn_protocols(['h2', 'http/1.1'])
    app.run(host='0.0.0.0', port=5000, ssl=ssl_context)
