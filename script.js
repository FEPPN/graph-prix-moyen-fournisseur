// 1. Détection sécurisée du nom du fournisseur via l'URL
let fournisseurAFiltrer = "edf"; // Fournisseur par défaut (sécurité)

if (window && window.location && window.location.pathname) {
    const nomPage = window.location.pathname.split("/").pop();
    if (nomPage && nomPage.includes(".html")) {
        fournisseurAFiltrer = nomPage.replace(".html", "").toLowerCase().trim();
    }
}

// Optionnel : Si tu veux forcer un fournisseur pendant que tu fais tes tests sur index.html :
if (fournisseurAFiltrer === "index" || fournisseurAFiltrer === "") {
    fournisseurAFiltrer = "edf"; 
}
// 2. Récupération des données
fetch('data.json')
    .then(response => response.json())
    .then(data => {
        // Tri chronologique strict
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

        // Extraction des données (Axe X : MM/AA comme demandé dans le python)
        const labelsX = donneesFiltrees.map(item => {
            const d = new Date(item.scraping_month);
            return String(d.getMonth() + 1).padStart(2, '0') + '/' + String(d.getFullYear()).slice(-2);
        });
        
        const prixY = donneesFiltrees.map(item => item.prix_moyen_kwh_base);

        // 3. Dessin du graphique (Copie conforme de la configuration Python)
        const ctx = document.getElementById('monGraphique').getContext('2d');
        
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: labelsX,
                datasets: [{
                    label: 'Prix moyen kWh Base',
                    data: prixY,
                    // Configuration des couleurs issues du fichier Python
                    borderColor: '#4d5dfb',         // Bleu roi dynamique
                    backgroundColor: '#f0f2ff',     // Zone bleutée douce
                    borderWidth: 2.5,               // Épaisseur de ligne du Python
                    fill: true,
                    tension: 0.4,                   // Courbe fluide (spline)
                    pointRadius: 0,                 // Pas de points visibles par défaut
                    pointHoverRadius: 6,            // Le point réapparaît au survol
                    pointHoverBackgroundColor: '#4d5dfb',
                    pointHoverBorderColor: '#white',
                    pointHoverBorderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false, // Permet de forcer la hauteur définie dans le HTML
                plugins: {
                    title: {
                        display: true,
                        text: `Évolution des prix - ${nomOfficielFournisseur}`,
                        font: { size: 18, weight: 'bold', family: 'Arial' },
                        color: '#2c3e50',
                        padding: { bottom: 10 }
                    },
                    legend: { display: false }, // Masquée comme dans le Python
                    // Configuration de l'infobulle (comme l'hovertemplate du Python)
                    tooltip: {
                        backgroundColor: 'white',
                        titleColor: '#2c3e50',
                        bodyColor: '#4d5dfb',
                        borderColor: '#d7dbe9',
                        borderWidth: 1,
                        padding: 10,
                        displayColors: false, // Supprime le petit carré de couleur par défaut
                        callbacks: {
                            label: function(context) {
                                return `▢ ${context.parsed.y.toFixed(4)} € / kWh Base`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        grid: { color: '#f5f5f5' }, // Gris ultra-léger pour les lignes de repère
                        ticks: {
                            color: '#7f8c8d',
                            font: { family: 'Arial', size: 12 },
                            callback: function(value) {
                                return value.toFixed(4) + ' € / kWh'; // Format Y-Axis du Python
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
