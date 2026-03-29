<?php

namespace App\Mail;

use App\Models\Pedido;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class PedidoEstadoMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public Pedido $pedido, public string $estadoAnterior) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "Pedido #{$this->pedido->id} - Estado actualizado a {$this->pedido->estado}",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.pedido-estado',
        );
    }
}
