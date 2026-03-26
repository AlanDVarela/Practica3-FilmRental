const { SecretsManagerClient, GetSecretValueCommand } = require("@aws-sdk/client-secrets-manager");
const { Client } = require("pg");

const secretsClient = new SecretsManagerClient({ region: "us-east-1" });

async function getDbClient() {
    const hostRes = await secretsClient.send(new GetSecretValueCommand({ SecretId: "filmrentals/rds/host" }));
    const credsRes = await secretsClient.send(new GetSecretValueCommand({ SecretId: "filmrentals/rds/credentials" }));
    
    const host = hostRes.SecretString;

    const creds = JSON.parse(credsRes.SecretString);

    const client = new Client({
        host: host,
        user: creds.username,
        password: creds.password,
        database: "postgres", 
        port: 5432,
        ssl: { rejectUnauthorized: false }
    });
    
    await client.connect();
    return client;
}

module.exports = { getDbClient };