"use strict";

import type { Interaction } from "discord.js";

export default () => {
    client.on("ready", () => {
        if (!client.isReady()) return;
        console.log("Logged in as", client.user.tag);
    });

    client.on("interactionCreate", async (interaction: Interaction) => {
        if (!interaction.isCommand() || !interaction.isChatInputCommand() || !interaction.inCachedGuild()) return;
        let filePath: string = "";
        switch (interaction.commandName) {
            case "ping":
                filePath = "ping";
                break;
            case "reagent":
                filePath = "reagent";
                break;
        }
        if (!filePath) return;

        filePath = "./commands/" + filePath;

        (await import(filePath)).default(interaction);
    });
};
