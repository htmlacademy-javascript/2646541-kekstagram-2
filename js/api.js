import { showAlert } from './form.js';

const GET_DATA_URL = 'https://31.javascript.htmlacademy.pro/kekstagram/data';
const SEND_DATA_URL = 'https://31.javascript.htmlacademy.pro/kekstagram';

const getData = (onSuccess) => {
  fetch(GET_DATA_URL)
    .then((response) => {
      if (response.ok) {
        return response.json();
      }
      return showAlert('Не удалось загрузить данные с сервера.');
    })
    .then((posts) => onSuccess(posts))
    .catch(() => showAlert('Не удалось загрузить данные с сервера.'));
};

const sendData = (onSuccess, onFail, body) => {
  fetch(SEND_DATA_URL, {
    method: 'POST',
    body,
  })
    .then((response) => {
      if (response.ok) {
        return onSuccess();
      }
      return onFail();
    })
    .catch(() => onFail());
};

export { getData, sendData };
