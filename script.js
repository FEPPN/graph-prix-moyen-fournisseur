// 1. On va chercher ton fichier data.json sur GitHub
fetch('data.json')
    .then(response => response.json())
    .then(data => {
        // On trie les données par date pour éviter le gribouillis
        data.sort((a, b) => new Date(a.scraping_month) - new Date(b.scraping_month));

        // On extrait la liste unique de tous les mois (Axe X)
        const mois = [...new Set(data.map(item => item.scraping_month))];
        
        // On extrait la liste unique de tous les fournisseurs
        const fournisseurs = [...new Set(data.map(item => item.provider_name))];

        // On prépare les lignes colorées pour chaque fournisseur
        const datasets = fournisseurs.map(fournisseur => {
            // On filtre les données pour ce fournisseur précis
            const donneesDuFournisseur = data.filter(item => item.provider_name === fournisseur);
            
            // On aligne les prix en face des bons mois
            const prixParMois = mois.map(m => {
                const point = donneesDuFournisseur.find(item => item.scraping_month === m);
                return point ? point.prix_moyen_kwh_base : null;
            });

            return {
                label: fournisseur,
                data: prixParMois,
                borderWidth: 2,
                fill: false
            };
        });

        // 2. On dessine le graphique dans la page HTML
        const ctx = document.getElementById('monGraphique').getContext('2d');
        new Chart(ctx, {
            type: 'line',
            data: { labels: mois, datasets: datasets },
            options: {
                responsive: true,
                plugins: { title: { display: true, text: 'Évolution du prix moyen du kWh base' } }
            }
        });
    });
