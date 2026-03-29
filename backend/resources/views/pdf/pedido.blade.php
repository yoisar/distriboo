<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Pedido #{{ $pedido->id }}</title>
    <style>
        body { font-family: Arial, sans-serif; font-size: 12px; color: #333; margin: 40px; }
        .header { display: flex; justify-content: space-between; margin-bottom: 30px; border-bottom: 2px solid #2563eb; padding-bottom: 15px; }
        .brand { font-size: 24px; font-weight: bold; color: #2563eb; }
        .title { font-size: 18px; color: #666; margin-top: 5px; }
        .info-grid { width: 100%; margin-bottom: 20px; }
        .info-grid td { padding: 4px 15px 4px 0; vertical-align: top; }
        .info-label { color: #888; font-size: 11px; text-transform: uppercase; }
        .info-value { font-weight: bold; }
        .badge { display: inline-block; padding: 3px 10px; border-radius: 12px; font-size: 11px; font-weight: bold; color: white; }
        .badge-pendiente { background: #f59e0b; }
        .badge-confirmado { background: #3b82f6; }
        .badge-en_proceso { background: #8b5cf6; }
        .badge-enviado { background: #06b6d4; }
        .badge-entregado { background: #10b981; }
        .badge-cancelado { background: #ef4444; }
        table.items { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        table.items th { background: #f3f4f6; text-align: left; padding: 8px 12px; font-size: 11px; text-transform: uppercase; color: #666; border-bottom: 2px solid #e5e7eb; }
        table.items td { padding: 8px 12px; border-bottom: 1px solid #e5e7eb; }
        table.items .right { text-align: right; }
        .totals { width: 300px; margin-left: auto; }
        .totals td { padding: 4px 0; }
        .totals .total-row { font-size: 16px; font-weight: bold; border-top: 2px solid #333; padding-top: 8px; }
        .footer { margin-top: 40px; text-align: center; color: #aaa; font-size: 10px; border-top: 1px solid #e5e7eb; padding-top: 15px; }
    </style>
</head>
<body>
    <div class="header">
        <div>
            <div class="brand">distriboo</div>
            <div class="title">Comprobante de Pedido</div>
        </div>
        <div style="text-align: right;">
            <div style="font-size: 20px; font-weight: bold;">Pedido #{{ $pedido->id }}</div>
            <div style="color: #888;">{{ $pedido->created_at->format('d/m/Y H:i') }}</div>
            <div style="margin-top: 5px;">
                <span class="badge badge-{{ $pedido->estado }}">{{ strtoupper(str_replace('_', ' ', $pedido->estado)) }}</span>
            </div>
        </div>
    </div>

    <table class="info-grid">
        <tr>
            <td>
                <div class="info-label">Cliente</div>
                <div class="info-value">{{ $pedido->cliente->razon_social }}</div>
            </td>
            <td>
                <div class="info-label">Email</div>
                <div class="info-value">{{ $pedido->cliente->email }}</div>
            </td>
            <td>
                <div class="info-label">Provincia</div>
                <div class="info-value">{{ $pedido->cliente->provincia->nombre ?? '-' }}</div>
            </td>
            <td>
                <div class="info-label">Entrega estimada</div>
                <div class="info-value">{{ $pedido->fecha_estimada_entrega ? \Carbon\Carbon::parse($pedido->fecha_estimada_entrega)->format('d/m/Y') : '-' }}</div>
            </td>
        </tr>
        @if($pedido->observaciones)
        <tr>
            <td colspan="4">
                <div class="info-label">Observaciones</div>
                <div class="info-value">{{ $pedido->observaciones }}</div>
            </td>
        </tr>
        @endif
    </table>

    <table class="items">
        <thead>
            <tr>
                <th>Producto</th>
                <th>Marca</th>
                <th class="right">Precio Unit.</th>
                <th class="right">Cantidad</th>
                <th class="right">Subtotal</th>
            </tr>
        </thead>
        <tbody>
            @foreach($pedido->detalles as $detalle)
            <tr>
                <td>{{ $detalle->producto->nombre }}</td>
                <td>{{ $detalle->producto->marca ?? '-' }}</td>
                <td class="right">${{ number_format($detalle->precio_unitario, 2, ',', '.') }}</td>
                <td class="right">{{ $detalle->cantidad }}</td>
                <td class="right">${{ number_format($detalle->subtotal, 2, ',', '.') }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>

    <table class="totals">
        <tr>
            <td>Subtotal</td>
            <td class="right">${{ number_format($pedido->subtotal, 2, ',', '.') }}</td>
        </tr>
        <tr>
            <td>Costo logístico</td>
            <td class="right">${{ number_format($pedido->costo_logistico, 2, ',', '.') }}</td>
        </tr>
        <tr class="total-row">
            <td>Total</td>
            <td class="right">${{ number_format($pedido->total, 2, ',', '.') }}</td>
        </tr>
    </table>

    <div class="footer">
        distriboo &middot; Plataforma B2B para distribuidores &middot; distriboo.yoisar.com
    </div>
</body>
</html>
