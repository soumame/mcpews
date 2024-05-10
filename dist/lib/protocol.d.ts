import { MinecraftCommandVersion, Version } from './version';
export interface Message<B = unknown, H extends Header = Header> {
    header: H;
    body: B;
    [key: string]: unknown;
}
export interface Header<Purpose extends string = string> {
    version: Version;
    requestId: string;
    messagePurpose: Purpose;
    [key: string]: unknown;
}
export declare const enum RequestPurpose {
    Command = "commandRequest",
    Subscribe = "subscribe",
    Unsubscribe = "unsubscribe",
    AgentAction = "action:agent",
    ChatMessageSubscribe = "chat:subscribe",
    ChatMessageUnsubscribe = "chat:unsubscribe",
    DataRequestBlock = "data:block",
    DataRequestItem = "data:item",
    DataRequestMob = "data:mob",
    EncryptConnection = "ws:encrypt"
}
export type DataRequestPurpose<T extends string> = `data:${T}`;
export declare const enum ResponsePurpose {
    Command = "commandResponse",
    Error = "error",
    Event = "event",
    AgentAction = "action:agent",
    ChatMessage = "chat",
    Data = "data",
    EncryptConnection = "ws:encrypt"
}
export type EventResponsePurposes = ResponsePurpose.Event | ResponsePurpose.ChatMessage;
export interface CommandRequestBody {
    version: MinecraftCommandVersion;
    commandLine: string;
}
export interface CommandRequestLegacyBody {
    version: MinecraftCommandVersion;
    name: string;
    overload: string;
    input: Record<string, unknown>;
    origin: unknown;
}
export interface EventSubscriptionBody {
    eventName: string;
}
export interface ChatSubscribeBody {
    sender?: string;
    receiver?: string;
    message?: string;
}
export interface ChatUnsubscribeBody {
    requestId?: string;
}
export declare enum EncryptionMode {
    Aes256cfb8 = "cfb8",
    Aes256cfb = "cfb",
    /** @deprecated Alias of Aes256cfb */
    Aes256cfb128 = "cfb128"
}
export interface EncryptRequestBody {
    mode: EncryptionMode | number;
    publicKey: string;
    salt: string;
}
export interface CommandResponseBody {
    statusCode?: number;
    statusMessage?: string;
    [key: string]: unknown;
}
export interface ErrorBody {
    statusCode?: number;
    statusMessage?: string;
}
export interface EventHeader<P extends EventResponsePurposes = EventResponsePurposes> extends Header<P> {
    eventName?: string;
}
export interface EventBody {
    eventName?: string;
    [key: string]: unknown;
}
export declare enum MinecraftAgentActionType {
    Attack = 1,
    Collect = 2,
    Destroy = 3,
    DetectRedstone = 4,
    /** @deprecated */
    DetectObstacle = 5,
    Drop = 6,
    DropAll = 7,
    Inspect = 8,
    InspectData = 9,
    InspectItemCount = 10,
    InspectItemDetail = 11,
    InspectItemSpace = 12,
    Interact = 13,
    Move = 14,
    PlaceBlock = 15,
    Till = 16,
    TransferItemTo = 17,
    Turn = 18
}
export interface MinecraftAgentActionResponseHeader extends Header<ResponsePurpose.AgentAction> {
    action: MinecraftAgentActionType;
    actionName: string;
}
export declare enum ChatEventFrameType {
    Chat = "chat",
    Tell = "tell",
    Say = "say",
    Me = "me",
    Title = "title"
}
export interface ChatEventBody extends EventBody {
    sender: string;
    receiver: string;
    message: string;
    type: ChatEventFrameType;
}
export declare enum MinecraftDataType {
    Block = "block",
    Item = "item",
    Mob = "mob"
}
export interface MinecraftBlockData {
    id: string;
    aux: number;
    name: string;
}
export interface MinecraftItemData {
    id: string;
    aux: number;
    name: string;
}
export interface MinecraftMobData {
    id: string;
    name: string;
}
export interface DataFrameHeader<DataType extends string = MinecraftDataType> extends Header<ResponsePurpose.Data> {
    dataType: DataType;
    type: number;
}
export interface EncryptResponseBody extends CommandResponseBody {
    publicKey: string;
}
