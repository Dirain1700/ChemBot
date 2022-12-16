import { Client } from "discord.js";

declare global {
    var client: typeof import("../src/index").client;
    var config: typeof import("../src/config");
    var axios: typeof import("axios").default;
}
