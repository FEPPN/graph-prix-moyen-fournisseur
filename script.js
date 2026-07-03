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
        // Tri chronologique strict sur les dates pures
        data.sort((a, b) => new Date(a.scraping_month) - new Date(b.scraping_month));

        // --- GESTION DES EXCEPTIONS DE NOMS DE FOURNISSEURS ---
        // Ici, on fait correspondre le nom de la page HTML avec le vrai nom dans ton JSON BigQuery
        let donneesFiltrees = data.filter(item => {
            const nomJson = item.provider_name.toLowerCase().replace(/\s/g, "");
            
            // Si la page est plenitude.html, on accepte "plenitudefrance" ou "plenitude"
            if (fournisseurAFiltrer === "plenitude") {
                return nomJson === "plenitudefrance" || nomJson === "plenitude";
            }
            
            // Par défaut, on fait la correspondance exacte habituelle
            return nomJson === fournisseurAFiltrer;
        });

        // Fenêtre glissante : On ne garde que les 24 derniers mois
        donneesFiltrees = donneesFiltrees.slice(-24);

        if (donneesFiltrees.length === 0) {
            console.error(`Aucune donnée trouvée pour le fournisseur : ${fournisseurAFiltrer}`);
            return;
        }

        const nomOfficielFournisseur = donneesFiltrees[0].provider_name;

        // Mise à jour dynamique du titre HTML
        const elementTitre = document.getElementById('titreGraphique');
        if (elementTitre) {
            elementTitre.textContent = `Évolution des prix - ${nomOfficielFournisseur}`;
        }

        // Extraction et conversion des dates (MM/AAAA)
        const labelsX = donneesFiltrees.map(item => {
            const d = new Date(item.scraping_month);
            const mois = String(d.getMonth() + 1).padStart(2, '0');
            const annee = d.getFullYear();
            return `${mois}/${annee}`;
        });
        
        const prixY = donneesFiltrees.map(item => item.prix_moyen_kwh_base);

        // 3. Dessin du graphique avec Chart.js
        const ctx = document.getElementById('monGraphique').getContext('2d');
        
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: labelsX,
                datasets: [{
                    label: 'Prix moyen kWh Base',
                    data: prixY,
                    borderColor: '#4d5dfb',
                    backgroundColor: '#f0f2ff',
                    borderWidth: 2.5,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 0,
                    pointHoverRadius: 6,
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
                        display: false
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
                        suggestedMin: 0.10, 
                        suggestedMax: 0.30,
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
    })
    .catch(err => console.error("Erreur :", err));
