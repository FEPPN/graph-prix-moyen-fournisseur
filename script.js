// 1. On détecte automatiquement le nom du fournisseur grâce au nom de la page HTML
const nomPage = window.location.pathname.split("/").pop();
let fournisseurAFiltrer = nomPage.replace(".html", "").toLowerCase();

// Fournisseur par défaut si on est sur index.html ou la racine
if (fournisseurAFiltrer === "" || fournisseurAFiltrer === "index") {
    fournisseurAFiltrer = "edf"; 
}

// 2. Récupération et filtrage des données
fetch('data.json')
    .then(response => response.json())
    .then(data => {
        // Tri par date
        data.sort((a, b) => new Date(a.scraping_month) - new Date(b.scraping_month));

        // Filtrage pour le fournisseur de la page
        const donneesFiltrees = data.filter(item => 
            item.provider_name.toLowerCase().replace(/\s/g, "") === fournisseurAFiltrer
        );

        if (donneesFiltrees.length === 0) {
            console.error(`Aucune donnée trouvée pour le fournisseur : ${fournisseurAFiltrer}`);
            return;
        }

        const nomOfficielFournisseur = donneesFiltrees[0].provider_name;

        // Extraction et formatage des dates pour l'axe X (ex: "06/2026")
        const mois = donneesFiltrees.map(item => {
            const d = new Date(item.scraping_month);
            return String(d.getMonth() + 1).padStart(2, '0') + '/' + d.getFullYear();
        });
        
        const prix = donneesFiltrees.map(item => item.prix_moyen_kwh_base);

        // 3. Dessin du graphique avec le style ADN papernest
        const ctx = document.getElementById('monGraphique').getContext('2d');
        
        // Création d'un joli dégradé de haut en bas sous la courbe
        const gradient = ctx.createLinearGradient(0, 0, 0, 400);
        gradient.addColorStop(0, 'rgba(15, 134, 254, 0.25)'); // Bleu papernest transparent en haut
        gradient.addColorStop(1, 'rgba(15, 134, 254, 0.00)'); // Totalement invisible en bas

        new Chart(ctx, {
            type: 'line',
            data: {
                labels: mois,
                datasets: [{
                    label: `Prix moyen kWh Base`,
                    data: prix,
                    // --- STYLE VISUEL PAPERNEST ---
                    borderColor: '#0f86fe',      // Le bleu officiel papernest
                    backgroundColor: gradient,   // Application du dégradé sous la courbe
                    borderWidth: 3,              // Épaisseur de la ligne
                    fill: true,                  // Activer le remplissage sous la courbe
                    tension: 0.4,                // Rend la courbe parfaitement lisse et arrondie
                    pointRadius: 0,              // Supprime les petits points sur la ligne pour un effet épuré
                    pointHoverRadius: 6,         // Le point réapparaît uniquement quand on passe la souris dessus
                    pointHoverBackgroundColor: '#0f86fe'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: `Évolution des prix - ${nomOfficielFournisseur}`,
                        font: { size: 18, weight: 'bold', family: 'sans-serif' },
                        padding: { bottom: 20 },
                        color: '#1a1a1a'
                    },
                    legend: { display: false } // Masque la légende inutile puisqu'il n'y a qu'un fournisseur
                },
                scales: {
                    y: {
                        grid: { color: '#eef2f5' }, // Grille très discrète en arrière-plan
                        ticks: {
                            color: '#7a8b99',
                            font: { family: 'sans-serif' },
                            // --- PIÈCE REPRISE DE L'EXEMPLE : AJOUT DU SIGLE € ---
                            callback: function(value) {
                                return value.toFixed(4) + ' €'; // Affiche ex: "0.1813 €"
                            }
                        }
                    },
                    x: {
                        grid: { display: false }, // Supprime les lignes verticales pour alléger le graph
                        ticks: {
                            color: '#7a8b99',
                            font: { family: 'sans-serif' }
                        }
                    }
                }
            }
        });
    });
