import { WebSocket } from 'ws';
import { Version } from './version.js';
import { Session } from './base.js';
import { ClientEncryption } from './encrypt.js';
import { EncryptionMode } from './protocol.js';
export class WSClient extends Session {
    eventListenMap;
    constructor(address, version) {
        super(new WebSocket(address), version);
        this.eventListenMap = new Map();
        this.setHandler("subscribe" /* RequestPurpose.Subscribe */, (frame) => {
            const { eventName } = frame.body;
            const isEventListening = this.eventListenMap.get(eventName);
            if (!isEventListening) {
                this.emit('subscribe', {
                    ...frame,
                    eventName
                });
                this.eventListenMap.set(eventName, true);
            }
        });
        this.setHandler("unsubscribe" /* RequestPurpose.Unsubscribe */, (frame) => {
            const { eventName } = frame.body;
            const isEventListening = this.eventListenMap.get(eventName);
            if (isEventListening) {
                this.emit('unsubscribe', {
                    ...frame,
                    eventName
                });
                this.eventListenMap.set(eventName, false);
            }
        });
        this.setHandler("commandRequest" /* RequestPurpose.Command */, (frame) => {
            const { requestId, body } = frame;
            const respond = (body) => {
                this.respondCommand(requestId, body);
            };
            if (body.commandLine) {
                const handleEncryptionHandshake = () => this.handleEncryptionHandshake(frame.requestId, commandLine);
                const { commandLine } = body;
                this.emit('command', {
                    ...frame,
                    commandLine,
                    respond,
                    handleEncryptionHandshake
                });
            }
            else {
                const { name, overload, input } = body;
                this.emit('commandLegacy', {
                    ...frame,
                    commandName: name,
                    overload,
                    input,
                    respond,
                    handleEncryptionHandshake: () => {
                        throw new Error('Not supported');
                    }
                });
            }
        });
        this.setHandler("action:agent" /* RequestPurpose.AgentAction */, (frame) => {
            const { requestId, body } = frame;
            const respondCommand = (body) => {
                this.respondCommand(requestId, body);
            };
            const respondAgentAction = (action, actionName, body) => {
                this.respondAgentAction(requestId, action, actionName, body);
            };
            const { commandLine } = body;
            this.emit('agentAction', {
                ...frame,
                commandLine,
                respondCommand,
                respondAgentAction
            });
        });
        this.setHandler("chat:subscribe" /* RequestPurpose.ChatMessageSubscribe */, (frame) => {
            const { sender, receiver, message } = frame.body;
            this.emit('chatSubscribe', {
                ...frame,
                sender,
                receiver,
                chatMessage: message
            });
        });
        this.setHandler("chat:unsubscribe" /* RequestPurpose.ChatMessageUnsubscribe */, (frame) => {
            const { requestId } = frame.body;
            this.emit('chatUnsubscribe', {
                ...frame,
                subscribeRequestId: requestId
            });
        });
        this.setHandler("ws:encrypt" /* RequestPurpose.EncryptConnection */, (frame) => {
            const { requestId, body } = frame;
            const { mode, publicKey, salt } = body;
            let cancelled;
            let completed;
            const cancel = () => {
                if (completed) {
                    throw new Error('Cannot cancel a completed encrypt request.');
                }
                cancelled = true;
            };
            const event = { cancel };
            this.emit('encryptRequest', event);
            if (!cancelled) {
                const keyExchangeResult = this.handleKeyExchange(mode, publicKey, salt);
                this.sendEncryptResponse(requestId, keyExchangeResult.publicKey);
                keyExchangeResult.complete();
                completed = true;
            }
        });
    }
    handleKeyExchange(mode, serverPubKey, salt) {
        const encryption = new ClientEncryption();
        const keyExchangeParams = encryption.beginKeyExchange();
        encryption.completeKeyExchange(mode, serverPubKey, salt);
        return {
            publicKey: keyExchangeParams.publicKey,
            complete: () => {
                this.setEncryption(encryption);
            }
        };
    }
    handleEncryptionHandshake(requestId, commandLine) {
        if (commandLine.startsWith('enableencryption ')) {
            const args = commandLine.split(' ');
            const mode = args[3] ?? EncryptionMode.Aes256cfb8;
            const keyExchangeResult = this.handleKeyExchange(mode, JSON.parse(args[1]), JSON.parse(args[2]));
            this.respondCommand(requestId, {
                publicKey: keyExchangeResult.publicKey,
                statusCode: 0
            });
            keyExchangeResult.complete();
            return true;
        }
        return false;
    }
    sendError(statusCode, statusMessage, requestId) {
        this.sendFrame("error" /* ResponsePurpose.Error */, {
            statusCode,
            statusMessage
        }, requestId);
    }
    sendEvent(eventName, body) {
        if (this.version >= Version.V1_1_0) {
            this.sendFrame("event" /* ResponsePurpose.Event */, body, undefined, { eventName });
        }
        else {
            this.sendFrame("event" /* ResponsePurpose.Event */, {
                ...body,
                eventName
            });
        }
    }
    publishEvent(eventName, body) {
        const isEventListening = this.eventListenMap.get(eventName);
        if (isEventListening) {
            this.sendEvent(eventName, body);
        }
    }
    respondCommand(requestId, body) {
        this.sendFrame("commandResponse" /* ResponsePurpose.Command */, body, requestId);
    }
    respondAgentAction(requestId, action, actionName, body) {
        this.sendFrame("action:agent" /* ResponsePurpose.AgentAction */, body, requestId, { action, actionName });
    }
    sendChat(requestId, type, sender, receiver, message) {
        this.sendFrame("chat" /* ResponsePurpose.ChatMessage */, { type, sender, receiver, message }, requestId);
    }
    setDataResponser(dataType, responser) {
        this.setHandler(`data:${dataType}`, (frame) => {
            const respond = (body) => {
                this.sendDataResponse(frame.requestId, dataType, 0, body);
            };
            responser({
                ...frame,
                respond
            });
            return true;
        });
    }
    clearDataResponser(dataType) {
        this.clearHandler(`data:${dataType}`);
    }
    sendDataResponse(requestId, dataType, type, body) {
        this.sendFrame("data" /* ResponsePurpose.Data */, body, requestId, { dataType, type });
    }
    sendEncryptResponse(requestId, publicKey, body) {
        this.sendFrame("ws:encrypt" /* ResponsePurpose.EncryptConnection */, { ...body, publicKey }, requestId);
    }
    disconnect() {
        this.socket.close();
    }
}
/* eslint-enable */
//# sourceMappingURL=client.js.map