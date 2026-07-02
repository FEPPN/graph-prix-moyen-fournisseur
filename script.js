// 1. Détection automatique du fournisseur via l'URL
let fournisseurAFiltrer = "edf"; 

if (window && window.location && window.location.pathname) {
    const nomPage = window.location.pathname.split("/").pop();
    if (nomPage && nomPage.includes(".html")) {
        fournisseurAFiltrer = nomPage.replace(".html", "").toLowerCase().trim();
    }
}

if (fournisseurAFiltrer === "index" || fournisseurAFiltrer === "") {
    fournisseurAFiltrer = "edf"; 
}

// 2. Récupération des données
fetch('data.json')
    .then(response => response.json())
    .then(data => {
        // Tri chronologique
        data.sort((a, b) => new Date(a.scraping_month) - new Date(b.scraping_month));

        // Filtrage
        const donneesFiltrees = data.filter(item => 
            item.provider_name.toLowerCase().replace(/\s/g, "") === fournisseurAFiltrer
        );

        if (donneesFiltrees.length === 0) {
            console.error(`Aucune donnée trouvée pour : ${fournisseurAFiltrer}`);
            return;
        }

        const nomOfficielFournisseur = donneesFiltrees[0].provider_name;

        // --- ENTIÈREMENT SÉCURISÉ : AXE X AVEC ANNÉE SUR 4 CHIFFRES (MM/AAAA) ---
        const labelsX = donneesFiltrees.map(item => {
            const d = new Date(item.scraping_month);
            return String(d.getMonth() + 1).padStart(2, '0') + '/' + String(d.getFullYear());
        });
        
        const prixY = donneesFiltrees.map(item => item.prix_moyen_kwh_base);

        // 3. Dessin du graphique
        const ctx = document.getElementById('monGraphique').getContext('2d');
        
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: labelsX,
                datasets: [{
                    label: 'Prix moyen kWh Base',
                    data: prixY,
                    borderColor: '#4d5dfb',         // Bleu roi papernest
                    backgroundColor: '#f0f2ff',     // Zone remplie douce
                    borderWidth: 2.5,
                    fill: true,
                    tension: 0.4,                   // Courbe fluide
                    pointRadius: 0,                 // Pas de points par défaut
                    pointHoverRadius: 6,            // Point au survol
                    pointHoverBackgroundColor: '#4d5dfb',
                    pointHoverBorderColor: 'white',
                    pointHoverBorderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                hover: {
                    mode: 'index',
                    intersect: false
                },
                plugins: {
                    title: {
                        display: true,
                        text: `Évolution des prix - ${nomOfficielFournisseur}`,
                        font: { size: 18, weight: 'bold', family: 'Arial' },
                        color: '#2c3e50',
                        padding: { bottom: 10 }
                    },
                    legend: { display: false },
                    tooltip: {
                        enabled: true,
                        mode: 'index',
                        intersect: false,
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        titleColor: '#2c3e50',
                        bodyColor: '#4d5dfb',
                        borderColor: '#d7dbe9',
                        borderWidth: 1,
                        displayColors: false,
                        padding: 10,
                        callbacks: {
                            label: function(context) {
                                return '▢ ' + Number(context.parsed.y).toFixed(4) + ' € / kWh TTC';
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        grid: { color: '#f5f5f5' },
                        ticks: {
                            color: '#7f8c8d',
                            font: { family: 'Arial', size: 12 },
                            callback: function(value) {
                                return Number(value).toFixed(2) + ' € / kWh'; 
                            }
                        }
                    },
                    x: {
                        grid: { color: '#f5f5f5' },
                        ticks: {
                            color: '#7f8c8d',
                            font: { family: 'Arial', size: 12 }
                        }
                    }
                }
            }
        });
    });
