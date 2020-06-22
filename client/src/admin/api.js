//const API_BASE = `${location.protocol}//${location.hostname}:3000/`;
const API_BASE = 'https://takaki-personal.an.r.appspot.com/';

function getData(url = '') {
  return fetch(url)
  .then((response) => response.json());
}

function postData(url = '', data = {}) {
  return fetch(url, {
      method: 'POST',
      mode: 'cors',
      cache: 'no-cache',
      headers: {
          'Content-Type': 'application/json; charset=utf-8',
          // 'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: JSON.stringify(data), // 本文のデータ型は "Content-Type" ヘッダーと一致する必要があります
  })
  .then(response => response.json());
}

const getStatus = (socketId) => getData(`${API_BASE}is_authorized?socketId=${socketId}`);

const authorize = (key, socketId) => postData(`${API_BASE}authorize`, { key, socketId });

export default {
  getStatus,
  authorize,
};
