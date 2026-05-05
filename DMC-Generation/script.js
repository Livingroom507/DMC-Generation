/**
 * Livingroom507MOC - Break-Even Compound Logic (Derived from Sheet1)
 */
function populateCalc(p, m, r) {
    document.getElementById('principal').value = p;
    document.getElementById('contribution').value = m;
    document.getElementById('rate').value = r;
    calculateBreakEven();
}

function calculateBreakEven() {
    const P = parseFloat(document.getElementById('principal').value) || 0;
    const PMT = parseFloat(document.getElementById('contribution').value) || 0;
    const annualRate = parseFloat(document.getElementById('rate').value) || 0;
    const r = (annualRate / 100) / 12;
    const t = parseFloat(document.getElementById('years').value) || 0;
    const n = t * 12;

    let futureValue;
    if (r === 0) {
        futureValue = P + (PMT * n);
    } else {
        const part1 = P * Math.pow(1 + r, n);
        const part2 = PMT * ((Math.pow(1 + r, n) - 1) / r);
        futureValue = part1 + part2;
    }

    document.getElementById('future-value').innerText = 
        new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(futureValue);
}

/**
 * Sends the calculation state to send_report.php for PDF generation and emailing.
 */
function requestEmailReport(email, region = 'Global') {
    const formData = new FormData();
    formData.append('email', email);
    formData.append('region', region);
    formData.append('principal', document.getElementById('principal').value);
    formData.append('contribution', document.getElementById('contribution').value);
    formData.append('rate', document.getElementById('rate').value);
    formData.append('years', document.getElementById('years').value);
    formData.append('future_value', document.getElementById('future-value').innerText);

    fetch('send_report.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.text())
    .then(data => alert(data))
    .catch(error => console.error('Error:', error));
}

/**
 * Initialize Dashboard Charts (Chart.js)
 */
document.addEventListener('DOMContentLoaded', async function() {
    // Only run if the dashboard canvases exist
    if (!document.getElementById('regionalChart')) return;

    try {
        const response = await fetch('ga4_metrics.php');
        const liveData = await response.json();

        if (!response.ok || liveData.error) {
            console.error('GA4 response failure:', liveData.error || response.statusText);
            return;
        }

        // Update Stat Cards
        if (document.getElementById('stat-total-clicks')) {
            document.getElementById('stat-total-clicks').innerText = (liveData.totalClicks || 0).toLocaleString();
        }

        const safeArray = (arr) => Array.isArray(arr) ? arr : [];

    // 1. Regional Engagement Bar Chart
    new Chart(document.getElementById('regionalChart'), {
        type: 'bar',
        data: {
            labels: safeArray(liveData.regional?.labels),
            datasets: [{
                label: 'Clicks per Region',
                data: safeArray(liveData.regional?.data),
                backgroundColor: '#b59410' // var(--gold)
            }]
        },
        options: { responsive: true, maintainAspectRatio: false }
    });

    // 2. Content Interest Doughnut Chart
    new Chart(document.getElementById('contentChart'), {
        type: 'doughnut',
        data: {
            labels: ['Practical', 'Managerial'],
            datasets: [{
                data: liveData.split,
                backgroundColor: ['#111111', '#b59410']
            }]
        },
        options: { responsive: true, maintainAspectRatio: false }
    });

    // 3. 2-Week Lead Trend Line Chart
    new Chart(document.getElementById('trendChart'), {
        type: 'line',
        data: {
            labels: liveData.trend.labels,
            datasets: [{
                label: 'Global Engagement Trend',
                data: liveData.trend.data,
                borderColor: '#b59410',
                backgroundColor: 'rgba(181, 148, 16, 0.1)',
                fill: true,
                tension: 0.3
            }]
        },
        options: { responsive: true, maintainAspectRatio: false }
    });

    } catch (err) {
        console.error('GA4 Fetch Error:', err);
        // Fallback or error display logic here
    }
});

/**
 * Generates a PDF summary of the dashboard stats and charts.
 */
function printDashboard() {
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF('p', 'mm', 'a4');
    const timestamp = new Date().toLocaleDateString();

    // Header
    pdf.setFontSize(20);
    pdf.setTextColor(181, 148, 16); // var(--gold)
    pdf.text("LIVINGROOM507MOC", 105, 20, { align: "center" });
    pdf.setFontSize(14);
    pdf.setTextColor(17, 17, 17);
    pdf.text(`Weekly Operational Review - ${timestamp}`, 105, 30, { align: "center" });

    // 1. Add Statistics Text
    pdf.setFontSize(12);
    pdf.text("Key Performance Indicators:", 20, 45);
    const stats = document.querySelectorAll('.stat-box');
    let statY = 55;
    stats.forEach(box => {
        const label = box.querySelector('span').innerText;
        const value = box.querySelector('h3').innerText;
        pdf.text(`> ${label}: ${value}`, 25, statY);
        statY += 8;
    });

    // 2. Add Charts as Images
    const regionalCanvas = document.getElementById('regionalChart');
    const contentCanvas = document.getElementById('contentChart');
    const trendCanvas = document.getElementById('trendChart');

    if (regionalCanvas) {
        pdf.text("Regional Engagement:", 20, statY + 10);
        pdf.addImage(regionalCanvas.toDataURL('image/png'), 'PNG', 15, statY + 15, 180, 80);
    }

    pdf.addPage();
    if (contentCanvas) {
        pdf.text("Content Interest (Practical vs Managerial):", 20, 20);
        pdf.addImage(contentCanvas.toDataURL('image/png'), 'PNG', 55, 30, 100, 100);
    }

    if (trendCanvas) {
        pdf.text("14-Day Lead Generation Trend:", 20, 140);
        pdf.addImage(trendCanvas.toDataURL('image/png'), 'PNG', 15, 150, 180, 80);
    }

    pdf.save(`Livingroom507_Weekly_Review_${new Date().toISOString().split('T')[0]}.pdf`);
}