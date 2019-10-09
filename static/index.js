var name = prompt("Hello, would you mind insert your username ?? ")
// const insert_name = async() => {
//     const response = await fetch("http://localhost:5000/insert_user", {
//         method: "POST",
//         body: JSON.stringify({"username" : username}),
//         headers: {
//             'Content-Type': 'application/json'
//           }
//     });
//     console.log(response)
//     const json_value = await response.json();
//     alert(json_value.result)
// }

const url = 'http://localhost:5000/insert_user';
// const data = { username: name };
// const sending_infor = {
//     method: 'POST', // or 'PUT'
//     body: JSON.stringify(data), // data can be `string` or {object}!
//     headers: {
//       'Content-Type': 'application/json'
//     }
//   };

// try {
//   const response = await fetch(url, sending_infor);
//   const json = await response.json();
//   console.log('Success:', JSON.stringify(json));
// } catch (error) {
//   console.error('Error:', error);
// }
var formdata = new FormData();
formdata.append("username", name)

const request = new Request(url, {method: 'POST',  body: JSON.stringify({username: name})});
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
    console.alert(response)
    console.debug(response);
    // ...
  }).catch(error => {
    console.error(error);
  });