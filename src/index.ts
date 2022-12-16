///<reference types="../types/global"/>

import { Client } from "discord.js";
import * as config from "./config";
import axios from "axios";
import { createServer } from "http";
import { parse } from "querystring";

export const client = new Client(config.options);

global.client = client;
global.config = config;
global.axios = axios;

import handler from "./handler";

handler();

client.login();

createServer((req, res) => {
    if (req.method === "POST") {
        let data = "";
        req.on("data", (chunk) => {
            data += chunk;
        });
        req.on("end", () => {
            if (!data) {
                res.end("No post data");
                return;
            }
            const dataObject = parse(data);
            if (dataObject.type === "wake") {
                res.end();
                return;
            }
        });
    } else if (req.method === "GET") {
        res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
        res.end("Service available");
    }
}).listen(3000);
