<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;


class ResetPassword extends Mailable
{
    use Queueable, SerializesModels;
    public $token;
    /**
     * Create a new message instance.
     */
    public function __construct($token)
    {

        $this->token = $token;


    }

    public function build()
    {
        Log::info('New token generated:', [$this->token]);
        return $this->markdown('Email.passwordReset')->with([
            'token' => $this->token
                ]);
    }

}
