import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';

import classnames from 'classnames';

require('../style.scss');

import io from 'socket.io-client';

import api from './api';

//const WS_SERVER = `${location.protocol}//${location.hostname}:3000`;
const WS_SERVER = 'https://takaki-personal.an.r.appspot.com';

const socket = io(WS_SERVER);

const seList = require('../sound_effects.json');

import Authorizer from './Authorizer';

function App() {
  const [fatalError, setFaltalError] = useState(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [socketId, setSocketId] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [logs, setLogs] = useState([]);

  const isOpenRef = React.useRef(isOpen);

  const updateStatus = async () => {
    let response;
    try {
      response = await api.getStatus(socket.id);
    } catch (e) {
      setFaltalError(e.message);
      return;
    }

    if (response.admin && response.admin === true) {
      setIsAuthorized(true);
    } else {
      setIsAuthorized(false);
    }
  };

  const updateSocketId = () => {
    setSocketId(socket.id);
  };

  const playSE = (data) => {
    const log = {
      action: 'PLAY_SE',
      title: 'SE再生',
      listenerName: data.listenerName,
      fileName: data.fileName,
      date: new Date().toString(),
      detail: '再生済',
    };
    if (isOpenRef.current) {
      const sound = new Audio(`./sounds/${data.fileName}`);
      sound.play();
    } else {
      log.detail = 'ミュート中のため未再生'
    }
    setLogs((prevLogs) => [...prevLogs, log]);
  };

  useEffect(() => {
    socket.on('connect', () => {
      setFaltalError(null);
      updateSocketId();
    });

    socket.on('connect_error', (error) => {
      setFaltalError('サーバーに接続できません');
    });

    socket.on('disconnect', () => {
      setFaltalError('サーバーとの接続が切断されました');
    });

    socket.on('REQUEST_RECEIVED', (data) => {
      console.log(data);
      if (data.action === 'PLAY_SE') {
        (() => playSE(data))();
      }
    });

    updateStatus();

    return () => {
      socket.off('REQUEST_RECEIVED');
    };
  }, []);

  if (fatalError) {
    return (
      <div className="notification is-danger mt-5">
        {fatalError}
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <Authorizer socketId={socketId} updateSocketId={updateSocketId} onAuthorized={() => updateStatus()} />
    );
  }

  const statusButtonClass = classnames({
    button: true,
    'is-medium': true,
    'is-fullwidth': true,
    'mt-5': true,
    'is-primary': isOpen,
    'is-danger': !isOpen,
  });

  const toggleOpenStatus = () => {
    isOpenRef.current = !isOpen;
    setIsOpen(!isOpen);
  };

  return (
    <div className="container is-fluid">
      <button className={statusButtonClass} onClick={() => toggleOpenStatus()}>
      {isOpen && '受付中（クリックしてミュート）'}
      {!isOpen && 'ミュート中（クリックして解除）'}
      </button>
      <div className="columns">
        <div className="column">
          <article className="message mt-5">
            <div className="message-header">
              <p>ログ</p>
              <p>総件数: {logs.length}</p>
            </div>
            <div className="message-body">
              <ul>
                {logs.map((log) => <li key={log.date + log.listenerName}>{log.title} [{log.fileName}] ({log.detail}) by {log.listenerName} at {log.date}</li>)}
              </ul>
            </div>
          </article>
        </div>
      </div>
    </div>
  );
};

const rootContainer = document.querySelector('#root');
ReactDOM.render(React.createElement(App), rootContainer);
