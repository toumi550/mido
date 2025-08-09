// Error Logger pour Admin Rania Shop
// Ce fichier capture et affiche toutes les erreurs JavaScript

(function() {
    'use strict';
    
    // Créer un conteneur pour les logs d'erreurs
    function createErrorDisplay() {
        const errorDisplay = document.createElement('div');
        errorDisplay.id = 'error-logger';
        errorDisplay.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            width: 400px;
            max-height: 300px;
            background: #ff4757;
            color: white;
            padding: 15px;
            border-radius: 8px;
            font-family: monospace;
            font-size: 12px;
            z-index: 10000;
            overflow-y: auto;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            display: none;
        `;
        
        errorDisplay.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                <strong>🚨 Erreurs JavaScript</strong>
                <button onclick="document.getElementById('error-logger').style.display='none'" 
                        style="background: none; border: none; color: white; cursor: pointer; font-size: 16px;">×</button>
            </div>
            <div id="error-list"></div>
            <div style="margin-top: 10px; text-align: center;">
                <button onclick="clearErrors()" style="background: rgba(255,255,255,0.2); border: none; color: white; padding: 5px 10px; border-radius: 3px; cursor: pointer;">Effacer</button>
            </div>
        `;
        
        document.body.appendChild(errorDisplay);
        return errorDisplay;
    }
    
    // Fonction pour logger les erreurs
    function logError(message, source, line, col, error) {
        const errorDisplay = document.getElementById('error-logger') || createErrorDisplay();
        const errorList = document.getElementById('error-list');
        
        const timestamp = new Date().toLocaleTimeString();
        const errorItem = document.createElement('div');
        errorItem.style.cssText = `
            background: rgba(255,255,255,0.1);
            padding: 8px;
            margin: 5px 0;
            border-radius: 4px;
            border-left: 3px solid #ff3742;
        `;
        
        errorItem.innerHTML = `
            <div><strong>[${timestamp}]</strong></div>
            <div>📍 ${message}</div>
            ${source ? `<div>📄 ${source}:${line}:${col}</div>` : ''}
            ${error && error.stack ? `<div style="font-size: 10px; opacity: 0.8;">Stack: ${error.stack.substring(0, 200)}...</div>` : ''}
        `;
        
        errorList.appendChild(errorItem);
        errorDisplay.style.display = 'block';
        
        // Scroll vers le bas
        errorList.scrollTop = errorList.scrollHeight;
        
        // Log dans la console aussi
        console.error('🚨 Error Logger:', {
            message,
            source,
            line,
            col,
            error,
            timestamp
        });
    }
    
    // Fonction pour logger les informations
    function logInfo(message, data = null) {
        console.log('ℹ️ Info Logger:', message, data);
        
        // Créer un log d'info visible si nécessaire
        const infoDisplay = document.getElementById('info-logger') || createInfoDisplay();
        const infoList = document.getElementById('info-list');
        
        const timestamp = new Date().toLocaleTimeString();
        const infoItem = document.createElement('div');
        infoItem.style.cssText = `
            background: rgba(255,255,255,0.1);
            padding: 5px;
            margin: 2px 0;
            border-radius: 3px;
            font-size: 11px;
        `;
        
        infoItem.innerHTML = `<strong>[${timestamp}]</strong> ${message}`;
        infoList.appendChild(infoItem);
        
        // Garder seulement les 10 derniers logs
        while (infoList.children.length > 10) {
            infoList.removeChild(infoList.firstChild);
        }
    }
    
    // Créer un conteneur pour les logs d'info
    function createInfoDisplay() {
        const infoDisplay = document.createElement('div');
        infoDisplay.id = 'info-logger';
        infoDisplay.style.cssText = `
            position: fixed;
            bottom: 10px;
            right: 10px;
            width: 300px;
            max-height: 150px;
            background: #2f3542;
            color: #a4b0be;
            padding: 10px;
            border-radius: 6px;
            font-family: monospace;
            font-size: 10px;
            z-index: 9999;
            overflow-y: auto;
            box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        `;
        
        infoDisplay.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
                <strong>ℹ️ Logs</strong>
                <button onclick="document.getElementById('info-logger').style.display='none'" 
                        style="background: none; border: none; color: #a4b0be; cursor: pointer;">×</button>
            </div>
            <div id="info-list"></div>
        `;
        
        document.body.appendChild(infoDisplay);
        return infoDisplay;
    }
    
    // Capturer les erreurs JavaScript
    window.addEventListener('error', function(event) {
        logError(
            event.message,
            event.filename,
            event.lineno,
            event.colno,
            event.error
        );
    });
    
    // Capturer les erreurs de promesses non gérées
    window.addEventListener('unhandledrejection', function(event) {
        logError(
            `Promesse rejetée: ${event.reason}`,
            null,
            null,
            null,
            event.reason
        );
    });
    
    // Fonction globale pour effacer les erreurs
    window.clearErrors = function() {
        const errorList = document.getElementById('error-list');
        if (errorList) {
            errorList.innerHTML = '';
        }
    };
    
    // Fonction globale pour logger des infos
    window.logInfo = logInfo;
    
    // Logger le démarrage
    document.addEventListener('DOMContentLoaded', function() {
        logInfo('🚀 Error Logger initialisé');
        logInfo('📍 Page: ' + window.location.pathname);
        logInfo('🌐 User Agent: ' + navigator.userAgent.substring(0, 50) + '...');
        
        // Tester Firebase après un délai
        setTimeout(function() {
            if (typeof firebase !== 'undefined') {
                logInfo('✅ Firebase SDK détecté');
                if (window.firebaseAuth) {
                    logInfo('✅ Firebase Auth disponible');
                }
                if (window.firebaseDB) {
                    logInfo('✅ Firebase Firestore disponible');
                }
            } else {
                logInfo('❌ Firebase SDK non détecté');
            }
        }, 2000);
    });
    
    // Logger les clics sur les boutons pour debug
    document.addEventListener('click', function(event) {
        if (event.target.tagName === 'BUTTON') {
            logInfo(`🖱️ Clic sur bouton: ${event.target.textContent || event.target.className}`);
        }
    });
    
    console.log('🚨 Error Logger chargé et prêt!');
})();