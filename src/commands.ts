"use strict";

import type { ApplicationCommandData, Snowflake } from "discord.js";

export const CommandData: { [name: string]: { id?: Snowflake; data: ApplicationCommandData } } = {
    reagent: {
        data: {
            name: "reagent",
            description: "Get reagent(s) from Wako's data base.",
            options: [
                {
                    type: 3,
                    name: "name",
                    description: "Reagent's name",
                    required: true,
                },
            ],
        },
        id: "1053217885721464895",
    },
    ping: {
        data: {
            name: "ping",
            description: "Returns ping",
        },
        id: "1053218590737838181",
    },
};
