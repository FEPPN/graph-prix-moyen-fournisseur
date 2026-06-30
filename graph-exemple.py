import pandas as pd
import matplotlib.pyplot as plt

# 1. On charge ton fichier CSV
df = pd.read_csv('bquxjob_50e552a_19f18e0e19b.csv')

# 2. On indique que la colonne scraping_month contient des dates et on trie
nom_colonne = 'scraping_month'
df[nom_colonne] = pd.to_datetime(df[nom_colonne])
df = df.sort_values(nom_colonne)

# 3. On prépare une "toile" pour le graphique
plt.figure(figsize=(10, 6))

# 4. On trace une ligne par fournisseur
liste_fournisseurs = df['provider_name'].unique()

for fournisseur in liste_fournisseurs:
    donnees_fournisseur = df[df['provider_name'] == fournisseur]
    plt.plot(donnees_fournisseur['scraping_month'], donnees_fournisseur['prix_moyen_kwh_base'], marker='o', label=fournisseur)

# 5. La décoration du graphique
plt.title('Évolution du prix du kWh par fournisseur')
plt.xlabel('Mois')
plt.ylabel('Prix (en €)')
plt.xticks(rotation=45)
plt.legend()
plt.tight_layout()

# 6. On affiche le graphique
plt.show()
