import { WebSocketServer } from 'ws';
import { randomUUID } from 'node:crypto';
import { implementName, ServerEncryption } from './encrypt.js';
import { MinecraftCommandVersion, Version } from './version.js';
import { Session } from './base.js';
import { EncryptionMode } from './protocol.js';
export class ClientError extends Error {
    frame;
    requestId;
    statusCode;
    statusMessage;
    constructor(frame) {
        const { statusMessage, statusCode } = frame.body;
        super(statusMessage);
        this.frame = frame;
        this.requestId = frame.requestId;
        this.statusCode = statusCode;
        this.statusMessage = statusMessage;
    }
}
export class ServerSession extends Session {
    server;
    exchangingKey;
    eventListeners;
    chatResponsers;
    constructor(server, socket) {
        super(socket, server.version);
        this.server = server;
        this.eventListeners = new Map();
        this.chatResponsers = new Set();
        this.exchangingKey = false;
        const eventHandler = (frame) => {
            const eventName = frame.header.eventName ?? frame.body.eventName;
            if (eventName !== undefined) {
                const listeners = this.eventListeners.get(eventName);
                const eventFrame = {
                    ...frame,
                    eventName
                };
                if (listeners) {
                    const listenersCopy = new Set(listeners);
                    listenersCopy.forEach((e) => {
                        try {
                            e.call(this, eventFrame);
                        }
                        catch (err) {
                            this.emit('error', err);
                        }
                    });
                }
                else {
                    this.emit('event', eventFrame);
                }
            }
            return false;
        };
        this.setHandler("event" /* ResponsePurpose.Event */, eventHandler);
        this.setHandler("chat" /* ResponsePurpose.ChatMessage */, eventHandler);
        this.setHandler("commandResponse" /* ResponsePurpose.Command */, (frame) => {
            this.emit('commandResponse', frame);
            return false;
        });
        this.setHandler("error" /* ResponsePurpose.Error */, (frame) => {
            this.emit('clientError', new ClientError(frame));
            return false;
        });
    }
    enableEncryption(arg1, arg2) {
        console.log('enableEncryption called');
        if (this.exchangingKey || this.encryption) {
            return false;
        }
        const encryption = new ServerEncryption();
        const keyExchangeParams = encryption.beginKeyExchange();
        const mode = typeof arg1 === 'string' ? arg1 : EncryptionMode.Aes256cfb8;
        const callback = typeof arg1 === 'function' ? arg1 : arg2;
        this.exchangingKey = true;
        if (this.version >= Version.V1_0_0) {
            const requestId = randomUUID();
            this.sendEncryptionRequest(requestId, mode, keyExchangeParams.publicKey, keyExchangeParams.salt);
            this.setResponser(requestId, (frame) => {
                if (frame.purpose === "ws:encrypt" /* ResponsePurpose.EncryptConnection */) {
                    const frameBase = frame;
                    this.exchangingKey = false;
                    encryption.completeKeyExchange(mode, frameBase.body.publicKey);
                    this.setEncryption(encryption);
                    if (callback)
                        callback.call(this, this);
                    return true;
                }
            });
        }
        else {
            this.sendCommand([
                'enableencryption',
                JSON.stringify(keyExchangeParams.publicKey),
                JSON.stringify(keyExchangeParams.salt),
                mode
            ], (frame) => {
                const frameBase = frame;
                this.exchangingKey = false;
                encryption.completeKeyExchange(mode, frameBase.body.publicKey);
                this.setEncryption(encryption);
                if (callback)
                    callback.call(this, this);
            });
        }
        return true;
    }
    subscribeRaw(eventName) {
        this.sendFrame("subscribe" /* RequestPurpose.Subscribe */, { eventName });
    }
    subscribe(eventName, callback) {
        let listeners = this.eventListeners.get(eventName);
        if (!listeners) {
            listeners = new Set();
            this.eventListeners.set(eventName, listeners);
            this.subscribeRaw(eventName);
        }
        listeners.add(callback);
    }
    unsubscribeRaw(eventName) {
        this.sendFrame("unsubscribe" /* RequestPurpose.Unsubscribe */, { eventName });
    }
    unsubscribe(eventName, callback) {
        const listeners = this.eventListeners.get(eventName);
        if (!listeners) {
            return;
        }
        listeners.delete(callback);
        if (listeners.size === 0) {
            this.eventListeners.delete(eventName);
            this.unsubscribeRaw(eventName);
        }
    }
    sendCommandRaw(requestId, command, version) {
        this.sendFrame("commandRequest" /* RequestPurpose.Command */, {
            version: version ?? MinecraftCommandVersion.Initial,
            commandLine: Array.isArray(command) ? command.join(' ') : command,
            origin: {
                type: 'player'
            }
        }, requestId);
    }
    sendCommand(command, callback) {
        const requestId = randomUUID();
        if (callback) {
            this.setResponser(requestId, (frame) => {
                if (frame.purpose === "commandResponse" /* ResponsePurpose.Command */) {
                    callback.call(this, frame);
                    return true;
                }
            });
        }
        this.sendCommandRaw(requestId, command);
        return requestId;
    }
    sendCommandLegacyRaw(requestId, commandName, overload, input) {
        this.sendFrame("commandRequest" /* RequestPurpose.Command */, {
            version: MinecraftCommandVersion.Initial,
            name: commandName,
            overload,
            input,
            origin: { type: 'player' }
        }, requestId);
    }
    sendCommandLegacy(commandName, overload, input, callback) {
        const requestId = randomUUID();
        if (callback) {
            this.setResponser(requestId, (frame) => {
                if (frame.purpose === "commandResponse" /* ResponsePurpose.Command */) {
                    callback.call(this, frame);
                    return true;
                }
            });
        }
        this.sendCommandLegacyRaw(requestId, commandName, overload, input);
        return requestId;
    }
    sendAgentCommandRaw(requestId, agentCommand, version) {
        this.sendFrame("action:agent" /* RequestPurpose.AgentAction */, {
            version: version ?? MinecraftCommandVersion.Initial,
            commandLine: Array.isArray(agentCommand) ? agentCommand.join(' ') : agentCommand
        }, requestId);
    }
    sendAgentCommand(command, callback) {
        const requestId = randomUUID();
        if (callback) {
            let commandResponse;
            this.setResponser(requestId, (frame) => {
                if (frame.purpose === "commandResponse" /* ResponsePurpose.Command */) {
                    commandResponse = frame;
                    return false;
                }
                if (frame.purpose === "action:agent" /* ResponsePurpose.AgentAction */) {
                    const { action, actionName } = frame.header;
                    const agentActionFrame = {
                        ...frame,
                        action,
                        actionName,
                        commandResponse
                    };
                    callback.call(this, agentActionFrame);
                    return true;
                }
            });
        }
        this.sendAgentCommandRaw(requestId, command);
        return requestId;
    }
    cancelCommandRequest(requestId) {
        return this.clearResponser(requestId);
    }
    subscribeChatRaw(requestId, sender, receiver, message) {
        this.sendFrame("chat:subscribe" /* RequestPurpose.ChatMessageSubscribe */, { sender, receiver, message }, requestId);
    }
    subscribeChat(sender, receiver, message, callback) {
        const requestId = randomUUID();
        if (callback) {
            this.setResponser(requestId, (frame) => {
                if (frame.purpose === "chat" /* ResponsePurpose.ChatMessage */) {
                    const frameBase = frame;
                    const eventName = frameBase.header.eventName ?? frameBase.body.eventName ?? '';
                    const { sender, receiver, message: chatMessage, type: chatType } = frameBase.body;
                    const chatFrame = {
                        ...frameBase,
                        eventName,
                        sender,
                        receiver,
                        chatMessage,
                        chatType
                    };
                    callback.call(this, chatFrame);
                }
            });
            this.chatResponsers.add(requestId);
        }
        this.subscribeChatRaw(requestId, sender, receiver, message);
        return requestId;
    }
    unsubscribeChatRaw(requestId) {
        this.sendFrame("chat:unsubscribe" /* RequestPurpose.ChatMessageUnsubscribe */, { requestId });
    }
    unsubscribeChat(requestId) {
        if (this.chatResponsers.delete(requestId)) {
            this.unsubscribeChatRaw(requestId);
            this.clearResponser(requestId);
        }
    }
    unsubscribeChatAll() {
        this.unsubscribeChatRaw();
        this.chatResponsers.forEach((requestId) => this.clearResponser(requestId));
        this.chatResponsers.clear();
    }
    fetchDataRaw(requestId, dataType) {
        this.sendFrame(`data:${dataType}`, null, requestId);
    }
    fetchData(dataType, callback) {
        const requestId = randomUUID();
        if (callback) {
            this.setResponser(requestId, (frame) => {
                if (frame.purpose === "data" /* ResponsePurpose.Data */) {
                    const frameBase = frame;
                    const dataFrame = {
                        ...frameBase,
                        dataType: frameBase.header.dataType
                    };
                    callback.call(this, dataFrame);
                    return true;
                }
            });
        }
        this.fetchDataRaw(requestId, dataType);
        return requestId;
    }
    sendEncryptionRequest(requestId, mode, publicKey, salt) {
        console.log('sendEncryptionRequest called');
        this.sendFrame("ws:encrypt" /* RequestPurpose.EncryptConnection */, { mode, publicKey, salt }, requestId);
    }
    disconnect(force) {
        if (force) {
            this.socket.close();
        }
        else {
            this.sendCommand('closewebsocket');
        }
    }
}
const kSecWebsocketKey = Symbol('sec-websocket-key');
export class WSServer extends WebSocketServer {
    sessions;
    version;
    constructor(port, handleClient) {
        super({
            port,
            handleProtocols: (protocols) => (protocols.has(implementName) ? implementName : false)
        });
        this.sessions = new Set();
        this.version = Version.V0_0_1;
        this.on('connection', (socket, request) => {
            const session = new ServerSession(this, socket);
            this.sessions.add(session);
            this.emit('client', { server: this, session, request });
            socket.on('close', () => {
                this.sessions.delete(session);
            });
        });
        if (handleClient) {
            this.on('client', handleClient);
        }
    }
    // overwrite handleUpgrade to skip sec-websocket-key format test
    // minecraft pe pre-1.2 use a shorter version of sec-websocket-key
    handleUpgrade(request, socket, upgradeHead, callback) {
        const key = request.headers['sec-websocket-key'];
        if (key && /^[+/0-9A-Za-z]{11}=$/.test(key)) {
            request.headers['sec-websocket-key'] = `skipkeytest${key}=`;
            request[kSecWebsocketKey] = key;
            console.log('skip sec-websocket-key test');
        }
        console.log('handleUpgrade');
        super.handleUpgrade(request, socket, upgradeHead, callback);
    }
    // same reason as above
    completeUpgrade(extensions, key, protocols, req, socket, head, cb) {
        WebSocketServer.prototype.completeUpgrade.call(this, extensions, req[kSecWebsocketKey] ?? key, protocols, req, socket, head, cb);
        console.log('completeUpgrade. ');
    }
    broadcastCommand(command, callback) {
        this.sessions.forEach((e) => {
            e.sendCommand(command, callback);
        });
    }
    broadcastSubscribe(eventName, callback) {
        this.sessions.forEach((e) => {
            e.subscribe(eventName, callback);
        });
    }
    broadcastUnsubscribe(eventName, callback) {
        this.sessions.forEach((e) => {
            e.unsubscribe(eventName, callback);
        });
    }
    disconnectAll(force) {
        this.sessions.forEach((e) => {
            e.disconnect(force);
        });
    }
}
/* eslint-enable */
//# sourceMappingURL=server.js.map