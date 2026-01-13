<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>DEBUG // SIMULATION</title>
    @vite(['resources/css/app.css'])
</head>
<body class="bg-black text-white p-4 font-mono text-sm">
    <div class="max-w-4xl mx-auto border-brutal p-4">
        <header class="mb-6 border-b border-white pb-4">
            <h1 class="text-display text-2xl text-red-600">DEBUG CONSOLE</h1>
            <p class="text-gray-500">RUNNING SIMULATION PROTOCOLS</p>
        </header>

        <form id="testForm" class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div class="flex flex-col gap-2 md:col-span-2">
                <label class="flex items-center gap-2">MODE</label>
                <select name="mode" class="bg-black border border-white p-2 text-white focus:outline-none focus:border-red-600">
                    <option value="phpunit_flow" selected>PHPUnit - GameFlowStateMachineTest (nouveau flow night_start)</option>
                    <option value="phpunit_full">PHPUnit - GameFullPlaythroughTest (partie complète tous rôles)</option>
                    <option value="simulation_full">Simulation artisan game:test-full (legacy)</option>
                </select>
            </div>

            <div class="flex flex-col gap-2">
                <label>PLAYERS</label>
                <input type="number" name="players" value="18" class="bg-black border border-white p-2 text-white placeholder-gray-500 focus:outline-none focus:border-red-600">
            </div>
            <div class="flex flex-col gap-2">
                <label>ROUNDS</label>
                <input type="number" name="max-rounds" value="1000" class="bg-black border border-white p-2 text-white placeholder-gray-500 focus:outline-none focus:border-red-600">
            </div>
            <div class="flex flex-col gap-2">
                <label>HOST</label>
                <input type="text" name="host" value="levillage.test" class="bg-black border border-white p-2 text-white placeholder-gray-500 focus:outline-none focus:border-red-600">
            </div>
            <div class="flex flex-col gap-2">
                <label>PORT</label>
                <input type="number" name="port" value="80" class="bg-black border border-white p-2 text-white placeholder-gray-500 focus:outline-none focus:border-red-600">
            </div>
            <button type="submit" id="runBtn" class="col-span-full btn-brutal bg-white text-black hover:bg-red-600 hover:text-white transition-none">
                EXECUTE SEQUENCE
            </button>
        </form>

        <div id="status" class="mb-4"></div>
        <pre id="output" class="hidden bg-[#111] border border-[#333] p-4 h-96 overflow-auto text-xs text-green-500 font-mono"></pre>
    </div>

    <script>
        const form = document.getElementById('testForm');
        const runBtn = document.getElementById('runBtn');
        const output = document.getElementById('output');
        const status = document.getElementById('status');

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            runBtn.disabled = true;
            runBtn.textContent = 'PROCESSING...';
            output.classList.remove('hidden');
            output.textContent = '> INITIALIZING...\n';
            status.innerHTML = '';
            
            const formData = new FormData(form);
            const params = new URLSearchParams();
            for (const [key, value] of formData.entries()) params.append(key, value);

            try {
                const csrfMeta = document.querySelector('meta[name="csrf-token"]');
                const csrfToken = csrfMeta ? csrfMeta.getAttribute('content') : '';
                if(csrfToken) params.append('_token', csrfToken);
                
                const response = await fetch('/test-game/run', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'X-Requested-With': 'XMLHttpRequest',
                        'X-CSRF-TOKEN': csrfToken,
                    },
                    body: params.toString()
                });

                let data;
                if (!response.ok) {
                    // Essayer quand même de lire la réponse JSON pour afficher l'erreur serveur
                    try {
                        data = await response.json();
                    } catch (err) {
                        throw new Error(`HTTP ${response.status}`);
                    }
                } else {
                    data = await response.json();
                }
                
                const mode = formData.get('mode');
                const label = mode === 'phpunit_flow' ? 'PHPUNIT FLOW' : 'SIMULATION';
                const exitCode = data && typeof data.exit_code !== 'undefined' ? data.exit_code : 'N/A';
                if (data && data.success) {
                    status.innerHTML = '<div class="text-green-500 border border-green-500 p-2 uppercase">' + label + ' SUCCESS (CODE ' + exitCode + ')</div>';
                } else {
                    status.innerHTML = '<div class="text-red-500 border border-red-500 p-2 uppercase">' + label + ' FAILURE (CODE ' + exitCode + ')</div>';
                }

                output.textContent = (data && (data.output || data.error || data.trace)) ? (data.output || data.error || data.trace) : 'No output';
                output.scrollTop = output.scrollHeight;

            } catch (error) {
                status.innerHTML = '<div class="text-red-500 uppercase">ERROR: ' + error.message + '</div>';
            } finally {
                runBtn.disabled = false;
                runBtn.textContent = 'EXECUTE SEQUENCE';
            }
        });
    </script>
</body>
</html>
