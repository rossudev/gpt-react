# gpt-react
React app to facilitate interaction with large language model GPT

1. 
Generate the SSH key pair; run `ssh-keygen -t rsa -m pem`; consider using the default filename chatKey.pem
The passphrase you set will permit access to the app.

2. 
Edit the chat-config.php file. You'll need an account from OpenAI to fill in the value for the API key.

3. 
Upload all files from /build/ here into /chat/ on your web server

4. 
Upload the three PHP files, public key file and private key file into the directory above /chat/

5. 
Consider adding the following rule to an .htaccess file inside the directory to protect the private key:

```
<Files "chatKey.pem">
  Order Allow,Deny
  Deny from all
  <FilesMatch "\.(php)$">
    Order Deny,Allow
    Allow from all
  </FilesMatch>
</Files>
```

6. 
In the parent directory containing the PHP files, run `composer init`

7. 
Then run `composer require firebase/php-jwt`

8. 
Access your-domain.com/.../chat/ from your web browser
