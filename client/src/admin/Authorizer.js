import React, { useState, useEffect } from 'react';
import classnames from 'classnames';

import api from './api';

function Authorizer({ socketId, updateSocketId, onAuthorized }) {
  const [value, setValue] = useState('');
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const valueTrimmed = value.trim();
    setValue(valueTrimmed);
    if (valueTrimmed.length <= 0) {
      setError('入力してください');
      return;
    }

    updateSocketId();

    setIsProcessing(true);

    let response;
    try {
      response = await api.authorize(valueTrimmed, socketId);
    } catch (e) {
      setError(e.message);
      return;
    } finally {
      setIsProcessing(false);
    }

    if (response.result && response.result === 'ok') {
      onAuthorized();
    } else {
      setError(response.message);
    }

    setIsProcessing(false);
  };

  const handleChange = (e) => {
    setValue(e.target.value);
  };

  const inputClassName = classnames({
    input: true,
    'is-large': true,
    'is-loading': isProcessing,
  });

  const buttonClassName = classnames({
    button: true,
    'is-info': true,
    'is-large': true,
    'is-loading': isProcessing,
  });

  return (
    <div className="hero-body">
      <div className="container has-text-centered">
        <h1 className="title">
          Admin Hub へようこそ<br />
          事前共有キーを入力してください
        </h1>
        <form onSubmit={handleSubmit}>
          <div className="field is-grouped">
            <p className="control is-expanded">
              <input className={inputClassName} type="text" value={value} onChange={handleChange} />
            </p>
            <p className="control">
              <button className={buttonClassName} type="submit">
                送信
              </button>
            </p>
          </div>
        </form>
        {error.length > 0 && <article className="message is-danger mt-2">
          <div className="message-body">{error}</div>
        </article>}
      </div>
    </div>
  );
};

export default Authorizer;
