const helper = require('./helper.js');
const React = require('react');
const { createRoot } = require('react-dom/client');

const handleLogin = (e) => {
    e.preventDefault();

    const username = e.target.querySelector('#user').value;
    const pass = e.target.querySelector('#pass').value;

    if (!username || !pass) {
        helper.handleResponseMessage(document.querySelector("#loginOutput"), 'Username or password is empty!');
        return false;
    }

    helper.sendPost(e.target.action, { username, pass },{}, document.querySelector("#loginOutput"));
    return false;
}

const handleSignup = (e) => {
    e.preventDefault();
    let signupOutput = document.querySelector("#signupOutput");

    const username = e.target.querySelector("#user").value;
    const pass = e.target.querySelector("#pass").value;
    const pass2 = e.target.querySelector("#pass2").value;

    if (!username || !pass || !pass2) {
        helper.handleResponseMessage(signupOutput, 'All fields are required!');
        return false;
    }

    if (pass !== pass2) {
        helper.handleResponseMessage(signupOutput, 'Passwords do not match!');
        return false;
    }

    helper.sendPost(e.target.action, { username, pass, pass2 }, {}, signupOutput);

    return false;
}

const LoginWindow = (props) => {
    return (
        <form id="loginForm"
            name="loginForm"
            onSubmit={handleLogin}
            action='/login'
            method='POST'
            className='mainForm'
        >
            <h1 class="is-size-1 has-text-centered">Login</h1>
            <div>
                <label htmlFor='username'>Username: </label>
                <input id='user' type='text' name='username' placeholder='username' />
                <label htmlFor='pass'>Password:</label>
                <input id='pass' type='password' name='pass' placeholder='password' />
            </div>
            <input className='formSubmit' type='submit' value="Log In" />
            <p id="loginOutput"></p>
        </form>
    );
}

const SignupWindow = (props) => {
    return (
        <form
            id='signupForm'
            name='signupForm'
            onSubmit={handleSignup}
            action='/signup'
            method='POST'
            className='mainForm'
        >
            <h1 class="is-size-1 has-text-centered">Sign Up</h1>

            <div>
                <label htmlFor='username'>Username: </label>
                <input id='user' type='text' name='username' placeholder='username' />
                <label htmlFor='pass'>Password: </label>
                <input id='pass' type='password' name='pass' placeholder='password' />
                <label htmlFor='pass2'>Password: </label>
                <input id='pass2' type='password' name='pass2' placeholder='retype password' />
            </div>
            <input className='formSubmit' type='submit' value='Sign up' />
            <p id="signupOutput"></p>
        </form>
    );
}

const init = () => {
    const loginButton = document.getElementById('loginButton');
    const signupButton = document.getElementById('signupButton');

    const root = createRoot(document.getElementById('content'));

    loginButton.addEventListener('click', (e) => {
        e.preventDefault();
        root.render(<LoginWindow />);
        return false;
    });

    signupButton.addEventListener('click', (e) => {
        e.preventDefault();
        root.render(<SignupWindow />);
        return false;
    });

    root.render(<LoginWindow />);
}

window.onload = init;