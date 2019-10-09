const name = prompt("Hello, would you mind insert your username ?? ");
const with_who = prompt("Who do you want to chat with ?? ");

$("h3.text-center").text(with_who);

var ip_address = "192.168.1.65:5000"

const url = 'http://' + ip_address + '/insert_user';


const request = new Request(url, {method: 'POST',  body: JSON.stringify({username: name})});

var ws = new WebSocket('ws://' + ip_address + '/ws');

function click_send(event){
  if (event.which === 1 || event.which === 13){
    var nearest_form = $(this).closest(".input_msg_write");
    var text_input = nearest_form.find(".write_msg").val();
    nearest_form.find(".write_msg").val("")
    console.log(text_input)
    ws.send(JSON.stringify({username: name, type: "chat", with_person: with_who , text : text_input}));
    $(".msg_history").append(make_outgoing_msg(text_input, "11:01 AM    |    Today"))
    $(".msg_history").scrollTop($(".msg_history").height())
  }
}

var send_button = $(".msg_send_btn");
var send_text = $(".write_msg");
send_button.on("click", click_send);
send_text.on("keypress", click_send)

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
    var item = event.data;
    try{
        var json_item = JSON.parse(event.data);
        console.log(json_item);
        if (json_item.type === "chat"){
            var text_input = json_item.text;
            $(".msg_history").append(make_incoming_msg(text_input, "11:01 AM    |    Today"));
            $(".msg_history").scrollTop($(".msg_history").height());
        } else if (json_item.type === "join"){
            $(".inbox_chat").append(make_inbox_chat(json_item.from, "Online 💚 "))
        }else if (json_item.type === "quit"){
            $("#" + json_item.from).find("p").text("Offline 💔");
            $("#" + json_item.from).remove()
        }
    }
    catch(error){
        console.log(item);
    }
};

function make_outgoing_msg(text, time){
    output = '<div class="outgoing_msg">'+
        '<div class="sent_msg"><p>'+
        text +
        '</p><span class="time_date">' + time + 
        '</span> </div></div>'
    return output
}

function make_incoming_msg(text, time){
    output = '<div class="incoming_msg">' + 
    '<div class="incoming_msg_img"><img src="https://ptetutorials.com/images/user-profile.png" alt="sunil"></div>' + 
    '<div class="received_msg">' + 
      '<div class="received_withd_msg"><p>' + 
        text +
        '</p><span class="time_date">' + time + '</span></div></div></div>'
    return output
}

function make_inbox_chat(name, active_status){
    output = '<div class="chat_list"'+ ' id="'+ name+ '">' + 
                '<div class="chat_people">' + 
                '<div class="chat_img"> <img src="https://ptetutorials.com/images/user-profile.png" alt="sunil"> </div>' +
                '<div class="chat_ib"><h5>' + 
                    name + 
                    '<span class="chat_date">Dec 25</span></h5>' + 
                    '<p>'+active_status+'</p></div></div></div>'
    return output
}