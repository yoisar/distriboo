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
        table { width: 100%; border-collapse: collapse; margin: 15px 0; }
        th, td { padding: 8px 12px; text-align: left; border-bottom: 1px solid #e5e7eb; }
        th { background: #f3f4f6; font-size: 12px; text-transform: uppercase; color: #6b7280; }
        .total { font-size: 18px; font-weight: bold; color: #2563eb; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 style="margin:0;">distriboo</h1>
            <p style="margin:5px 0 0;">Pedido recibido</p>
        </div>
        <div class="body">
            <p>Hola <strong>{{ $pedido->cliente->razon_social }}</strong>,</p>
            <p>Tu pedido <strong>#{{ $pedido->id }}</strong> fue recibido correctamente.</p>

            <table>
                <thead>
                    <tr>
                        <th>Producto</th>
                        <th style="text-align:right;">Cant.</th>
                        <th style="text-align:right;">Subtotal</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($pedido->detalles as $detalle)
                    <tr>
                        <td>{{ $detalle->producto->nombre }}</td>
                        <td style="text-align:right;">{{ $detalle->cantidad }}</td>
                        <td style="text-align:right;">${{ number_format($detalle->subtotal, 2, ',', '.') }}</td>
                    </tr>
                    @endforeach
                </tbody>
            </table>

            <p><strong>Subtotal:</strong> ${{ number_format($pedido->subtotal, 2, ',', '.') }}</p>
            <p><strong>Costo logístico:</strong> ${{ number_format($pedido->costo_logistico, 2, ',', '.') }}</p>
            <p class="total">Total: ${{ number_format($pedido->total, 2, ',', '.') }}</p>

            @if($pedido->fecha_estimada_entrega)
            <p><strong>Entrega estimada:</strong> {{ \Carbon\Carbon::parse($pedido->fecha_estimada_entrega)->format('d/m/Y') }}</p>
            @endif

            <p>Te notificaremos cuando el estado de tu pedido cambie.</p>
        </div>
        <div class="footer">
            distriboo &middot; Plataforma B2B de Distribución
        </div>
    </div>
</body>
</html>
