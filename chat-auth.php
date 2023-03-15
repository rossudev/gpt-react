<?php
require 'chat-config.php';
require_once 'vendor/autoload.php';

// https://github.com/firebase/php-jwt
use Firebase\JWT\JWT;
use Firebase\JWT\Key;

$items = json_decode(file_get_contents('php://input'), true);

if (!$items) {
    http_response_code(401);
    header('Content-Type: application/json');
    echo json_encode(array('answer' => false));
    exit();
};

$passphrase = $items['passphrase'];
$privateGet = file_get_contents($privateKeyFile);

$privateKey = openssl_pkey_get_private(
    $privateGet,
    $passphrase
);

$info = [$privateGet,$passphrase];

if (!$privateKey) {
  http_response_code(401);
  header('Content-Type: application/json');
  echo json_encode(array('token' => false, 'info' => $info));
  exit();
};

$current_time = time();
$expiration_time = $current_time + (12 * 60 * 60); //12 hours

$payload = [
    'iss' => $domain,
    'aud' => $domain,
    'iat' => $current_time,
    'nbf' => $current_time,
    'exp' => $expiration_time
];

$jwt = JWT::encode($payload, $privateKey, 'RS256');

header('Content-Type: application/json');
echo json_encode(array('token' => $jwt));
?>