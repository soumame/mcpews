import EventEmitter from 'eventemitter3';
import { Version } from './version.js';
export class Session extends EventEmitter {
    socket;
    version;
    encrypted;
    encryption;
    responserMap;
    handlerMap;
    constructor(socket, version) {
        super();
        this.socket = socket;
        this.version = version ?? Version.V0_0_1;
        this.encrypted = false;
        this.encryption = null;
        this.responserMap = new Map();
        this.handlerMap = new Map();
        this.socket.on('message', (messageData) => {
            let decryptedMessageData = messageData;
            let frame;
            try {
                if (this.encryption) {
                    if (!this.encrypted && !String(messageData).trim().startsWith('{')) {
                        this.encrypted = true;
                    }
                    if (this.encrypted) {
                        decryptedMessageData = this.encryption.decrypt(messageData);
                    }
                }
                const message = JSON.parse(String(decryptedMessageData));
                const { header, body } = message;
                const { messagePurpose: purpose, requestId, version } = header;
                frame = {
                    session: this,
                    message,
                    header,
                    body,
                    purpose,
                    requestId,
                    version
                };
            }
            catch (err) {
                this.emit('error', err);
                return;
            }
            this.emit('message', frame);
            const responser = this.responserMap.get(frame.requestId);
            if (responser) {
                let ret;
                try {
                    ret = responser.call(this, frame);
                }
                catch (err) {
                    this.emit('error', err);
                }
                if (typeof ret === 'boolean') {
                    if (ret) {
                        this.responserMap.delete(frame.requestId);
                    }
                    return;
                }
            }
            const handler = this.handlerMap.get(frame.purpose);
            if (handler) {
                let ret;
                try {
                    ret = handler.call(this, frame);
                }
                catch (err) {
                    this.emit('error', err);
                }
                if (typeof ret === 'boolean') {
                    if (ret) {
                        this.handlerMap.delete(frame.purpose);
                    }
                    return;
                }
            }
            this.emit('customFrame', frame);
        });
        this.socket.on('close', () => {
            this.emit('disconnect', this);
        });
    }
    isEncrypted() {
        return this.encrypted;
    }
    sendMessage(message) {
        let messageData = JSON.stringify(message);
        if (this.encryption) {
            messageData = this.encryption.encrypt(messageData);
        }
        this.socket.send(messageData);
    }
    sendFrame(purpose, body, requestId, extraHeaders) {
        this.sendMessage({
            header: {
                version: this.version,
                requestId: requestId ?? '00000000-0000-0000-0000-000000000000',
                messagePurpose: purpose,
                ...extraHeaders
            },
            body
        });
    }
    hasResponser(requestId) {
        return this.responserMap.has(requestId);
    }
    /**
     * Do not specify the type of frame in responser if you want to validate the frame.
     */
    setResponser(requestId, responser) {
        if (this.responserMap.has(requestId)) {
            throw new Error(`Cannot attach responser to request: ${requestId}`);
        }
        this.responserMap.set(requestId, responser);
    }
    clearResponser(requestId) {
        return this.responserMap.delete(requestId);
    }
    hasHandler(purpose) {
        return this.handlerMap.has(purpose);
    }
    /**
     * Do not specify the type of frame in handler if you want to validate the frame.
     */
    setHandler(purpose, handler) {
        if (this.handlerMap.has(purpose)) {
            throw new Error(`Cannot attach handler to purpose: ${purpose}`);
        }
        this.handlerMap.set(purpose, handler);
    }
    clearHandler(purpose) {
        return this.handlerMap.delete(purpose);
    }
    setEncryption(encryption) {
        this.encryption = encryption;
        if (encryption) {
            this.emit('encryptionEnabled', this);
        }
    }
}
/* eslint-enable */
//# sourceMappingURL=base.js.map