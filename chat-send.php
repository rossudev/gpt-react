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
$jwt = $items['token'];

$privateKey = openssl_pkey_get_private(
    file_get_contents($privateKeyFile),
    $passphrase
);
$publicKey = openssl_pkey_get_details($privateKey)['key'];
$decoded = JWT::decode($jwt, new Key($publicKey, 'RS256'));

if (!$decoded) {
    http_response_code(401);
    header('Content-Type: application/json');
    echo json_encode(array('answer' => false));
    exit();
};

$sendPacket = $items['sendPacket'];
$endPath = $items['endPath'];

$headers = array(
    "Content-Type: application/json",
    "Authorization: Bearer $OPENAI_API_KEY"
);

$curl = curl_init();
curl_setopt($curl, CURLOPT_CONNECTTIMEOUT, 5);
curl_setopt($curl, CURLOPT_POST, true);
curl_setopt($curl, CURLOPT_POSTFIELDS, json_encode($sendPacket));
curl_setopt($curl, CURLOPT_HTTPHEADER, $headers);
curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
curl_setopt($curl, CURLOPT_URL, $endPath);

$response = curl_exec($curl);
curl_close($curl);

header('Content-Type: application/json');
echo json_encode(array('answer' => $response));
?>