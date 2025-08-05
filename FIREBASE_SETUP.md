# Configuration Firebase - RANIA SHOP

## 🔥 Configuration Actuelle

**Projet Firebase** : `rania-shop-1fc2e`
**Email Admin** : `rania.shop@gmail.com`

## 📋 Étapes de Configuration

### 1. Règles Firestore
1. Allez sur [Firebase Console](https://console.firebase.google.com/project/rania-shop-1fc2e/firestore/rules)
2. Copiez le contenu du fichier `firestore.rules`
3. Collez dans l'éditeur de règles
4. Cliquez sur **Publier**

### 2. Authentification
1. Allez dans **Authentication** > **Users**
2. L'utilisateur `rania.shop@gmail.com` doit être créé
3. Assurez-vous que l'email est vérifié

### 3. Collections Firestore
Les collections suivantes seront créées automatiquement :
- `products` - Produits du catalogue
- `orders` - Commandes clients
- `settings` - Paramètres du site

## 🚀 Test de Fonctionnement

1. **Site principal** : Les produits doivent s'afficher
2. **Panneau admin** : Connexion avec `rania.shop@gmail.com`
3. **Ajout produit** : Test depuis le panneau admin
4. **Commande** : Test de commande depuis le site

## 🔧 En cas de Problème

- Vérifiez que Firebase est bien initialisé dans la console du navigateur
- Assurez-vous que l'email admin est vérifié dans Firebase Auth
- Vérifiez que les règles Firestore sont bien déployées