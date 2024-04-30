const helper = require('./helper.js');
const React = require('react');
const { useState, useEffect } = React;
const { createRoot } = require('react-dom/client');
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeKatex from 'rehype-katex'
import remarkMath from 'remark-math'

// handles the logic to send a message create request to the server
const handleMessage = (action, onMessageAdded) => {
    // e.preventDefault();

    const channel = document.querySelector('#channelForm input[name="channel"]:checked').value;
    const message = document.querySelector('.textarea').value;

    helper.sendPost(action, { channel, message }, onMessageAdded);

    document.querySelector('.textarea').value = '';
    document.querySelector('.textarea').rows = '1';

    return false;
}

// creates the form that is used to make messages
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
            <textarea class="textarea has-fixed-size has-text-white" rows="1" name="message" placeholder={"Type your " + props.channelNames[props.currentChannelID-1] + " message here..."} onChange={(e) => e.target.rows = calcBulmaRows(e.target.value)}></textarea>
        </form>
    );
}

// creates the list of messages that are displayed in the center of the page
const MessageList = (props) => {
    const [messages, setMessages] = useState(props.messages);

    // fetches the list of messages from the server
    useEffect(() => {
        const loadMessagesFromServer = async () => {
            const response = await fetch(`/getMessages`);
            await response.json().then((e) => {

                // updates html to reflect the current channel selected
                let currentChannel = document.querySelector(`#channelForm input[value="${e.channel}"]`);
                props.setCurrentChannelID(e.channel);
                currentChannel.checked = true;
                currentChannel.parentElement.prevSelect = currentChannel.value;

                //document.querySelector('textarea').placeholder = `Type your ${currentChannel.id} message here...`;

                // if the user has not bought premium, display the go premium button and ads
                if (!e.hasBoughtPremium) {
                    props.hasNotBoughtPremium();
                    document.querySelector('#goPremium').style.display = 'block';
                }

                setMessages(e.messages);
            });
        };

        loadMessagesFromServer();
    }, [props.reloadMessages]);

    // function that handles editing a message
    const editMessage = (e, id) => {
        // makes target element editable
        let target = e.target.parentElement.children[0];
        let originalMessage = target.textContent;
        target.contentEditable = "true";

        target.focus();

        // sets up event listeners for ending editing
        target.onkeydown = (e) => {
            if (e.keyCode === 13 && !e.shiftKey) {
                let newMessage = target.textContent;
                target.blur();
                helper.sendPost(`/editMessage`, { id: id, message: newMessage });

                createRoot(target).render(<Markdown remarkPlugins={[[remarkGfm], [remarkMath]]} rehypePlugins={[rehypeKatex]} class="messageMessage">{newMessage}</Markdown>);
            }
            else if (e.keyCode === 27) { target.blur(); }
        };

        // when the element loses focus it will revert to its original message
        target.onblur = () => {
            target.textContent = originalMessage;
            target.contentEditable = "false";
        }
    };

    // if there are no messages, display a default message 
    if (messages.length === 0) {
        return (
            <div className="messageList">
                <h3 className="emptyMessage">No Messages Yet!</h3>
            </div>
        );
    }

    // constructs the list of messages
    const messageNodes = messages.map((message) => {
        const id = message._id;

        return (
            <div key={message._id} class="content message">
                <div>
                    <Markdown remarkPlugins={[[remarkGfm], [remarkMath]]} class="messageMessage">{message.message}</Markdown>
                </div>
                <button className="deleteMessage" onClick={() => helper.sendDelete(`/deleteMessage`, { id }, props.triggerReload)}>Delete</button>
                <button className="editMessage" onClick={(e) => editMessage(e, id)}>Edit</button>
            </div>
        );
    });

    // returns the constructed page of messages
    return (
        <div className="messageList">
            {messageNodes}
        </div>
    );
}

// creates the form that is used to change the channel
const ChannelForm = (props) => {

    // allows the user to edit the channel name
    const updateChannel = (e) => {
        let channelID = e.target.value;

        // if the user selects the same channel twice, allow them to edit the channel name
        if(e.target.parentElement.prevSelect === e.target.value) {
            let target = e.target.parentElement.querySelector(`label[for="${e.target.id}"]`);

            let oldChannel = target.textContent;
            target.contentEditable = "true";
    
            target.focus();
    
            // if the user presses enter, the channel name will be updated
            target.onkeydown = (e) => {
                if (e.keyCode === 13 && !e.shiftKey) {
                    let newMessage = target.textContent;
                    target.blur();
                    props.channelNames[channelID - 1] = newMessage;
                    props.setChannelNames(props.channelNames);
                    helper.sendPost(`/setChannelNames`, { channelNames: props.channelNames },props.triggerReload);
                    target.textContent = newMessage;
                    }
                // if the user presses escape, the channel name will revert to its original name
                else if (e.keyCode === 27) { target.blur(); }
            };
    
            // when the element loses focus it will revert to its original message
            target.onblur = () => {
                target.textContent = oldChannel;
                target.contentEditable = "false";
            };
            return;
        };

        e.target.parentElement.prevSelect = e.target.value;
        helper.sendPost(e.target.form.action, { channel: e.target.value }, props.triggerReload);
    }

    useEffect(() => {
        const loadChannelsFromServer = async () => {
            const response = await fetch(`/getChannels`);
            await response.json().then((e) => {
                props.setChannelNames(e.channels);
            });
        };
    
        loadChannelsFromServer();
    }, [props.reloadMessages]);



    return (
        <form id="channelForm" name="channelForm" action="/setAccountChannel" method="POST">
            <input type="radio" id="1" name="channel" value="1" onClick={updateChannel}/>
            <label htmlFor="1" >{props.channelNames[0]}</label>
            <input type="radio" id="2" name="channel" value="2" onClick={updateChannel} />
            <label htmlFor="2">{props.channelNames[1]}</label>
            <input type="radio" id="3" name="channel" value="3" onClick={updateChannel} />
            <label htmlFor="3">{props.channelNames[2]}</label>
        </form>
    );
};

// creates the form that is used to change the user's password
const ChangePasswordForm = (props) => {

    // function that handles sending the request to change the user's password
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

// constructs an ad panel
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

// constructs the side panel with the primary page control buttons
const AppOptionsPanel = (props) => {
    return (
        <div id="appOptionsPanel">
            <button id="goPremium" class="formSubmit" onClick={(e) => { goPremium(props.setHasBoughtPremium); e.target.style.display = "none" }} >Go Premium</button>
            <button id="changePassword" onClick={() => { document.querySelector('#blurBackground').style.display = 'block' }}>Change Password</button>
            <div class="navlink"><a href="/logout">Log out</a></div>
        </div>
    );
};

// function that updates html to reflect the user selecting premium
// sends the request to the server to activate premium
const goPremium = (callback) => {
    callback("hideAds");
    helper.sendPost('/activatePremium');
}

const MainMessageContent = (props) => {
    const [currentChannelID, setCurrentChannelID] = useState("1");

    return (
        <div id="contentMessages">
            <div id="displayChannelHeader">
                <h1>Current Channel: {props.channelNames[currentChannelID-1]}</h1>
            </div>
            <div id='messages'>
                <MessageList channel={currentChannelID} setCurrentChannelID={setCurrentChannelID} messages={[]} reloadMessages={props.reloadMessages} triggerReload={() => props.setReloadMessages(!props.reloadMessages)} hasNotBoughtPremium={() => props.setHasBoughtPremium("")} />
            </div>
            <div id='makeMessage'>
                <MessageForm triggerReload={() => props.setReloadMessages(!props.reloadMessages)} currentChannelID={currentChannelID} channelNames={props.channelNames}/>
            </div>
            <div id="blurBackground">
                <ChangePasswordForm></ChangePasswordForm>
            </div>
        </div>
    );
};

// constructs the main app
const App = () => {
    const [reloadMessages, setReloadMessages] = useState(false);
    const [hasBoughtPremium, setHasBoughtPremium] = useState("hideAds");
    const [channelNames, setChannelNames] = useState([]);

    return (
        <div id="app" >
            <AdsPanel class={hasBoughtPremium}/>
            <div id="mainAppContent">
                <div id="channelSelect">
                    <div>
                        <h1 class="is-size-3">Channels</h1>
                        <ChannelForm triggerReload={() => setReloadMessages(!reloadMessages)} channelNames={channelNames} setChannelNames={setChannelNames}/>
                    </div>
                    <AppOptionsPanel setHasBoughtPremium={setHasBoughtPremium} />
                </div>
                <MainMessageContent setReloadMessages={setReloadMessages} reloadMessages={reloadMessages} setHasBoughtPremium={setHasBoughtPremium} channelNames={channelNames}/>
            </div>
            <AdsPanel class={hasBoughtPremium} />
        </div>
    );
};

const init = () => {
    const root = createRoot(document.getElementById('app'));
    root.render(<App />);
}

window.onload = init;