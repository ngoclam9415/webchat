import ssl

from quart import make_response, make_push_promise, Quart, render_template, url_for, websocket
from quart_cors import cors, websocket_cors

app = Quart(__name__)
app1 = Quart(__name__)
app1 = cors(app1, allow_origin="*")

@app1.route('/')
async def index():
    # result = await render_template('index.html')
    # response = await make_response(result)
    # print(dir(response))
    await make_push_promise(url_for('static', filename='css/bootstrap.min.css'))
    await make_push_promise(url_for('static', filename='js/bootstrap.min.js'))
    await make_push_promise(url_for('static', filename='js/jquery.min.js'))
    return await render_template('index.html')

@app1.websocket("/login")
@websocket_cors(allow_origin="*")
async def login():
    while True:
        data = await websocket.receive()
        print("DATA FROM SOCKET : ", data)
        await websocket.send(data)

@app1.websocket("/chat_message")
@websocket_cors(allow_origin="*")
async def chat_message():
    while True:
        data = await websocket.receive()
        print("DATA FROM SOCKET : ", data)
        await websocket.send(data)

@app1.websocket("/is_online")
@websocket_cors(allow_origin="*")
async def is_online():
    while True:
        data = await websocket.receive()
        print("DATA FROM SOCKET : ", data)
        await websocket.send(data)

if __name__ == '__main__':
    ssl_context = ssl.create_default_context(
        ssl.Purpose.CLIENT_AUTH,
    )
    ssl_context.options |= ssl.OP_NO_TLSv1 | ssl.OP_NO_TLSv1_1
    ssl_context.set_ciphers('ECDHE+AESGCM')
    ssl_context.load_cert_chain(
        certfile='cert.pem', keyfile='key.pem',
    )
    ssl_context.set_alpn_protocols(['h2', 'http/1.1'])
    # app.run(host='localhost', port=5000, ssl=ssl_context)
    app1.run(host='localhost', port=5001)