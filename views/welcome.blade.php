<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>WEREWOLF [OFFLINE]</title>
    @vite(['resources/css/app.css', 'resources/js/app.js'])
</head>
<body class="bg-[#000000] text-white h-screen w-screen flex flex-col items-center justify-center p-4 overflow-hidden">
    <div class="panel-brutal w-full max-w-md text-center relative">
        <div class="absolute top-0 left-0 w-full h-1 bg-red-600 animate-blink"></div>

        <h1 class="text-display text-5xl text-white mb-2 mt-4 tracking-widest">WEREWOLF</h1>
        <p class="text-mono text-red-600 text-sm mb-8 tracking-widest">[SYSTEM_FAILURE_IMMINENT]</p>

        <div class="flex flex-col gap-4 px-4 pb-4">
            @if (Route::has('login'))
                @auth
                    <a href="{{ url('/dashboard') }}" class="btn-brutal text-xl">
                        RECONNECT
                    </a>
                @else
                    <a href="{{ route('login') }}" class="btn-brutal text-xl">
                        INITIATE SESSION
                    </a>
                    @if (Route::has('register'))
                        <a href="{{ route('register') }}" class="btn-brutal text-sm opacity-50 hover:opacity-100 border-dim">
                            CREATE NEW IDENTITY
                        </a>
                    @endif
                @endauth
            @endif
        </div>

        <div class="mt-8 text-[10px] text-gray-600 font-mono uppercase">
            System ID: {{ uniqid() }} // LOC: UNKNOWN
        </div>
    </div>
</body>
</html>
