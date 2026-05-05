<?php require_once 'auth_check.php'; ?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>LIVINGROOM507MOC | Analytics Dashboard</title>
    <link rel="stylesheet" href="style.css">
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
</head>
<body>
    <nav class="mag-nav">
        <div class="nav-container">
            <a href="index.html">MAGAZINE HOME</a>
            <a href="admin_sync.php">CSV SYNC</a>
            <a href="logout.php">LOGOUT (<?php echo $_SESSION['username']; ?>)</a>
        </div>
    </nav>

    <section class="portal-container">
        <div class="container">
            <div style="display: flex; justify-content: space-between; align-items: flex-end;">
                <h2 class="numbered-header" style="flex: 1;">08. Operational Dashboard</h2>
                <button onclick="printDashboard()" class="btn-sync" style="width: auto; margin-bottom: 10px; padding: 10px 20px;">Print Weekly Review</button>
            </div>
            
            <?php if (isset($_GET['error']) && $_GET['error'] === 'unauthorized'): ?>
                <div class="alert-danger">Access Denied: Admin privileges required.</div>
            <?php endif; ?>

            <div class="dashboard-stats">
                <div class="stat-box">
                    <span>Total Engagement</span>
                    <h3 id="stat-total-clicks">14,205</h3>
                </div>
                <div class="stat-box">
                    <span>Avg. Conversion</span>
                    <h3>4.8%</h3>
                </div>
                <div class="stat-box">
                    <span>Active Region</span>
                    <h3>Ireland</h3>
                </div>
                <div class="stat-box">
                    <span>Report Dispatches</span>
                    <h3>892</h3>
                </div>
            </div>

            <div class="blaster-row">
                <div class="chart-wrapper" style="flex: 2;">
                    <h4>Regional Engagement (Clicks)</h4>
                    <canvas id="regionalChart"></canvas>
                </div>
                <div class="chart-wrapper" style="flex: 1;">
                    <h4>Interest Split: Practical vs Managerial</h4>
                    <canvas id="contentChart"></canvas>
                </div>
            </div>

            <div class="chart-wrapper">
                <h4>Lead Generation Trend (2-Week Outlook)</h4>
                <canvas id="trendChart"></canvas>
            </div>
        </div>
    </section>

    <script src="script.js"></script>
</body>
</html>