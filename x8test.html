<?php
// Check if any parameters were submitted
$params = [
    'search' => $_GET['search'] ?? null,
    'query' => $_GET['query'] ?? null,
    'filter' => $_GET['filter'] ?? null,
    'sort' => $_GET['sort'] ?? null,
    'debug' => $_GET['debug'] ?? null
];

// Check if we should show the form or results
$show_form = true;
foreach ($params as $value) {
    if ($value !== null) {
        $show_form = false;
        break;
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Parameter Reflection Tester</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        .container { background: #f5f5f5; padding: 20px; border-radius: 5px; }
        .result { margin-top: 20px; padding: 15px; background: #e9e9e9; border-radius: 5px; }
        .reflected { color: #d63384; font-weight: bold; }
        .param { margin-bottom: 10px; padding: 10px; background: #fff; border-radius: 3px; }
        input[type="text"] { width: 100%; padding: 8px; margin: 5px 0 15px; }
        button { background: #4CAF50; color: white; padding: 10px 15px; border: none; cursor: pointer; }
        button:hover { background: #45a049; }
        pre { background: #333; color: #f8f8f8; padding: 10px; border-radius: 3px; }
    </style>
</head>
<body>
    <div class="container">
        <?php if ($show_form): ?>
            <h1>Parameter Reflection Test Page</h1>
            <form method="GET">
                <div>
                    <label for="search">Search Parameter:</label>
                    <input type="text" id="search" name="search" placeholder="Try 'test'">
                </div>
                <div>
                    <label for="query">Query Parameter:</label>
                    <input type="text" id="query" name="query" placeholder="Try 'test'">
                </div>
                <div>
                    <label for="filter">Filter Parameter:</label>
                    <input type="text" id="filter" name="filter" placeholder="Try 'test'">
                </div>
                <div>
                    <label for="sort">Sort Parameter:</label>
                    <input type="text" id="sort" name="sort" placeholder="Try 'test'">
                </div>
                <div>
                    <label for="debug">Debug Parameter:</label>
                    <input type="text" id="debug" name="debug" placeholder="Try 'test'">
                </div>
                <button type="submit">Test Reflection</button>
            </form>
            
            <div style="margin-top: 30px;">
                <h3>Direct URL Examples:</h3>
                <pre>
<?= htmlspecialchars($_SERVER['PHP_SELF']) ?>?search=test
<?= htmlspecialchars($_SERVER['PHP_SELF']) ?>?query=test
<?= htmlspecialchars($_SERVER['PHP_SELF']) ?>?filter=test
<?= htmlspecialchars($_SERVER['PHP_SELF']) ?>?sort=test
<?= htmlspecialchars($_SERVER['PHP_SELF']) ?>?debug=test
                </pre>
            </div>
        <?php else: ?>
            <h1>Reflection Results</h1>
            <div class="result">
                <?php foreach ($params as $name => $value): ?>
                    <?php if ($value !== null): ?>
                        <div class="param">
                            <strong><?= htmlspecialchars($name) ?>:</strong>
                            <span class="reflected"><?= htmlspecialchars($value) ?></span>
                        </div>
                    <?php endif; ?>
                <?php endforeach; ?>
            </div>
            <p><a href="<?= htmlspecialchars($_SERVER['PHP_SELF']) ?>">← Back to test form</a></p>
            
            <div style="margin-top: 30px;">
                <h3>Current URL:</h3>
                <pre><?= htmlspecialchars($_SERVER['REQUEST_URI']) ?></pre>
            </div>
        <?php endif; ?>
    </div>
</body>
</html>
