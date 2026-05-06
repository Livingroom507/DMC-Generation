document.addEventListener('DOMContentLoaded', async function() {
    if (!document.getElementById('regionalChart')) return;

    const authenticated = await initializePortalSession();
    if (!authenticated) {
        return;
    }

    const dashboardData = {
        totalClicks: 14205,
        regional: {
            labels: ['Ireland', 'UK', 'Germany', 'France', 'Spain'],
            data: [4200, 3150, 2580, 2295, 1980]
        },
        split: [62, 38],
        trend: {
            labels: ['Day 1', 'Day 3', 'Day 5', 'Day 7', 'Day 9', 'Day 11', 'Day 14'],
            data: [720, 840, 910, 880, 1035, 1120, 1245]
        }
    };

    const totalClicks = document.getElementById('stat-total-clicks');
    if (totalClicks) {
        totalClicks.innerText = dashboardData.totalClicks.toLocaleString();
    }

    const commonOptions = {
        animation: false,
        responsive: true,
        maintainAspectRatio: false,
        resizeDelay: 200
    };

    new Chart(document.getElementById('regionalChart'), {
        type: 'bar',
        data: {
            labels: dashboardData.regional.labels,
            datasets: [{
                label: 'Clicks per Region',
                data: dashboardData.regional.data,
                backgroundColor: '#b59410'
            }]
        },
        options: commonOptions
    });

    new Chart(document.getElementById('contentChart'), {
        type: 'doughnut',
        data: {
            labels: ['Practical', 'Managerial'],
            datasets: [{
                data: dashboardData.split,
                backgroundColor: ['#111111', '#b59410']
            }]
        },
        options: commonOptions
    });

    new Chart(document.getElementById('trendChart'), {
        type: 'line',
        data: {
            labels: dashboardData.trend.labels,
            datasets: [{
                label: 'Global Engagement Trend',
                data: dashboardData.trend.data,
                borderColor: '#b59410',
                backgroundColor: 'rgba(181, 148, 16, 0.1)',
                fill: true,
                tension: 0.3
            }]
        },
        options: commonOptions
    });

    document.body.classList.remove('portal-loading');
});

async function initializePortalSession() {
    const username = document.getElementById('session-username');
    const logoutLink = document.getElementById('logout-link');

    if (logoutLink) {
        logoutLink.addEventListener('click', async function(event) {
            event.preventDefault();

            try {
                await fetch('/api/logout', { method: 'POST' });
            } finally {
                window.location.href = '/login.html';
            }
        });
    }

    try {
        const response = await fetch('/api/session');
        const session = await response.json();

        if (!session.authenticated) {
            window.location.href = '/login.html?next=%2Fportal.html';
            return false;
        }

        if (username && session.username) {
            username.textContent = `Signed in as ${session.username}`;
        }

        return true;
    } catch {
        if (username) {
            username.textContent = 'Session unavailable';
        }

        document.body.classList.remove('portal-loading');
        return true;
    }
}

function printDashboard() {
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF('p', 'mm', 'a4');
    const timestamp = new Date().toLocaleDateString();

    pdf.setFontSize(20);
    pdf.setTextColor(181, 148, 16);
    pdf.text('LIVINGROOM507MOC', 105, 20, { align: 'center' });
    pdf.setFontSize(14);
    pdf.setTextColor(17, 17, 17);
    pdf.text(`Weekly Operational Review - ${timestamp}`, 105, 30, { align: 'center' });

    pdf.setFontSize(12);
    pdf.text('Key Performance Indicators:', 20, 45);
    const stats = document.querySelectorAll('.stat-box');
    let statY = 55;
    stats.forEach(box => {
        const label = box.querySelector('span').innerText;
        const value = box.querySelector('h3').innerText;
        pdf.text(`> ${label}: ${value}`, 25, statY);
        statY += 8;
    });

    const regionalCanvas = document.getElementById('regionalChart');
    const contentCanvas = document.getElementById('contentChart');
    const trendCanvas = document.getElementById('trendChart');

    if (regionalCanvas) {
        pdf.text('Regional Engagement:', 20, statY + 10);
        pdf.addImage(regionalCanvas.toDataURL('image/png'), 'PNG', 15, statY + 15, 180, 80);
    }

    pdf.addPage();
    if (contentCanvas) {
        pdf.text('Content Interest (Practical vs Managerial):', 20, 20);
        pdf.addImage(contentCanvas.toDataURL('image/png'), 'PNG', 55, 30, 100, 100);
    }

    if (trendCanvas) {
        pdf.text('14-Day Lead Generation Trend:', 20, 140);
        pdf.addImage(trendCanvas.toDataURL('image/png'), 'PNG', 15, 150, 180, 80);
    }

    pdf.save(`Livingroom507_Weekly_Review_${new Date().toISOString().split('T')[0]}.pdf`);
}
