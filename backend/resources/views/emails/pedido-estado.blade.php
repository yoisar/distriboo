<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; color: #333; line-height: 1.6; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .body { background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
        .footer { text-align: center; padding: 15px; color: #6b7280; font-size: 12px; }
        .badge { display: inline-block; padding: 4px 12px; border-radius: 9999px; font-size: 14px; font-weight: bold; }
        .badge-confirmado { background: #dbeafe; color: #1d4ed8; }
        .badge-en_proceso { background: #fef3c7; color: #92400e; }
        .badge-enviado { background: #d1fae5; color: #065f46; }
        .badge-entregado { background: #d1fae5; color: #065f46; }
        .badge-cancelado { background: #fee2e2; color: #991b1b; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 style="margin:0;">distriboo</h1>
            <p style="margin:5px 0 0;">Actualización de pedido</p>
        </div>
        <div class="body">
            <p>Hola <strong>{{ $pedido->cliente->razon_social }}</strong>,</p>
            <p>El estado de tu pedido <strong>#{{ $pedido->id }}</strong> ha sido actualizado:</p>

            <p style="text-align:center; margin: 20px 0;">
                <span style="color:#6b7280;text-decoration:line-through;">{{ ucfirst(str_replace('_', ' ', $estadoAnterior)) }}</span>
                &rarr;
                <span class="badge badge-{{ $pedido->estado }}">{{ ucfirst(str_replace('_', ' ', $pedido->estado)) }}</span>
            </p>

            <p><strong>Total del pedido:</strong> ${{ number_format($pedido->total, 2, ',', '.') }}</p>

            @if($pedido->fecha_estimada_entrega)
            <p><strong>Entrega estimada:</strong> {{ \Carbon\Carbon::parse($pedido->fecha_estimada_entrega)->format('d/m/Y') }}</p>
            @endif
        </div>
        <div class="footer">
            distriboo &middot; Plataforma B2B de Distribución
        </div>
    </div>
</body>
</html>
