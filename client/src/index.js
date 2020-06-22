import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';

require('./style.scss');

import io from 'socket.io-client';

import classNames from 'classnames';

import RadioNameInput from './components/RadioNameInput';

//const WS_SERVER = `${location.protocol}//${location.hostname}:3000`;
const WS_SERVER = 'https://takaki-personal.an.r.appspot.com';

const socket = io(WS_SERVER);

const heroWrapper = document.querySelector('#heroWrapper');

const seList = require('./sound_effects.json');

function App() {
  const [radioName, setRadioName] = useState('');
  const [fatalError, setFaltalError] = useState(null);
  const [nowPlaying, setNowPlaying] = useState(null);
  const [nowRequesting, setNowRequesting] = useState(null);

  useEffect(() => {
    socket.on('connect', () => {
      setFaltalError(null);
    });

    socket.on('connect_error', (error) => {
      setFaltalError('サーバーに接続できません');
    });

    socket.on('event', (data) => {
      console.log(data);
    });

    socket.on('disconnect', () => {
      setFaltalError('サーバーとの接続が切断されました');
    });

    socket.on('REQUEST_RESULT', (data) => {
      console.log(data);
      setNowRequesting(null);
    });

    return () => {
      socket.off('REQUEST_RESULT');
    };
  }, []);

  const handleEnterRadioName = (newRadioName) => {
    setRadioName(newRadioName);
  };

  const resetRadioName = () => {
    localStorage.removeItem('radioName');
    setRadioName('');
  };

  const playSound = (fileName) => {
    if(nowPlaying) {
      nowPlaying.pause();
    }
    const sound = new Audio(`sounds/${fileName}`);
    sound.play();
    setNowPlaying(sound);
  };

  const playSoundOnProgram = (fileName) => {
    socket.emit('PLAY_SE', {
      radioName,
      sound: fileName,
    });
    setNowRequesting(fileName);
  };

  if (fatalError) {
    heroWrapper.classList.remove('is-success');
    heroWrapper.classList.add('is-danger');

    return (
      <div className="hero-body">
        <div className="container has-text-centered">
          <h1 className="title">
            {fatalError}
          </h1>
          <p>
            受付時間外であるか、ネットワーク接続の問題により、サーバーに接続ができませんでした。
          </p>
        </div>
      </div>
    );
  } else {
    heroWrapper.classList.remove('is-danger');
    heroWrapper.classList.add('is-success');

    const requestButtonClass = classNames({
      button: true,
      'is-link': true,
      'is-loading': nowRequesting,
    });

    if (radioName.length > 0) {
      return (
        <>
          <div className="container is-fluid">
            <article className="message">
              <div className="message-header">
                <p>こんにちは、{radioName}さん!</p>
                <button className="button is-link" onClick={() => resetRadioName()}>
                  ラジオネームを変更
                </button>
              </div>
              <div className="message-body">
                このページでは、フラフラの生放送中にリスナーの皆様がお好きなタイミングで、お好きな効果音を鳴らすことができます！<br />
                なお、楽曲の途中や鳴らされすぎなときなど、一時的に受付を休止したり、特定のリスナーからの操作を個別に無効化することがあります。
                あらかじめご了承のうえ、モラルを守ってご利用ください。<br />
                なお、効果音の他に視聴者参加型コンテンツとして良いアイデアがございましたら、ぜひとも<a href="https://takaki.takeu.ch/radio/letter/">おたよりフォーム</a>からお寄せください。
              </div>
            </article>
          </div>
          <div className="hero-body">
            <div className="container has-text-centered">
              <h1 className="title">
                効果音
              </h1>
              {seList.map((se) => <div key={se.fileName} className="mt-5">
                <h2 className="is-size-4">{se.name}</h2>
                <div className="buttons is-centered">
                  <button className="button is-primary" onClick={() => playSound(se.fileName)}>試聴する</button>
                  <button className={requestButtonClass} onClick={() => playSoundOnProgram(se.fileName)}>番組内で鳴らす</button>
                </div>
              </div>)}
            </div>
          </div>
        </>
      );
    } else {
      return (
        <RadioNameInput onEntered={handleEnterRadioName} />
      );
    }
  }
};

const rootContainer = document.querySelector('#root');
ReactDOM.render(React.createElement(App), rootContainer);
