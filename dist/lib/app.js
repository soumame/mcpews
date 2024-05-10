const { EventEmitter } = await import('node:events');
import { WSServer } from './server.js';
import { pEvent } from 'p-event';
const ERRORCODE_MASK = 1 << 31;
export class AppSession {
    session;
    constructor(session) {
        this.session = session;
    }
    enableEncryption() {
        return new Promise((resolve) => {
            if (!this.session.enableEncryption(() => {
                resolve(true);
            })) {
                resolve(false);
            }
        });
    }
    isEncrypted() {
        return this.session.isEncrypted();
    }
    on(eventName, listener) {
        if (eventName === 'Disconnect') {
            this.session.on('disconnect', listener);
        }
        else {
            this.session.subscribe(eventName, listener);
        }
        return this;
    }
    once(eventName, listener) {
        const holderListener = () => {
            // delay the unsubscribe request
        };
        const wrappedListener = (frame) => {
            this.off(eventName, wrappedListener);
            listener.call(this, frame);
            this.off(eventName, holderListener);
        };
        this.on(eventName, wrappedListener);
        this.on(eventName, holderListener);
        return this;
    }
    off(eventName, listener) {
        if (eventName === 'Disconnect') {
            this.session.off('disconnect', listener);
        }
        else {
            this.session.unsubscribe(eventName, listener);
        }
        return this;
    }
    addListener(eventName, listener) {
        return this.on(eventName, listener);
    }
    removeListener(eventName, listener) {
        return this.off(eventName, listener);
    }
    waitForEvent(eventName, timeout, filter) {
        return pEvent(this, eventName, { timeout, filter });
    }
    command(commandLine, timeout) {
        let requestId;
        const errorEventPromise = pEvent(this.session, [], { rejectionEvents: ['error', 'clientError'], timeout });
        const callbackPromise = new Promise((resolve, reject) => {
            requestId = this.session.sendCommand(commandLine, (event) => {
                if (!event.body.statusCode || (event.body.statusCode & ERRORCODE_MASK) === 0) {
                    resolve(event);
                }
                else {
                    reject(new Error(event.body.statusMessage));
                }
            });
        });
        const cancel = () => {
            this.session.cancelCommandRequest(requestId);
            errorEventPromise.cancel();
        };
        const racePromise = Promise.race([errorEventPromise, callbackPromise]).finally(() => {
            cancel();
        });
        racePromise.cancel = cancel;
        return racePromise;
    }
    commandLegacy(commandName, overload, input, timeout) {
        let requestId;
        const errorEventPromise = pEvent(this.session, [], { rejectionEvents: ['error', 'clientError'], timeout });
        const callbackPromise = new Promise((resolve, reject) => {
            requestId = this.session.sendCommandLegacy(commandName, overload, input, (event) => {
                if (!event.body.statusCode || (event.body.statusCode & ERRORCODE_MASK) === 0) {
                    resolve(event);
                }
                else {
                    reject(new Error(event.body.statusMessage));
                }
            });
        });
        const cancel = () => {
            this.session.cancelCommandRequest(requestId);
            errorEventPromise.cancel();
        };
        const racePromise = Promise.race([errorEventPromise, callbackPromise]).finally(cancel);
        racePromise.cancel = cancel;
        return racePromise;
    }
    disconnect(force, timeout) {
        const promise = pEvent(this.session, 'disconnect', { timeout });
        this.session.disconnect(force);
        return promise;
    }
}
export class WSApp extends EventEmitter {
    server;
    sessions;
    constructor(port, handleSession) {
        super();
        this.server = new WSServer(port, ({ session, request }) => {
            const appSession = new AppSession(session);
            this.sessions.add(appSession);
            this.emit('session', { app: this, session: appSession, request });
            session.on('disconnect', () => {
                this.sessions.delete(appSession);
            });
        });
        this.sessions = new Set();
        if (handleSession) {
            this.on('session', handleSession);
        }
    }
    async forEachSession(f) {
        await Promise.all([...this.sessions].map(f));
    }
    async mapSession(f) {
        return Promise.all([...this.sessions].map(f));
    }
    waitForSession(timeout) {
        return pEvent(this, 'session', { timeout });
    }
    close() {
        this.server.close();
    }
}
//# sourceMappingURL=app.js.map