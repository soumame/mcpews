import { Version } from './version.js';
import { Frame, Session, SessionEventMap } from './base.js';
import { ChatEventFrameType, ChatSubscribeBody, ChatUnsubscribeBody, CommandRequestBody, CommandRequestLegacyBody, DataRequestPurpose, EncryptionMode, EventSubscriptionBody, MinecraftAgentActionType, RequestPurpose } from './protocol.js';
export type CommandFrameBase = Frame<RequestPurpose.Command, CommandRequestBody>;
export interface CommandFrame extends CommandFrameBase {
    commandLine: string;
    respond(body: unknown): void;
    handleEncryptionHandshake(): boolean;
}
export type LegacyCommandFrameBase = Frame<RequestPurpose.Command, CommandRequestLegacyBody>;
export interface LegacyCommandFrame extends LegacyCommandFrameBase {
    commandName: string;
    overload: string;
    input: Record<string, unknown>;
    respond(body: unknown): void;
}
export type EventSubscribeFrameBase = Frame<RequestPurpose.Subscribe, EventSubscriptionBody>;
export interface SubscribeFrame extends EventSubscribeFrameBase {
    eventName: string;
}
export type EventUnsubscribeFrameBase = Frame<RequestPurpose.Unsubscribe, EventSubscriptionBody>;
export interface UnsubscribeFrame extends EventUnsubscribeFrameBase {
    eventName: string;
}
export type AgentActionFrameBase = Frame<RequestPurpose.AgentAction, CommandRequestBody>;
export interface AgentActionFrame extends AgentActionFrameBase {
    commandLine: string;
    respondCommand(body: unknown): void;
    respondAgentAction(action: MinecraftAgentActionType, actionName: string, body: unknown): void;
}
export type ChatSubscribeFrameBase = Frame<RequestPurpose.ChatMessageSubscribe, ChatSubscribeBody>;
export interface ChatSubscribeFrame extends ChatSubscribeFrameBase {
    sender?: string;
    receiver?: string;
    chatMessage?: string;
}
export type ChatUnsubscribeFrameBase = Frame<RequestPurpose.ChatMessageUnsubscribe, ChatUnsubscribeBody>;
export interface ChatUnsubscribeFrame extends ChatUnsubscribeFrameBase {
    subscribeRequestId: string;
}
export type DataRequestFrameBase<T extends string> = Frame<DataRequestPurpose<T>>;
export interface DataRequestFrame<T extends string> extends DataRequestFrameBase<T> {
    respond(body: unknown): void;
}
export interface EncryptRequest {
    cancel(): void;
}
export declare class WSClient extends Session {
    private eventListenMap;
    constructor(address: string, version?: Version);
    handleKeyExchange(mode: EncryptionMode, serverPubKey: string, salt: string): {
        publicKey: string;
        complete: () => void;
    };
    handleEncryptionHandshake(requestId: string, commandLine: string): boolean;
    sendError(statusCode?: number, statusMessage?: string, requestId?: string): void;
    sendEvent(eventName: string, body: Record<string, unknown>): void;
    publishEvent(eventName: string, body: Record<string, unknown>): void;
    respondCommand(requestId: string, body: unknown): void;
    respondAgentAction(requestId: string, action: MinecraftAgentActionType, actionName: string, body: unknown): void;
    sendChat(requestId: string, type: ChatEventFrameType, sender: string, receiver: string, message: string): void;
    setDataResponser<T extends string = string>(dataType: T, responser: (frame: DataRequestFrame<T>) => void): void;
    clearDataResponser(dataType: string): void;
    sendDataResponse(requestId: string, dataType: string, type: number, body: unknown): void;
    sendEncryptResponse(requestId: string, publicKey: string, body?: Record<string, unknown>): void;
    disconnect(): void;
}
export interface WSClientEventMap extends SessionEventMap {
    subscribe: (event: SubscribeFrame) => void;
    unsubscribe: (event: UnsubscribeFrame) => void;
    command: (event: CommandFrame) => void;
    commandLegacy: (event: LegacyCommandFrame) => void;
    agentAction: (event: AgentActionFrame) => void;
    chatSubscribe: (event: ChatSubscribeFrame) => void;
    chatUnsubscribe: (event: ChatUnsubscribeFrame) => void;
    encryptRequest: (event: EncryptRequest) => void;
}
export interface WSClient {
    on(eventName: 'subscribe', listener: (event: SubscribeFrame) => void): this;
    once(eventName: 'subscribe', listener: (event: SubscribeFrame) => void): this;
    off(eventName: 'subscribe', listener: (event: SubscribeFrame) => void): this;
    addListener(eventName: 'subscribe', listener: (event: SubscribeFrame) => void): this;
    removeListener(eventName: 'subscribe', listener: (event: SubscribeFrame) => void): this;
    emit(eventName: 'subscribe', event: SubscribeFrame): boolean;
    on(eventName: 'unsubscribe', listener: (event: UnsubscribeFrame) => void): this;
    once(eventName: 'unsubscribe', listener: (event: UnsubscribeFrame) => void): this;
    off(eventName: 'unsubscribe', listener: (event: UnsubscribeFrame) => void): this;
    addListener(eventName: 'unsubscribe', listener: (event: UnsubscribeFrame) => void): this;
    removeListener(eventName: 'unsubscribe', listener: (event: UnsubscribeFrame) => void): this;
    emit(eventName: 'unsubscribe', event: UnsubscribeFrame): boolean;
    on(eventName: 'command', listener: (event: CommandFrame) => void): this;
    once(eventName: 'command', listener: (event: CommandFrame) => void): this;
    off(eventName: 'command', listener: (event: CommandFrame) => void): this;
    addListener(eventName: 'command', listener: (event: CommandFrame) => void): this;
    removeListener(eventName: 'command', listener: (event: CommandFrame) => void): this;
    emit(eventName: 'command', event: CommandFrame): boolean;
    on(eventName: 'commandLegacy', listener: (event: LegacyCommandFrame) => void): this;
    once(eventName: 'commandLegacy', listener: (event: LegacyCommandFrame) => void): this;
    off(eventName: 'commandLegacy', listener: (event: LegacyCommandFrame) => void): this;
    addListener(eventName: 'commandLegacy', listener: (event: LegacyCommandFrame) => void): this;
    removeListener(eventName: 'commandLegacy', listener: (event: LegacyCommandFrame) => void): this;
    emit(eventName: 'commandLegacy', event: LegacyCommandFrame): boolean;
    on(eventName: 'agentAction', listener: (event: AgentActionFrame) => void): this;
    once(eventName: 'agentAction', listener: (event: AgentActionFrame) => void): this;
    off(eventName: 'agentAction', listener: (event: AgentActionFrame) => void): this;
    addListener(eventName: 'agentAction', listener: (event: AgentActionFrame) => void): this;
    removeListener(eventName: 'agentAction', listener: (event: AgentActionFrame) => void): this;
    emit(eventName: 'agentAction', event: AgentActionFrame): boolean;
    on(eventName: 'chatSubscribe', listener: (event: ChatSubscribeFrame) => void): this;
    once(eventName: 'chatSubscribe', listener: (event: ChatSubscribeFrame) => void): this;
    off(eventName: 'chatSubscribe', listener: (event: ChatSubscribeFrame) => void): this;
    addListener(eventName: 'chatSubscribe', listener: (event: ChatSubscribeFrame) => void): this;
    removeListener(eventName: 'chatSubscribe', listener: (event: ChatSubscribeFrame) => void): this;
    emit(eventName: 'chatSubscribe', event: ChatSubscribeFrame): boolean;
    on(eventName: 'chatUnsubscribe', listener: (event: ChatUnsubscribeFrame) => void): this;
    once(eventName: 'chatUnsubscribe', listener: (event: ChatUnsubscribeFrame) => void): this;
    off(eventName: 'chatUnsubscribe', listener: (event: ChatUnsubscribeFrame) => void): this;
    addListener(eventName: 'chatUnsubscribe', listener: (event: ChatUnsubscribeFrame) => void): this;
    removeListener(eventName: 'chatUnsubscribe', listener: (event: ChatUnsubscribeFrame) => void): this;
    emit(eventName: 'chatUnsubscribe', event: ChatUnsubscribeFrame): boolean;
    on(eventName: 'encryptRequest', listener: (event: EncryptRequest) => void): this;
    once(eventName: 'encryptRequest', listener: (event: EncryptRequest) => void): this;
    off(eventName: 'encryptRequest', listener: (event: EncryptRequest) => void): this;
    addListener(eventName: 'encryptRequest', listener: (event: EncryptRequest) => void): this;
    removeListener(eventName: 'encryptRequest', listener: (event: EncryptRequest) => void): this;
    emit(eventName: 'encryptRequest', event: EncryptRequest): boolean;
    on(eventName: 'customFrame', listener: (frame: Frame) => void): this;
    once(eventName: 'customFrame', listener: (frame: Frame) => void): this;
    off(eventName: 'customFrame', listener: (frame: Frame) => void): this;
    addListener(eventName: 'customFrame', listener: (frame: Frame) => void): this;
    removeListener(eventName: 'customFrame', listener: (frame: Frame) => void): this;
    emit(eventName: 'customFrame', frame: Frame): boolean;
    on(eventName: 'disconnect', listener: (session: this) => void): this;
    once(eventName: 'disconnect', listener: (session: this) => void): this;
    off(eventName: 'disconnect', listener: (session: this) => void): this;
    addListener(eventName: 'disconnect', listener: (session: this) => void): this;
    removeListener(eventName: 'disconnect', listener: (session: this) => void): this;
    emit(eventName: 'disconnect', session: this): boolean;
    on(eventName: 'encryptionEnabled', listener: (session: this) => void): this;
    once(eventName: 'encryptionEnabled', listener: (session: this) => void): this;
    off(eventName: 'encryptionEnabled', listener: (session: this) => void): this;
    addListener(eventName: 'encryptionEnabled', listener: (session: this) => void): this;
    removeListener(eventName: 'encryptionEnabled', listener: (session: this) => void): this;
    emit(eventName: 'encryptionEnabled', session: this): boolean;
    on(eventName: 'error', listener: (err: Error) => void): this;
    once(eventName: 'error', listener: (err: Error) => void): this;
    off(eventName: 'error', listener: (err: Error) => void): this;
    addListener(eventName: 'error', listener: (err: Error) => void): this;
    removeListener(eventName: 'error', listener: (err: Error) => void): this;
    emit(eventName: 'error', err: Error): boolean;
    on(eventName: 'message', listener: (frame: Frame) => void): this;
    once(eventName: 'message', listener: (frame: Frame) => void): this;
    off(eventName: 'message', listener: (frame: Frame) => void): this;
    addListener(eventName: 'message', listener: (frame: Frame) => void): this;
    removeListener(eventName: 'message', listener: (frame: Frame) => void): this;
    emit(eventName: 'message', frame: Frame): boolean;
}
