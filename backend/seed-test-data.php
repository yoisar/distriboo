<?php
use App\Models\User;
use App\Models\Revendedor;
use Illuminate\Support\Facades\Hash;

// 1. Create revendedor test user (if not exists)
$existingRev = User::where('email', 'juan@test.com')->first();
if (!$existingRev) {
    $userRev = User::create([
        'name' => 'Juan Perez',
        'email' => 'juan@test.com',
        'password' => Hash::make('12345678'),
        'role' => 'revendedor',
    ]);
    Revendedor::create([
        'user_id' => $userRev->id,
        'codigo_referido' => 'JUAN2024',
        'porcentaje_base' => 20,
        'activo' => true,
    ]);
    echo "Revendedor created: juan@test.com\n";
} else {
    $existingRev->password = Hash::make('12345678');
    $existingRev->save();
    echo "Revendedor already exists, password reset: juan@test.com\n";
}

// 2. Reset distribuidor password
$userDist = User::where('email', 'admin@heladosdelsur.com')->first();
if ($userDist) {
    $userDist->password = Hash::make('12345678');
    $userDist->save();
    echo "Distribuidor password reset: admin@heladosdelsur.com\n";
}

// 3. Reset cliente password
$userCli = User::where('email', 'norte@demo.com')->first();
if ($userCli) {
    $userCli->password = Hash::make('12345678');
    $userCli->save();
    echo "Cliente password reset: norte@demo.com\n";
}

echo "Done!\n";
