const name = prompt("Hello, would you mind insert your username ?? ")


const url = 'http://localhost:5000/insert_user';


const request = new Request(url, {method: 'POST',  body: JSON.stringify({username: name})});

var ws = new WebSocket('ws://' + "localhost" + ':' + 5000 + '/ws');

function click_send(){
  var nearest_form = $(this).closest("form");
  var text_input = nearest_form.find("#text_input").val();
  console.log(text_input)
  ws.send(JSON.stringify({username: name, type: "chat", text:text_input}));
}

var send_button = $("#send_button");
send_button.on("click", click_send);

fetch(request)
  .then(response => {
    if (response.status === 200) {
      // console.alert(response)
      return response.json();
    } else {
      throw new Error('Something went wrong on api server!');
    }
  })
  .then(response => {
    console.log(response)
    ws.send(JSON.stringify({username: name, type: "join"}));
    console.debug(response);
    // ...
  }).catch(error => {
    console.error(error);
  });

ws.onmessage = function (event) {
  console.log(event.data);
};

