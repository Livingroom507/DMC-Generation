<?php
require_once 'auth_check.php';

if (!file_exists('vendor/autoload.php')) {
    http_response_code(500);
    echo json_encode(['error' => 'Composer dependencies not installed. Please run "composer install".']);
    exit;
}
require 'vendor/autoload.php';

use Google\Analytics\Data\V1beta\BetaAnalyticsDataClient;
use Google\Analytics\Data\V1beta\DateRange;
use Google\Analytics\Data\V1beta\Dimension;
use Google\Analytics\Data\V1beta\Metric;
use Google\Analytics\Data\V1beta\OrderBy;

header('Content-Type: application/json');

// Configuration - update env + credentials path for production
$property_id = getenv('GA4_PROPERTY_ID') ?: 'YOUR_GA4_PROPERTY_ID';
$credentials_path = __DIR__ . '/credentials.json';

function respondError($message, $status = 500) {
    http_response_code($status);
    echo json_encode(['error' => $message]);
    exit;
}

if (empty($property_id) || $property_id === 'YOUR_GA4_PROPERTY_ID') {
    respondError('GA4 property ID is not configured. Set GA4_PROPERTY_ID environment variable or update ga4_metrics.php.');
}

if (!file_exists($credentials_path)) {
    respondError('GA4 credentials file not found: ' . $credentials_path);
}

try {
    if (!class_exists(BetaAnalyticsDataClient::class)) {
        respondError('Google Analytics Data Client library not found. Run composer install.');
    }

    $client = new BetaAnalyticsDataClient(['credentials' => $credentials_path]);

    // Helper to avoid repeated checks when response contains no rows
    $safeRows = function($response) {
        return is_callable([$response, 'getRows']) ? $response->getRows() : [];
    };

    // 1. Regional Engagement (Clicks by Country)
    $regionalResponse = $client->runReport([
        'property' => 'properties/' . $property_id,
        'dimensions' => [new Dimension(['name' => 'country'])],
        'metrics' => [new Metric(['name' => 'eventCount'])],
        'dateRanges' => [new DateRange(['start_date' => '14daysAgo', 'end_date' => 'today'])],
        'limit' => 5
    ]);

    $regional = ['labels' => [], 'data' => []];
    foreach ($safeRows($regionalResponse) as $row) {
        $dim = $row->getDimensionValues()[0] ?? null;
        $met = $row->getMetricValues()[0] ?? null;
        $regional['labels'][] = $dim ? $dim->getValue() : 'Unknown';
        $regional['data'][] = $met ? (int)$met->getValue() : 0;
    }

    // 2. Content Interest Split
    $splitResponse = $client->runReport([
        'property' => 'properties/' . $property_id,
        'dimensions' => [new Dimension(['name' => 'eventName'])],
        'metrics' => [new Metric(['name' => 'eventCount'])],
        'dateRanges' => [new DateRange(['start_date' => '14daysAgo', 'end_date' => 'today'])],
    ]);

    $split = ['practical' => 0, 'managerial' => 0];
    foreach ($safeRows($splitResponse) as $row) {
        $name = $row->getDimensionValues()[0]->getValue() ?? '';
        $val = $row->getMetricValues()[0]->getValue() ?? '0';
        $valInt = (int)$val;
        if ($name !== '' && stripos($name, 'practical') !== false) {
            $split['practical'] += $valInt;
        }
        if ($name !== '' && stripos($name, 'managerial') !== false) {
            $split['managerial'] += $valInt;
        }
    }

    // 3. 2-Week Trend (Daily event count)
    $trendResponse = $client->runReport([
        'property' => 'properties/' . $property_id,
        'dimensions' => [new Dimension(['name' => 'date'])],
        'metrics' => [new Metric(['name' => 'eventCount'])],
        'dateRanges' => [new DateRange(['start_date' => '14daysAgo', 'end_date' => 'today'])],
        'orderBys' => [new OrderBy(['dimension' => new OrderBy\DimensionOrderBy(['dimension_name' => 'date'])])]
    ]);

    $trend = ['labels' => [], 'data' => []];
    foreach ($safeRows($trendResponse) as $row) {
        $dateStr = $row->getDimensionValues()[0]->getValue() ?? '';
        $trend['labels'][] = $dateStr ? date('M d', strtotime($dateStr)) : '';
        $trend['data'][] = (int)($row->getMetricValues()[0]->getValue() ?? 0);
    }

    echo json_encode([
        'regional' => $regional,
        'split' => [$split['practical'], $split['managerial']],
        'trend' => $trend,
        'totalClicks' => array_sum($regional['data'])
    ]);

} catch (Throwable $e) {
    respondError('GA4 API error: ' . $e->getMessage(), 500);
}
?>