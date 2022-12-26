"use strict";

import type { ChatInputCommandInteraction } from "discord.js";

export default async (interaction: ChatInputCommandInteraction<"cached">) => {
    if (!client.isReady() || !interaction.channel) return;

    const now = Date.now();
    const API_LAG = now - interaction.createdTimestamp;
    interaction
        .reply({ content: `WebSocket: ${client.ws.ping}ms\nAPI End Point: ${API_LAG}ms`, fetchReply: true })
        .then((message) =>
            message
                .edit(message.content + `\nCPU Loss time: ${Date.now() - now - API_LAG}ms`)
                .catch((error) => interaction.followUp(error.stack).catch(console.error))
        )
        .catch(console.error);
};
