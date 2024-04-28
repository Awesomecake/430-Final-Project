/* Takes in an error message. Sets the error message up in html, and
   displays it to the user. Will be hidden by other events that could
   end in an error.*/
const handleResponseMessage = (messageTarget, message) => {
    messageTarget.textContent = message;
};

/* Sends post requests to the server using fetch. Will look for various
   entries in the response JSON object, and will handle them appropriately.
*/
const sendPost = async (url, data, handler, outputTarget) => {
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });

    const result = await response.json();

    if (result.redirect) {
        window.location = result.redirect;
    }

    if (result.error && outputTarget) {
        handleResponseMessage(outputTarget, result.error);
    }
    else if (result.message && outputTarget) {
        handleResponseMessage(outputTarget, result.message);
    }

    if(handler)
    {
        handler(result);
    }
};

const sendDelete = async (url, data, handler, outputTarget) => {
    const response = await fetch(url, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    });

    const result = await response.json();

    if (result.error) {
        handleResponseMessage(outputTarget, result.error);
    }

    if(handler)
    {
        handler(result);
    }
}

module.exports = {
    handleResponseMessage,
    sendPost,
    sendDelete
}