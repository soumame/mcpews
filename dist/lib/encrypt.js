import crypto from 'node:crypto';
import { EncryptionMode } from './protocol.js';
const ecdhCurve = 'secp384r1';
const blockSize = 16;
const cipherAlgorithms = {
    [EncryptionMode.Aes256cfb8]: 'aes-256-cfb8',
    [EncryptionMode.Aes256cfb]: 'aes-256-cfb',
    [EncryptionMode.Aes256cfb128]: 'aes-256-cfb'
};
const hashAlgorithm = 'sha256';
const asn1Header = Buffer.from('3076301006072a8648ce3d020106052b81040022036200', 'hex');
function asOpenSSLPubKey(pubKeyBuffer) {
    return Buffer.concat([asn1Header, pubKeyBuffer]);
}
function asNodejsPubKey(pubKeyBuffer) {
    return pubKeyBuffer.subarray(asn1Header.length);
}
function hashBuffer(algorithm, buffer) {
    const hash = crypto.createHash(algorithm);
    hash.update(buffer);
    return hash.digest();
}
export class Encryption {
    ecdh;
    pubKey;
    cipher;
    decipher;
    constructor() {
        this.ecdh = crypto.createECDH(ecdhCurve);
        this.pubKey = this.ecdh.generateKeys();
        this.cipher = null;
        this.decipher = null;
    }
    initializeCipher(mode, secretKey, salt) {
        const key = hashBuffer(hashAlgorithm, Buffer.concat([salt, secretKey]));
        const initialVector = key.subarray(0, blockSize);
        const cipherAlgorithm = cipherAlgorithms[mode];
        this.cipher = crypto.createCipheriv(cipherAlgorithm, key, initialVector);
        this.decipher = crypto.createDecipheriv(cipherAlgorithm, key, initialVector);
        this.cipher.setAutoPadding(false);
        this.decipher.setAutoPadding(false);
    }
    encrypt(str) {
        if (!this.cipher)
            throw new Error('Encryption is not initialized');
        return this.cipher.update(str, 'utf8');
    }
    decrypt(buffer) {
        if (!this.decipher)
            throw new Error('Encryption is not initialized');
        return this.decipher.update(buffer).toString('utf8');
    }
}
export class ServerEncryption extends Encryption {
    salt;
    constructor() {
        super();
        this.salt = crypto.randomBytes(blockSize);
    }
    beginKeyExchange() {
        return {
            publicKey: asOpenSSLPubKey(this.pubKey).toString('base64'),
            salt: this.salt.toString('base64')
        };
    }
    completeKeyExchange(mode, clientPubKeyStr) {
        const clientPubKey = asNodejsPubKey(Buffer.from(clientPubKeyStr, 'base64'));
        this.initializeCipher(mode, this.ecdh.computeSecret(clientPubKey), this.salt);
    }
}
export class ClientEncryption extends Encryption {
    beginKeyExchange() {
        return {
            publicKey: asOpenSSLPubKey(this.pubKey).toString('base64')
        };
    }
    completeKeyExchange(mode, serverPubKeyStr, saltStr) {
        const serverPubKey = asNodejsPubKey(Buffer.from(serverPubKeyStr, 'base64'));
        const salt = Buffer.from(saltStr, 'base64');
        this.initializeCipher(mode, this.ecdh.computeSecret(serverPubKey), salt);
    }
}
export const implementName = 'com.microsoft.minecraft.wsencrypt';
//# sourceMappingURL=encrypt.js.map