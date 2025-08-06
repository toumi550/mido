# 🔧 Guide de Résolution des Problèmes - RANIA SHOP

## 🚨 Problèmes Identifiés

### 1. **Email Mal Écrit**
❌ **Erreur** : Tu écris `raniia.shopp@gmail.com`
✅ **Correct** : `rania.shop@gmail.com`

### 2. **Cache du Navigateur**
Le navigateur utilise encore l'ancienne configuration Firebase.

### 3. **Menu Latéral Invisible**
Le bouton du menu était caché.

## 🔧 Solutions Étape par Étape

### Étape 1 : Vider le Cache
1. **Ouvre les DevTools** (F12)
2. **Clic droit sur le bouton Actualiser** → **Vider le cache et actualiser**
3. **Ou** : Ctrl+Shift+R (Windows) / Cmd+Shift+R (Mac)

### Étape 2 : Vérifier Firebase
1. **Ouvre la console** (F12 → Console)
2. **Colle ce code** :
```javascript
console.log('API Key:', firebase.app().options.apiKey);
console.log('Project ID:', firebase.app().options.projectId);
```
3. **Vérifie que tu vois** :
   - API Key: `AIzaSyCMHnyFo55VTydqqNJ29x1O0NrUOzQ2dj8`
   - Project ID: `rania-shop-1fc2e`

### Étape 3 : Connexion Admin
1. **Email exact** : `rania.shop@gmail.com` (pas d'autres variantes !)
2. **Mot de passe** : Celui que tu as défini dans Firebase Console
3. **Assure-toi** que l'utilisateur existe dans Firebase Console

### Étape 4 : Vérifier l'Utilisateur Firebase
1. Va sur : https://console.firebase.google.com/project/rania-shop-1fc2e/authentication/users
2. **Vérifie que tu vois** : `rania.shop@gmail.com`
3. **Statut** : Email vérifié ✅
4. **Si absent** : Clique "Ajouter un utilisateur"

## 🧪 Tests de Diagnostic

### Test 1 : Configuration Firebase
```javascript
// Dans la console F12
console.log('Config Firebase:', firebase.app().options);
```

### Test 2 : Connexion Manuelle
```javascript
// Dans la console F12
firebase.auth().signInWithEmailAndPassword('rania.shop@gmail.com', 'TON_MOT_DE_PASSE')
  .then(user => console.log('✅ Connexion OK:', user.user.email))
  .catch(error => console.log('❌ Erreur:', error.code));
```

### Test 3 : Menu Latéral
```javascript
// Dans la console F12
document.getElementById('sidebarMenu').classList.add('active');
```

## 🔄 Actions Immédiates

### 1. **Nettoyer Complètement**
- Ferme tous les onglets du site
- Vide le cache du navigateur
- Rouvre le site

### 2. **Utiliser l'Email Correct**
- **TOUJOURS** : `rania.shop@gmail.com`
- **JAMAIS** : `raniia.shopp@gmail.com` ou autres variantes

### 3. **Vérifier Firebase Console**
- Utilisateur créé ✅
- Email vérifié ✅
- Mot de passe correct ✅

## 📱 Menu Latéral

Le menu latéral devrait maintenant être visible avec un bouton hamburger en haut à droite.

**Si toujours invisible** :
1. Vérifie dans F12 → Elements si `<nav class="sidebar-menu">` existe
2. Vérifie dans F12 → Console s'il y a des erreurs JavaScript

## 🚀 Après Résolution

Une fois tout corrigé :
1. ✅ Connexion admin avec `rania.shop@gmail.com`
2. ✅ Menu latéral visible et fonctionnel
3. ✅ Données du nouveau projet Firebase
4. ✅ Pas d'erreurs dans la console

## 📞 Si Problème Persiste

1. **Capture d'écran** de la console F12 avec les erreurs
2. **Vérifie** que tu utilises bien le bon email
3. **Confirme** que l'utilisateur existe dans Firebase Console