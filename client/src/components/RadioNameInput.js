import React, { useState, useEffect } from 'react';

function RadioNameInput({ onEntered }) {
  const [value, setValue] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const prevRadioName = localStorage.getItem('radioName');
    if(prevRadioName) {
      if (prevRadioName.trim().length > 0) {
        onEntered(prevRadioName.trim());
      } else {
        localStorage.removeItem('radioName');
      }
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const valueTrimmed = value.trim();
    if (valueTrimmed.length <= 0) {
      setError('ラジオネームは空欄にできません');
      setValue(valueTrimmed);
      return;
    }

    // submit the radio name
    localStorage.setItem('radioName', value);
    onEntered(value);
  };

  const handleChange = (e) => {
    setValue(e.target.value);
  };

  return (
    <div className="hero-body">
      <div className="container has-text-centered">
        <h1 className="title">
          Listener Hub へようこそ<br />
          ラジオネームをおうかがいします
        </h1>
        <form onSubmit={handleSubmit}>
          <div className="field is-grouped">
            <p className="control is-expanded">
              <input className="input is-large" type="text" value={value} onChange={handleChange} />
            </p>
            <p className="control">
              <button className="button is-info is-large" type="submit">
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

export default RadioNameInput;
