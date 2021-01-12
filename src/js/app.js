import ChatController from './ChatController';

const ws = new WebSocket('wss://ahj-ws.herokuapp.com');
const chatCtrl = new ChatController(document.querySelector('.container'));

const form = document.querySelector('.form');
const textarea = document.querySelector('.textarea');
let nickname = null;

form.addEventListener('submit', (e) => {
  e.preventDefault();

  if (ws.readyState === 1) {
    const body = { type: 'authorization', name: form.name.value };
    ws.send(JSON.stringify(body));
  }
});

textarea.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    const body = {
      type: 'message', user: nickname, time: chatCtrl.getDate(), message: textarea.value,
    };
    ws.send(JSON.stringify(body));
    textarea.value = '';
  }
});

ws.onmessage = (response) => {
  const data = JSON.parse(response.data);

  if (data.type === 'authorization') {
    if (!data.name) {
      document.querySelector('.mistake').classList.add('active');
    } else {
      nickname = data.name;
      form.name.value = '';
      document.querySelector('.modal').classList.add('hidden');
      document.querySelector('.chat').classList.remove('hidden');
    }
  }

  if (data.type === 'message') {
    const { user, time, message } = data;
    if (user === nickname) {
      chatCtrl.addMessage('you', time, message);
    } else {
      chatCtrl.addMessage(user, time, message);
    }
  }

  if (!data.type) {
    chatCtrl.users.innerHTML = '';
    data.forEach((elem) => {
      if (elem === nickname) {
        chatCtrl.addUser('You');
      } else {
        chatCtrl.addUser(elem);
      }
    });
  }
};

window.onbeforeunload = () => {
  const body = { type: 'disconnect', name: nickname };
  ws.send(JSON.stringify(body));
  ws.close();
};
