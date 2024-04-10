<?php 

return [

/*
 * You can enable CORS for 1 or multiple paths.
 * Example: ['api/*']
 */
'paths' => ['api/*'],

/*
 * Matches the request method. `[*]` allows all methods.
 */
'allowed_methods' => ['*'],

/*
 * Matches the request origin. `[*]` allows all origins.
 */
'allowed_origins' => ['http://localhost:4200'],

/*
 * Matches the request origin with, similar to `Access-Control-Allow-Credentials`
 */
'supports_credentials' => false,

/*
 * Sets the cache duration for the preflight response in seconds. 0 means always send it.
 */
'max_age' => 0,

/*
 * Sets the allowed headers.
 */
'allowed_headers' => ['Content-Type', 'Authorization'],

/*
 * Sets the allowed headers when credentials are supported.
 */
'exposed_headers' => [],

];
