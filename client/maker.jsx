const helper = require('./helper.js');
const React = require('react');
const { useState, useEffect } = React;
const { createRoot } = require('react-dom/client');
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

const handleMessage = (action, onMessageAdded) => {
    // e.preventDefault();
    helper.hideError();

    const channel = document.querySelector('#channelForm input[name="channel"]:checked').value;
    const message = document.querySelector('.textarea').value;

    helper.sendPost(action, { channel, message }, onMessageAdded);

    document.querySelector('.textarea').value = '';

    return false;
}

const MessageForm = (props) => {
    const [channel, setChannel] = useState(props.channel);

    // Dealing with Textarea Height
    function calcHeight(value) {
        let numberOfLineBreaks = (value.match(/\n/g) || []).length;
        // min-height + lines x line-height + padding + border
        let newHeight = 20 + numberOfLineBreaks * 20 + 12 + 2;
        return newHeight;
    }

    return (
        <form id="messageForm"
            onSubmit={(e) => handleMessage(e.target.action, props.triggerReload)}
            name='messageForm'
            action="/maker"
            method="POST"
            className='messageForm'
            onKeyDown={(e) => { if (e.keyCode == 13 && !e.shiftKey) { handleMessage(e.target.parentElement.action, props.triggerReload); e.preventDefault(); } }}
        >
            <textarea class="textarea" name="message" placeholder="Type your {} message here..." onKeyUp={(e) => e.target.style.height = calcHeight(e.target.value) + "px"}></textarea>
            {/* <span class="textarea" role="textbox" contenteditable="true"></span> */}
        </form>
    );
}

const MessageList = (props) => {
    const [messages, setMessages] = useState(props.messages);
    const [channel, setChannel] = useState(props.channel);

    useEffect(() => {
        const loadMessagesFromServer = async (newChannel) => {
            const response = await fetch(`/getMessages?channel=${newChannel}`);
            const data = await response.json();
            setMessages(data.messages);
            return newChannel;
        };

        const loadChannelFromServer = async () => {
            await fetch('/getAccountChannel')
                .then(response => response.json())
                .then((responseJson) => {
                    setChannel(responseJson.channel);
                    let currentChannel = document.querySelector(`#channelForm input[value="${responseJson.channel}"]`);
                    currentChannel.checked = true;
                    document.querySelector('#displayChannelHeader').innerHTML = `<h1>Current Channel: ${currentChannel.id}</h1>`;
                    document.querySelector('textarea').placeholder = `Type your ${currentChannel.id} message here...`;
                    return responseJson.channel;
                })
                .then((newChannel) => loadMessagesFromServer(newChannel))
        }

        loadChannelFromServer();
    }, [props.reloadMessages]);

    if (messages.length === 0) {
        return (
            <div className="messageList">
                <h3 className="emptyMessage">No Messages Yet!</h3>
            </div>
        );
    }

    const messageNodes = messages.map((message) => {
        const id = message._id;

        console.log(message.message);

        return (
            <div key={message._id} className="message">
                <Markdown remarkPlugins={[remarkGfm]} className="messageMessage">{message.message}</Markdown>
                <button className="deleteMessage" onClick={() => helper.sendDelete(`/deleteMessage`, { id }, props.triggerReload)}>Delete</button>
            </div>
        );
    });

    return (
        <div className="messageList">
            {messageNodes}
        </div>
    );
}

const ChannelForm = (props) => {
    const updateChannel = (e) => {
        helper.sendPost(e.target.form.action, { channel: e.target.value }, props.triggerReload);
    }

    return (
        <form id="channelForm" name="channelForm" action="/setAccountChannel" method="POST">
            <input type="radio" id="general" name="channel" value="1" onClick={updateChannel} />
            <label htmlFor="general">General</label>
            <input type="radio" id="random" name="channel" value="2" onClick={updateChannel} />
            <label htmlFor="random">Random</label>
            <input type="radio" id="other" name="channel" value="3" onClick={updateChannel} />
            <label htmlFor="other">Other</label>
        </form>
    );
};

const App = () => {
    const [reloadMessages, setReloadMessages] = useState(false);

    return (
        <div id="content">
            <div id="channelSelect">
                <h1>Channels</h1>
                <ChannelForm triggerReload={() => setReloadMessages(!reloadMessages)} />
            </div>
            <div id="contentMessages">
                <div id="displayChannelHeader">
                    <h1>Current Channel</h1>
                </div>
                <div id='messages'>
                    <MessageList channel={"1"} messages={[]} reloadMessages={reloadMessages} triggerReload={() => setReloadMessages(!reloadMessages)} />
                </div>
                <div id='makeMessage'>
                    <MessageForm triggerReload={() => setReloadMessages(!reloadMessages)} />
                </div>
            </div>
        </div>
    );
};

const init = () => {
    const root = createRoot(document.getElementById('app'));
    root.render(<App />);
}

window.onload = init;