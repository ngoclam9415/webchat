from __future__ import print_function
from quart import Quart, websocket, jsonify, request, render_template, make_push_promise, url_for
import sys
import ssl
import json
from utils.database import WebChatDatabase

app = Quart(__name__)
database =WebChatDatabase("localhost", 27017)

@app.route('/')
async def hello():
    await make_push_promise(url_for('static', filename='index.js'))
    return await render_template("index.html")
    
@app.websocket('/ws')
async def ws():
    while True:
        data = await websocket.receive()
        print(' Hello world! '+data, file=sys.stderr)
        await websocket.send('hello'+ data)

@app.route('/insert_user', methods=["POST"])
async def insert_user():
    form = await request.data
    print("form = ", form)
    form = json.loads(form)
    username = form.get("username", None)
    print(username)
    if username is None:
        return jsonify({"result" : "Cannot receive username"}), 404
    flag = database.insert_new_user(username)
    if flag:
        return jsonify({"result" : "Successfully", "status": "First time log in"}), 200
    else:
        return jsonify({"result" : "Successfully", "status": "Log in to existed account"}), 200
    return jsonify({"result" : "Server error while inserting new user"}), 500

@app.route('/list_users', methods=["GET"])
async def list_users():
    

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
    app.run(host='localhost', port=5000, ssl=ssl_context)
