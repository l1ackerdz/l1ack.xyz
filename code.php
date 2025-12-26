<?php

$targetFile = __DIR__ . "/urls.txt";

/* Check if file uploaded */
if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
    http_response_code(400);
    die("No file uploaded or upload error");
}

/* Read uploaded file */
$uploadedUrls = file($_FILES['file']['tmp_name'], FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
if (!$uploadedUrls) {
    die("Invalid or empty file");
}

/* Load existing URLs */
$existingUrls = [];
if (file_exists($targetFile)) {
    $existingUrls = file($targetFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
}

/* Normalize existing URLs */
$existingUrls = array_map('trim', $existingUrls);

/* Add only new URLs */
$newUrls = [];
foreach ($uploadedUrls as $url) {
    $url = trim($url);
    if ($url === '') {
        continue;
    }
    if (!in_array($url, $existingUrls, true)) {
        $newUrls[] = $url;
        $existingUrls[] = $url; // prevent duplicates within same upload
    }
}

/* Save */
if (!empty($newUrls)) {
    file_put_contents($targetFile, implode(PHP_EOL, $newUrls) . PHP_EOL, FILE_APPEND | LOCK_EX);
}

/* Response */
echo "Added " . count($newUrls) . " new URLs\n";
