"use strict";

import type { ChatInputCommandInteraction } from "discord.js";

export default async (interaction: ChatInputCommandInteraction<"cached">) => {
    if (!client.isReady() || !interaction.channel) return;

    const now = Date.now();
    const API_LAG = now - interaction.createdTimestamp;
    interaction
        .reply({ content: `WebSocket: ${client.ws.ping}ms\nAPI End Point: ${API_LAG}`, fetchReply: true })
        .then((m) => m.edit(m.content + `\nCPU Loss time: ${Date.now() - now - API_LAG}`));
};
