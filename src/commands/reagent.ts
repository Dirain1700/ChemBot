"use strict";

import { JSDOM } from "jsdom";
import { EmbedBuilder } from "discord.js";

import type { ChatInputCommandInteraction } from "discord.js";
import type { APIEmbedField } from "discord-api-types/v10";
import type { AxiosResponse, AxiosError } from "axios";

export default async (interaction: ChatInputCommandInteraction<"cached">) => {
    if (!client.isReady() || !interaction.channel) return;

    const name = interaction.options.getString("name", true);
    if (!name) interaction.reply("Error: No arguments provided.");
    interaction.deferReply();

    const url = (reg: string) => "https://labchem-wako.fujifilm.com/jp/product/result/product.html?fw=" + reg;
    const domain = "https://labchem-wako.fujifilm.com";
    axios(url(name))
        .then((res: AxiosResponse): void => {
            /* eslint-disable @typescript-eslint/no-non-null-assertion */
            const dom = new JSDOM(res.data);
            const isNoResult = dom.window.document.querySelectorAll("div.no-result").length > 0;
            if (isNoResult) return void interaction.followUp("No reagents found.");
            // eslint-disable-next-line no-useless-escape
            const LINK_REG = /\/jp\/product\/detail\/[A-Z0-9\-]{6,}\.html/gmu;
            let Descs = [...dom.window.document.querySelectorAll("div.product-name").values()].filter(
                (e) => !e.querySelector(":scope > span.st")
            );
            if (Descs.length > 10) Descs.length = 10;
            Descs = Descs.slice(0, ~~(Descs.length / 2));
            let Details = [...dom.window.document.querySelectorAll("div.product-list-in:not(div.st-discon)").values()];
            if (Details.length > 10) Details.length = 10;
            Details = Details.slice(0, ~~(Details.length / 2));
            const links = Descs.map((elem) => (elem.innerHTML.match(LINK_REG) ?? [])[0] ?? "")
                .map((e) => e.replaceAll("\t", "").replaceAll("\n", "").trim())
                .map((e) => (e ? domain + e : null));
            const manufactures = Descs.map((elim) =>
                (elim.querySelector("dl.manufacturer")!.querySelector("dd")?.innerHTML ?? "")
                    .replaceAll("\t", "")
                    .replaceAll("\n", "")
                    .trim()
            );
            const Grades = Descs.map((elim) =>
                ((elim.querySelector("p.grade")?.querySelector("b") ?? {})?.innerHTML ?? "")
                    .replaceAll("\t", "")
                    .replaceAll("\n", "")
                    .trim()
            );
            const Names = Descs.map((elim) =>
                elim.querySelector("em.name")!.innerHTML.replaceAll("\t", "").replaceAll("\n", "").split("<")[0]!.trim()
            );
            const codes = Details.map((elim) =>
                [...elim.querySelectorAll("div.lb-code")!.values()].map((e) =>
                    (e.querySelector("dd")?.innerHTML ?? "").replaceAll("\t", "").replaceAll("\n", "").trim()
                )
            );
            const CAS = Details.map((elim) =>
                (
                    [...elim.querySelector("div.product-set1")!.querySelectorAll("dl")!.values()]
                        .find((e) => (e.querySelector("dt")?.innerHTML ?? "").startsWith("CAS"))
                        ?.querySelector("dd")?.innerHTML ?? ""
                )
                    .replaceAll("\t", "")
                    .replaceAll("\n", "")
                    .trim()
            );
            const sizes = Details.map((elim) =>
                [...elim.querySelectorAll("td.product-size")!.values()].map((e) =>
                    (e.querySelector("div.product-tbl-in")?.innerHTML ?? "")
                        .replaceAll("\t", "")
                        .replaceAll("\n", "")
                        .trim()
                )
            );
            const prices = Details.map((elim) =>
                [...elim.querySelectorAll("td.product-price")!.values()].map((e) =>
                    (e.querySelector("div.product-tbl-in")!.querySelector("dd")?.innerHTML ?? "")
                        .replaceAll("\t", "")
                        .replaceAll("\n", "")
                        .trim()
                )
            ).map((e) => (e ? e : null));
            const fields: APIEmbedField[] = [];
            for (let i = 0; i < Descs.length; i++) {
                const obj: APIEmbedField = { name: Names[i]!, value: "" };
                let value = "";
                for (let n = 0; n < codes[i]!.length; n++) {
                    if (value) value += "\n";
                    let str = "";
                    str += codes[i]![n];
                    str = str.padEnd(12);
                    str += sizes[i]![n];
                    str = str.padEnd(20);
                    str += prices[i]![n] || "Not for sell";
                    value += str;
                }
                const desc = [];
                desc.push("Manufacture: " + manufactures[i]);
                if (Grades[i]) desc.push("Grade: " + Grades[i]);
                if (CAS[i]) desc.push("CAS RN: " + CAS[i]);
                if (links[i]) desc.push(`[Original link](${links[i]})`);
                if (desc.length) value = desc.join("\n") + "\n" + value;
                obj.value = value;
                fields.push(obj);
            }
            const Embed = new EmbedBuilder()
                .setTitle("Reagent(s) available in Wako")
                .setURL(url(name))
                .setFooter({
                    text: `Note: These are current as of ${new Date().toLocaleString("ja-jp", {
                        timeZone: "Asia/Tokyo",
                    })} and are subject to change by Wako.`,
                })
                .addFields(fields);

            interaction.followUp({ embeds: [Embed], fetchReply: true });
        })
        .catch((e: AxiosError) => interaction.followUp(e.toString()));
};
