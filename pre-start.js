// pre-start.js
const fs = require('fs');
const path = require('path');

// Checa se a variável de ambiente da Vercel existe
if (process.env.FIREBASE_SERVICE_ACCOUNT_BASE64) {
  console.log('Ambiente Vercel detectado. Criando service-account.json...');

  // Decodifica a string Base64
  const serviceAccountJson = Buffer.from(
    process.env.FIREBASE_SERVICE_ACCOUNT_BASE64,
    'base64'
  ).toString('utf-8');

  // Define o caminho onde o arquivo será salvo
  const filePath = path.join(__dirname, 'service-account.json');

  // Salva o conteúdo no arquivo
  fs.writeFileSync(filePath, serviceAccountJson);

  // Define a variável de ambiente que a biblioteca do Google Cloud procura
  process.env.GOOGLE_APPLICATION_CREDENTIALS = filePath;

  console.log(`Arquivo service-account.json criado em: ${filePath}`);
} else {
  console.log('Ambiente local detectado. Usando service-account.json local...');
  // Para o ambiente local, a configuração será feita no package.json
}