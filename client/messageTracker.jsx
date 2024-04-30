const helper = require('./helper.js');
const React = require('react');
const { useState, useEffect } = React;
const { createRoot } = require('react-dom/client');
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

const handleMessage = (action, onMessageAdded) => {
    // e.preventDefault();

    const channel = document.querySelector('#channelForm input[name="channel"]:checked').value;
    const message = document.querySelector('.textarea').value;

    helper.sendPost(action, { channel, message }, onMessageAdded);

    document.querySelector('.textarea').value = '';
    document.querySelector('.textarea').rows = '1';

    return false;
}

const MessageForm = (props) => {
    // Dealing with Textarea Height
    function calcBulmaRows(value) {
        return ((value.match(/\n/g) || []).length + 1).toString();
    }

    return (
        <form id="messageForm"
            onSubmit={(e) => handleMessage(e.target.action, props.triggerReload)}
            name='messageForm'
            action="/makeMessage"
            method="POST"
            class='messageForm'
            onKeyDown={(e) => { if (e.keyCode == 13 && !e.shiftKey) { handleMessage(e.target.parentElement.action, props.triggerReload); e.preventDefault(); } }}
        >
            <textarea class="textarea has-fixed-size has-text-white" rows="1" name="message" placeholder="Type your general message here..." onChange={(e) => e.target.rows = calcBulmaRows(e.target.value)}></textarea>
        </form>
    );
}

const MessageList = (props) => {
    const [messages, setMessages] = useState(props.messages);

    useEffect(() => {
        const loadMessagesFromServer = async () => {
            const response = await fetch(`/getMessages`);
            const data = await response.json().then((e) => {
                let currentChannel = document.querySelector(`#channelForm input[value="${e.channel}"]`);
                currentChannel.checked = true;
                document.querySelector('#displayChannelHeader').innerHTML = `<h1>Current Channel: ${currentChannel.id}</h1>`;
                document.querySelector('textarea').placeholder = `Type your ${currentChannel.id} message here...`;

                if (!e.hasBoughtPremium) {
                    props.hasNotBoughtPremium();
                    document.querySelector('#goPremium').style.display = 'block';
                }

                setMessages(e.messages);
            });
        };

        loadMessagesFromServer();
    }, [props.reloadMessages]);

    const editMessage = (e, id) => {
        let target = e.target.parentElement.children[0];
        let originalMessage = target.textContent;
        target.contentEditable = "true";

        target.focus();
        target.onkeydown = (e) => {
            if (e.keyCode === 13 && !e.shiftKey) {
                let newMessage = target.textContent;
                target.blur();
                helper.sendPost(`/editMessage`, { id: id, message: newMessage });
                createRoot(target).render(<Markdown remarkPlugins={[remarkGfm]} class="messageMessage">{newMessage}</Markdown>);
            }
            else if (e.keyCode === 27) { target.blur(); }
        };

        target.onblur = () => {
            target.textContent = originalMessage;
            target.contentEditable = "false";
        }
    };

    if (messages.length === 0) {
        return (
            <div className="messageList">
                <h3 className="emptyMessage">No Messages Yet!</h3>
            </div>
        );
    }

    const messageNodes = messages.map((message) => {
        const id = message._id;

        return (
            <div key={message._id} class="content message">
                <div>
                    <Markdown remarkPlugins={[remarkGfm]} class="messageMessage">{message.message}</Markdown>
                </div>
                <button className="deleteMessage" onClick={() => helper.sendDelete(`/deleteMessage`, { id }, props.triggerReload)}>Delete</button>
                <button className="editMessage" onClick={(e) => editMessage(e, id)}>Edit</button>
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

const ChangePasswordForm = (props) => {
    const handleChange = (e) => {
        e.preventDefault();

        const pass = document.querySelector('#pass').value;
        const pass2 = document.querySelector('#pass2').value;

        helper.sendPost(e.target.action, { pass, pass2 }, () => {
            document.querySelector('#pass').value = '';
            document.querySelector('#pass2').value = '';
        }, changePasswordServerResponse);

        return false;
    }

    return (
        <div id="changePasswordForm">
            <button id="closeChangePassword" onClick={() => document.querySelector('#blurBackground').style.display = 'none'}>X</button>
            <form
                id="changePSForm"
                name="changePasswordForm"
                onSubmit={handleChange}
                action="/changePassword"
                method="POST"
            >

                <h1 class="is-size-1 has-text-centered">Change Password</h1>
                <label htmlFor="pass">Password: </label>
                <input id="pass" type="password" name="pass" placeholder="password" />
                <label htmlFor="pass2">Retype Password: </label>
                <input id="pass2" type="password" name="pass2" placeholder="retype password" />
                <input className="formSubmit" type="submit" value="Change password" />
            </form>
            <p id="changePasswordServerResponse"></p>
        </div>

    );
}

const AdsPanel = (props) => {
    return (
        <div id="adsPanel" class={props.class}>
            <h1>Ads</h1>
            <div></div>
            <div></div>
            <div></div>
        </div>
    );
}

const goPremium = (callback) => {
    callback("hideAds");
    helper.sendPost('/activatePremium');
}

const App = () => {
    const [reloadMessages, setReloadMessages] = useState(false);
    const [hasBoughtPremium, setHasBoughtPremium] = useState("hideAds");

    return (
        <div id="app">
            <AdsPanel class={hasBoughtPremium}/>
            <div id="mainAppContent">
                <div id="channelSelect">
                    <div>
                        <h1 class="is-size-3">Channels</h1>
                        <ChannelForm triggerReload={() => setReloadMessages(!reloadMessages)} />
                    </div>
                    <div>
                        <button id="goPremium" class="formSubmit" onClick={(e) => { goPremium(setHasBoughtPremium); e.target.style.display = "none" }} >Go Premium</button>
                        <button id="changePassword" onClick={() => { document.querySelector('#blurBackground').style.display = 'block' }}>Change Password</button>
                        <div class="navlink"><a href="/logout">Log out</a></div>
                    </div>
                </div>
                <div id="contentMessages">
                    <div id="displayChannelHeader">
                        <h1>Current Channel</h1>
                    </div>
                    <div id='messages'>
                        <MessageList channel={"1"} messages={[]} reloadMessages={reloadMessages} triggerReload={() => setReloadMessages(!reloadMessages)} hasNotBoughtPremium={() => setHasBoughtPremium("")} />
                    </div>
                    <div id='makeMessage'>
                        <MessageForm triggerReload={() => setReloadMessages(!reloadMessages)} />
                    </div>
                    <div id="blurBackground">
                        <ChangePasswordForm></ChangePasswordForm>
                    </div>
                </div>
            </div>
            <AdsPanel class={hasBoughtPremium}/>
        </div>
    );
};

const init = () => {
    const root = createRoot(document.getElementById('app'));
    root.render(<App />);
}

window.onload = init;