// 1. On détecte automatiquement le nom du fournisseur grâce au nom de la page HTML
// Exemple : si la page s'appelle "edf.html", le script comprend qu'il faut filtrer sur "edf"
const nomPage = window.location.pathname.split("/").pop();
let fournisseurAFiltrer = nomPage.replace(".html", "").toLowerCase();

// Cas particulier : si on arrive sur la racine ou index.html, on peut mettre un fournisseur par défaut (ex: edf)
if (fournisseurAFiltrer === "" || fournisseurAFiltrer === "index") {
    fournisseurAFiltrer = "edf"; 
}

// 2. Récupération et filtrage des données
fetch('data.json')
    .then(response => response.json())
    .then(data => {
        // Tri par date pour avoir une jolie courbe chronologique
        data.sort((a, b) => new Date(a.scraping_month) - new Date(b.scraping_month));

        // On filtre le gros JSON pour ne garder QUE le fournisseur de la page
        // (On utilise .toLowerCase() pour éviter les erreurs de majuscules/minuscules)
        const donneesFiltrees = data.filter(item => 
            item.provider_name.toLowerCase().replace(/\s/g, "") === fournisseurAFiltrer
        );

        // Si on ne trouve pas le fournisseur, on affiche une alerte dans la console
        if (donneesFiltrees.length === 0) {
            console.error(`Aucune donnée trouvée pour le fournisseur : ${fournisseurAFiltrer}`);
            return;
        }

        // On récupère le vrai nom officiel (avec les majuscules d'origine) pour le titre
        const nomOfficielFournisseur = donneesFiltrees[0].provider_name;

        // Extraction des axes X (mois) et Y (prix)
        const mois = donneesFiltrees.map(item => item.scraping_month);
        const prix = donneesFiltrees.map(item => item.prix_moyen_kwh_base);

        // 3. Dessin du graphique unique
        const ctx = document.getElementById('monGraphique').getContext('2d');
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: mois,
                datasets: [{
                    label: `Prix moyen kWh Base (en €)`,
                    data: prix,
                    borderColor: '#3e95cd',
                    backgroundColor: 'rgba(62, 149, 205, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: `Évolution des prix - ${nomOfficielFournisseur}`,
                        font: { size: 18 }
                    }
                },
                scales: {
                    y: { beginAtZero: false }
                }
            }
        });
    });
