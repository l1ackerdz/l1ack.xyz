<?php
if (isset($_GET['redirect'])) {
    $url = $_GET['redirect'];

    // Validate URL to prevent open redirect vulnerabilities
    if (filter_var($url, FILTER_VALIDATE_URL)) {
        header("Location: " . $url);
        exit();
    } else {
        echo "Invalid URL";
    }
} else {
    echo "No redirect parameter provided.";
}
?>
