<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>Test du Jeu - Loup-Garou</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 10px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.2);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .header h1 {
            font-size: 2em;
            margin-bottom: 10px;
        }
        .form-section {
            padding: 30px;
            border-bottom: 1px solid #eee;
        }
        .form-group {
            margin-bottom: 20px;
        }
        .form-group label {
            display: block;
            margin-bottom: 8px;
            font-weight: 600;
            color: #333;
        }
        .form-group input {
            width: 100%;
            padding: 12px;
            border: 2px solid #ddd;
            border-radius: 5px;
            font-size: 16px;
            transition: border-color 0.3s;
        }
        .form-group input:focus {
            outline: none;
            border-color: #667eea;
        }
        .form-row {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
        }
        .btn {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            padding: 15px 30px;
            font-size: 18px;
            font-weight: 600;
            border-radius: 5px;
            cursor: pointer;
            transition: transform 0.2s, box-shadow 0.2s;
            width: 100%;
        }
        .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 20px rgba(102, 126, 234, 0.4);
        }
        .btn:active {
            transform: translateY(0);
        }
        .btn:disabled {
            opacity: 0.6;
            cursor: not-allowed;
            transform: none;
        }
        .output-section {
            padding: 30px;
            background: #1a1a1a;
            color: #00ff00;
            font-family: 'Courier New', monospace;
            font-size: 13px;
            line-height: 1.5;
            max-height: 700px;
            overflow-y: auto;
            white-space: pre-wrap;
            word-wrap: break-word;
        }
        .output-section.error {
            color: #ff4444;
        }
        .output-section.success {
            color: #00ff00;
        }
        .loading {
            text-align: center;
            padding: 20px;
            color: #667eea;
            font-weight: 600;
        }
        .status {
            padding: 15px;
            margin-bottom: 20px;
            border-radius: 5px;
            font-weight: 600;
        }
        .status.success {
            background: #d4edda;
            color: #155724;
            border: 1px solid #c3e6cb;
        }
        .status.error {
            background: #f8d7da;
            color: #721c24;
            border: 1px solid #f5c6cb;
        }
        .status.info {
            background: #d1ecf1;
            color: #0c5460;
            border: 1px solid #bee5eb;
        }
        .scroll-indicator {
            text-align: center;
            padding: 10px;
            color: #999;
            font-size: 12px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎮 Test Complet du Jeu</h1>
            <p>Lancez une simulation complète avec tous les rôles</p>
            <p style="font-size: 0.9em; margin-top: 10px; opacity: 0.9;">
                ✅ Bugs critiques corrigés : Vision Sorcière, Potion de mort, Ancien, Victory check, Night_wolves
            </p>
        </div>

        <div class="form-section">
            <form id="testForm">
                <div class="form-row">
                    <div class="form-group">
                        <label for="players">Nombre de joueurs</label>
                        <input type="number" id="players" name="players" value="18" min="12" max="30">
                    </div>
                    <div class="form-group">
                        <label for="max-rounds">Tours maximum (1000 = illimité)</label>
                        <input type="number" id="max-rounds" name="max-rounds" value="1000" min="1">
                    </div>
                    <div class="form-group">
                        <label for="host">Host</label>
                        <input type="text" id="host" name="host" value="levillage.test">
                    </div>
                    <div class="form-group">
                        <label for="port">Port</label>
                        <input type="number" id="port" name="port" value="80" min="1" max="65535">
                    </div>
                </div>
                <button type="submit" class="btn" id="runBtn">🚀 Lancer le Test</button>
            </form>
        </div>

        <div id="status"></div>
        <div id="output" class="output-section" style="display: none;"></div>
    </div>

    <script>
        const form = document.getElementById('testForm');
        const runBtn = document.getElementById('runBtn');
        const output = document.getElementById('output');
        const status = document.getElementById('status');

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Désactiver le bouton
            runBtn.disabled = true;
            runBtn.textContent = '⏳ Exécution en cours...';
            
            // Afficher la zone de sortie
            output.style.display = 'block';
            output.textContent = '⏳ Démarrage du test...\n';
            output.className = 'output-section';
            
            // Masquer le statut
            status.innerHTML = '';
            
            const formData = new FormData(form);
            const params = new URLSearchParams();
            for (const [key, value] of formData.entries()) {
                params.append(key, value);
            }

            try {
                // Récupérer le token CSRF
                const csrfMeta = document.querySelector('meta[name="csrf-token"]');
                if (!csrfMeta) {
                    throw new Error('Token CSRF non trouvé. Veuillez rafraîchir la page.');
                }
                const csrfToken = csrfMeta.getAttribute('content');
                
                if (!csrfToken) {
                    throw new Error('Token CSRF vide. Veuillez rafraîchir la page.');
                }
                
                // Ajouter le token CSRF dans les paramètres aussi
                params.append('_token', csrfToken);
                
                const response = await fetch('/test-game/run', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'X-Requested-With': 'XMLHttpRequest',
                        'X-CSRF-TOKEN': csrfToken,
                    },
                    body: params.toString()
                });

                // Vérifier si la réponse est OK
                if (!response.ok) {
                    let errorText = '';
                    try {
                        errorText = await response.text();
                    } catch (e) {
                        errorText = 'Impossible de lire la réponse';
                    }
                    
                    if (response.status === 419) {
                        output.className = 'output-section error';
                        output.textContent = 'ERREUR CSRF (419):\nLe token CSRF a expiré ou est invalide.\n\nVeuillez rafraîchir la page et réessayer.';
                        status.innerHTML = '<div class="status error">❌ Erreur CSRF - Veuillez rafraîchir la page</div>';
                        return;
                    }
                    
                    output.className = 'output-section error';
                    output.textContent = `ERREUR HTTP ${response.status}:\n${errorText}`;
                    status.innerHTML = `<div class="status error">❌ Erreur HTTP ${response.status}</div>`;
                    return;
                }
                
                let data;
                try {
                    data = await response.json();
                } catch (e) {
                    const text = await response.text();
                    output.className = 'output-section error';
                    output.textContent = 'ERREUR: La réponse n\'est pas du JSON valide:\n' + text;
                    status.innerHTML = '<div class="status error">❌ Réponse invalide du serveur</div>';
                    return;
                }
                
                if (data.success) {
                    output.className = 'output-section success';
                    status.innerHTML = '<div class="status success">✅ Test terminé avec succès (code: ' + (data.exit_code || 0) + ')</div>' +
                        '<div class="status info" style="margin-top: 10px;">📊 Vérifiez les logs pour : Vision Sorcière, Potion de mort, Ancien, Victory check, Night_wolves</div>';
                } else {
                    output.className = 'output-section error';
                    status.innerHTML = '<div class="status error">❌ Test terminé avec des erreurs (code: ' + (data.exit_code || 1) + ')</div>';
                }

                // Afficher la sortie
                if (data.output) {
                    output.textContent = data.output;
                } else if (data.error) {
                    output.textContent = 'ERREUR:\n' + data.error + '\n\n' + (data.trace || '');
                }

                // Scroll vers le bas
                output.scrollTop = output.scrollHeight;

            } catch (error) {
                output.className = 'output-section error';
                let errorMessage = 'ERREUR DE CONNEXION:\n' + error.message;
                
                // Si c'est une erreur de parsing JSON, afficher la réponse brute
                if (error.message.includes('JSON')) {
                    errorMessage += '\n\nLa réponse du serveur n\'est pas du JSON valide.';
                }
                
                output.textContent = errorMessage;
                status.innerHTML = '<div class="status error">❌ Erreur lors de l\'exécution: ' + error.message + '</div>';
            } finally {
                // Réactiver le bouton
                runBtn.disabled = false;
                runBtn.textContent = '🚀 Lancer le Test';
            }
        });
    </script>
</body>
</html>
