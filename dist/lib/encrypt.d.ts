/// <reference types="node" />
/// <reference types="node" />
import crypto from 'node:crypto';
import { EncryptionMode } from './protocol.js';
export declare class Encryption {
    ecdh: crypto.ECDH;
    pubKey: Buffer;
    cipher: crypto.Cipher | null;
    decipher: crypto.Decipher | null;
    constructor();
    initializeCipher(mode: EncryptionMode, secretKey: Buffer, salt: Buffer): void;
    encrypt(str: string): Buffer;
    decrypt(buffer: Buffer): string;
}
export declare class ServerEncryption extends Encryption {
    salt: Buffer;
    constructor();
    beginKeyExchange(): {
        publicKey: string;
        salt: string;
    };
    completeKeyExchange(mode: EncryptionMode, clientPubKeyStr: string): void;
}
export declare class ClientEncryption extends Encryption {
    beginKeyExchange(): {
        publicKey: string;
    };
    completeKeyExchange(mode: EncryptionMode, serverPubKeyStr: string, saltStr: string): void;
}
export declare const implementName = "com.microsoft.minecraft.wsencrypt";
