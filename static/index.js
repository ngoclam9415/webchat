const name = prompt("Hello, would you mind insert your username ?? ");

class Storing_messages {
  constructor(name){
    this.name = name;
    this.member = {};
  }

  add_partner(partner_name){
    if (!(partner_name in this.member)){
      this.member[partner_name] = {
        receive : [],
        time : [],
        text : []
      }
    }
  }

  add_messages(partner_name, receive, text, time){
    this.member[partner_name].receive.push(receive);
    this.member[partner_name].text.push(text);
    this.member[partner_name].time.push(time)
  }
}

var message_storage = new Storing_messages(name);
var with_who = undefined;
var right_now = new Date()

$("h3.text-center").text("Hello "+name+". Start your conversation now.");

var ip_address = "192.168.1.65:5000"

const url = 'http://' + ip_address + '/insert_user';

$(".mesgs").hide()

const request = new Request(url, {method: 'POST',  body: JSON.stringify({username: name , time: right_now.getTime()})});

var ws = new WebSocket('ws://' + ip_address + '/ws');

function click_send(event){
  if (event.which === 1 || event.which === 13){
    var nearest_form = $(this).closest(".input_msg_write");
    var text_input = nearest_form.find(".write_msg").val();
    nearest_form.find(".write_msg").val("")
    console.log(text_input)
    var time = right_now.getHours()+":"+right_now.getMinutes()+'\t'+'|\t'+ right_now.toDateString()
    ws.send(JSON.stringify({username: name, type: "chat", with_person: with_who , text : text_input, time: right_now.getTime()}));
    $(".msg_history").append(make_outgoing_msg(text_input, time))
    message_storage.add_messages(with_who, receive=false, text=text_input, time=right_now.getTime())
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
    ws.send(JSON.stringify({username: name, type: "join", time: right_now.getTime()}));
    console.debug(response);
    // ...
  }).catch(error => {
    console.error(error);
  });

  const get_list_url = 'http://' + ip_address + '/list_users';
  const get_list_request = new Request(get_list_url, {method: 'GET'});
  fetch(get_list_request)
    .then(response => {
      if (response.status === 200){
        return response.json();
      } else {
        throw new Error("Get list user api error");
      }
    })
    .then(response => {
      // console.log(response.list_user);
      var list_users = response.list_user;
      var list_times = response.list_time;
      console.log(list_times)
      for (let index in list_users){
        if (list_users[index]===name){
          continue
        }
        var string_time = new Date(list_times[index]);
        var timestring = string_time.toDateString();
        $(".inbox_chat").append(make_inbox_chat(list_users[index], "Offline 💔 ", time=timestring));
        message_storage.add_partner(list_users[index])
        $("#"+list_users[index]).on("click dblclick", on_dbclick_to_chat);
      }
    }).catch(error =>{
      console.error(error);
    });

ws.onmessage = function (event) {
    var item = event.data;
    try{
        var json_item = JSON.parse(event.data);
        console.log(json_item);
        if (json_item.type === "chat"){
            var text_input = json_item.text;
            var time = right_now.getHours()+":"+right_now.getMinutes()+'\t'+'|\t'+ right_now.toDateString()
            if (json_item.from === with_who){
              $(".msg_history").append(make_incoming_msg(text_input, time));
            }
            message_storage.add_messages(partner_name=json_item.from, receive=false, text=text_input, time=right_now.getTime())
            $(".msg_history").scrollTop($(".msg_history").height());
        } else if (json_item.type === "join"){
          var current_time = new Date(json_item.time);
          var timestring = current_time.toDateString()
          console.log(timestring)
          $("#" + json_item.from).remove();
          $(".inbox_chat").append(make_inbox_chat(json_item.from, "Online 💚 ", time=timestring));
          console.log(json_query_item)
          var json_query_item = $("#" + json_item.from);
          if ($(".active_chat").length === 0){
            json_query_item.prependTo(json_query_item.parent());
          } else{
            json_query_item.insertAfter(".active_chat")
          }
          json_query_item.on("click dblclick", on_dbclick_to_chat)
        }else if (json_item.type === "quit"){
            // $("#" + json_item.from).remove()
            var current_time = new Date(json_item.time);
            var timestring = current_time.toDateString();
            console.log(timestring)
            $("#" + json_item.from).find("p").text("Offline 💔");
            $("#" + json_item.from).find(".chat_date").text(timestring);
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

function make_inbox_chat(name, active_status, time="Dec 25"){
    output = '<div class="chat_list"'+ ' id="'+ name+ '">' + 
                '<div class="chat_people">' + 
                '<div class="chat_img"> <img src="https://ptetutorials.com/images/user-profile.png" alt="sunil"> </div>' +
                '<div class="chat_ib"><h5>' + 
                    name + 
                    '<span class="chat_date">'+ time + '</span></h5>' + 
                    '<p>'+active_status+'</p></div></div></div>'
    return output
}

function on_dbclick_to_chat(){
  with_who = $(this).attr('id');
  $(".active_chat").removeClass("active_chat");
  if (with_who === undefined){
  } else {
    // $("#"+with_who).removeClass("active_chat");
    with_who = $(this).attr('id');
    var current_active_class = $("#"+with_who);
    current_active_class.addClass("active_chat")
    current_active_class.prependTo(current_active_class.parent())
  }
  // message_storage.add_partner(with_who)
  $(".msg_history").empty()
  if (message_storage.member[with_who].receive.length > 0){
    console.log("BAY VO DAY ROI NE")
    for (let index in message_storage.member[with_who].receive){
      if (message_storage.member[with_who].receive === true){
        $(".msg_history").append(make_incoming_msg(message_storage.member[with_who].text[index], get_chat_time(message_storage.member[with_who].time[index])));
      } else{
        $(".msg_history").append(make_outgoing_msg(message_storage.member[with_who].text[index], get_chat_time(message_storage.member[with_who].time[index])));
      }
    }
  }
  $(".mesgs").show()
}



function get_chat_time(timestamp){
  var time = new Date(timestamp);
  var return_time = time.getHours()+":"+time.getMinutes()+'\t'+'|\t'+ time.toDateString();
  return return_time
}