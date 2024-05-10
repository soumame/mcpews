export var EncryptionMode;
(function (EncryptionMode) {
    EncryptionMode["Aes256cfb8"] = "cfb8";
    EncryptionMode["Aes256cfb"] = "cfb";
    /** @deprecated Alias of Aes256cfb */
    EncryptionMode["Aes256cfb128"] = "cfb128";
})(EncryptionMode || (EncryptionMode = {}));
export var MinecraftAgentActionType;
(function (MinecraftAgentActionType) {
    MinecraftAgentActionType[MinecraftAgentActionType["Attack"] = 1] = "Attack";
    MinecraftAgentActionType[MinecraftAgentActionType["Collect"] = 2] = "Collect";
    MinecraftAgentActionType[MinecraftAgentActionType["Destroy"] = 3] = "Destroy";
    MinecraftAgentActionType[MinecraftAgentActionType["DetectRedstone"] = 4] = "DetectRedstone";
    /** @deprecated */
    MinecraftAgentActionType[MinecraftAgentActionType["DetectObstacle"] = 5] = "DetectObstacle";
    MinecraftAgentActionType[MinecraftAgentActionType["Drop"] = 6] = "Drop";
    MinecraftAgentActionType[MinecraftAgentActionType["DropAll"] = 7] = "DropAll";
    MinecraftAgentActionType[MinecraftAgentActionType["Inspect"] = 8] = "Inspect";
    MinecraftAgentActionType[MinecraftAgentActionType["InspectData"] = 9] = "InspectData";
    MinecraftAgentActionType[MinecraftAgentActionType["InspectItemCount"] = 10] = "InspectItemCount";
    MinecraftAgentActionType[MinecraftAgentActionType["InspectItemDetail"] = 11] = "InspectItemDetail";
    MinecraftAgentActionType[MinecraftAgentActionType["InspectItemSpace"] = 12] = "InspectItemSpace";
    MinecraftAgentActionType[MinecraftAgentActionType["Interact"] = 13] = "Interact";
    MinecraftAgentActionType[MinecraftAgentActionType["Move"] = 14] = "Move";
    MinecraftAgentActionType[MinecraftAgentActionType["PlaceBlock"] = 15] = "PlaceBlock";
    MinecraftAgentActionType[MinecraftAgentActionType["Till"] = 16] = "Till";
    MinecraftAgentActionType[MinecraftAgentActionType["TransferItemTo"] = 17] = "TransferItemTo";
    MinecraftAgentActionType[MinecraftAgentActionType["Turn"] = 18] = "Turn";
})(MinecraftAgentActionType || (MinecraftAgentActionType = {}));
export var ChatEventFrameType;
(function (ChatEventFrameType) {
    ChatEventFrameType["Chat"] = "chat";
    ChatEventFrameType["Tell"] = "tell";
    ChatEventFrameType["Say"] = "say";
    ChatEventFrameType["Me"] = "me";
    ChatEventFrameType["Title"] = "title";
    // To be filled
})(ChatEventFrameType || (ChatEventFrameType = {}));
export var MinecraftDataType;
(function (MinecraftDataType) {
    MinecraftDataType["Block"] = "block";
    MinecraftDataType["Item"] = "item";
    MinecraftDataType["Mob"] = "mob";
})(MinecraftDataType || (MinecraftDataType = {}));
//# sourceMappingURL=protocol.js.map