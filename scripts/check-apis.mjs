import fs from "node:fs";
import path from "node:path";

function loadEnvFile(filePath) {
    if (!fs.existsSync(filePath)) return;

    const lines = fs.readFileSync(filePath, "utf8").split("\n");

    for (const line of lines) {
        const trimmed = line.trim();

        if (!trimmed || trimmed.startsWith("#")) continue;

        const cleaned = trimmed.replace(/^export\s+/, "");
        const index = cleaned.indexOf("=");

        if (index === -1) continue;

        const key = cleaned.slice(0, index).trim();
        let value = cleaned.slice(index + 1).trim();

        value = value.replace(/^['"]|['"]$/g, "");

        if (!process.env[key]) {
            process.env[key] = value;
        }
    }
}

loadEnvFile(path.resolve(".env.local"));
loadEnvFile(path.resolve(".env"));

function envAny(names) {
    for (const name of names) {
        if (process.env[name]) return process.env[name];
    }

    return "";
}

function assert(condition, message) {
    if (!condition) {
        throw new Error(message);
    }
}

async function httpJson(url, options = {}, timeoutMs = 15000) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    const startedAt = Date.now();

    try {
        const response = await fetch(url, {
            ...options,
            signal: controller.signal,
        });

        const ms = Date.now() - startedAt;
        const text = await response.text();

        let json = null;

        try {
            json = text ? JSON.parse(text) : null;
        } catch {
            json = null;
        }

        return {
            ok: response.ok,
            status: response.status,
            ms,
            json,
            text,
        };
    } finally {
        clearTimeout(timeout);
    }
}

const results = [];

async function runTest(name, fn) {
    try {
        const output = await fn();

        if (output?.skipped) {
            results.push({
                name,
                status: "SKIP",
                statusCode: "-",
                ms: "-",
                details: output.reason,
            });
            return;
        }

        results.push({
            name,
            status: "PASS",
            statusCode: output?.status ?? "-",
            ms: output?.ms ?? "-",
            details: output?.details ?? "OK",
        });
    } catch (error) {
        results.push({
            name,
            status: "FAIL",
            statusCode: error?.status ?? "-",
            ms: "-",
            details: error?.message ?? String(error),
        });
    }
}

await runTest("Open Food Facts barcode lookup", async () => {
    const url =
        "https://world.openfoodfacts.org/api/v2/product/3017620422003.json?fields=code,product_name,categories_tags,nutriscore_grade,ecoscore_grade";

    const response = await httpJson(url, {
        headers: {
            Accept: "application/json",
            "User-Agent": "CarbonCompass/1.0 - API health check",
        },
    });

    assert(response.ok, `HTTP ${response.status}: ${response.text.slice(0, 300)}`);

    assert(
        response.json?.status === 1 || response.json?.product,
        "Unexpected Open Food Facts response shape"
    );

    return {
        status: response.status,
        ms: response.ms,
        details: response.json?.product?.product_name || "Product found",
    };
});

await runTest("openrouteservice directions", async () => {
    const key = envAny(["OPENROUTESERVICE_API_KEY", "ORS_API_KEY"]);

    if (!key) {
        return {
            skipped: true,
            reason: "Missing OPENROUTESERVICE_API_KEY or ORS_API_KEY.",
        };
    }

    const url =
        "https://api.openrouteservice.org/v2/directions/driving-car?start=8.681495,49.41461&end=8.687872,49.420318";

    const response = await httpJson(url, {
        headers: {
            Accept: "application/geo+json",
            Authorization: key,
        },
    });

    assert(response.ok, `HTTP ${response.status}: ${response.text.slice(0, 500)}`);

    const distance =
        response.json?.features?.[0]?.properties?.summary?.distance ??
        response.json?.routes?.[0]?.summary?.distance;

    assert(
        typeof distance === "number",
        "Unexpected openrouteservice response shape: distance not found"
    );

    return {
        status: response.status,
        ms: response.ms,
        details: `Distance returned: ${Math.round(distance)} meters`,
    };
});

await runTest("Carbon Interface electricity estimate", async () => {
    if (process.env.IGNORE_CARBON_INTERFACE === "true") {
        return {
            skipped: true,
            reason:
                "Carbon Interface intentionally ignored for MVP because email confirmation is blocked.",
        };
    }

    const key = envAny(["CARBON_INTERFACE_API_KEY", "CARBONINTERFACE_API_KEY"]);

    if (!key) {
        return {
            skipped: true,
            reason: "Missing CARBON_INTERFACE_API_KEY or CARBONINTERFACE_API_KEY.",
        };
    }

    const response = await httpJson("https://www.carboninterface.com/api/v1/estimates", {
        method: "POST",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${key}`,
        },
        body: JSON.stringify({
            type: "electricity",
            electricity_unit: "kwh",
            electricity_value: 1,
            country: "us",
            state: "ca",
        }),
    });

    assert(response.ok, `HTTP ${response.status}: ${response.text.slice(0, 500)}`);

    const attrs = response.json?.data?.attributes;

    assert(
        typeof attrs?.carbon_kg === "number" ||
        typeof attrs?.carbon_lb === "number" ||
        typeof attrs?.carbon_mt === "number",
        "Unexpected Carbon Interface response shape: carbon value not found"
    );

    return {
        status: response.status,
        ms: response.ms,
        details: `carbon_kg: ${attrs.carbon_kg ?? "not returned"}`,
    };
});

await runTest("Climatiq estimate", async () => {
    const key = envAny(["CLIMATIQ_API_KEY"]);

    if (!key) {
        return {
            skipped: true,
            reason: "Missing CLIMATIQ_API_KEY.",
        };
    }

    const activityId =
        process.env.CLIMATIQ_TEST_ACTIVITY_ID ||
        "passenger_vehicle-vehicle_type_car-fuel_source_na-distance_na-engine_size_na";

    const response = await httpJson("https://api.climatiq.io/data/v1/estimate", {
        method: "POST",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${key}`,
        },
        body: JSON.stringify({
            emission_factor: {
                activity_id: activityId,
                data_version: process.env.CLIMATIQ_DATA_VERSION || "34",
            },
            parameters: {
                distance: 1,
                distance_unit: "km",
            },
        }),
    });

    assert(response.ok, `HTTP ${response.status}: ${response.text.slice(0, 500)}`);

    assert(
        typeof response.json?.co2e === "number",
        "Unexpected Climatiq response shape: co2e not found"
    );

    assert(
        typeof response.json?.co2e_unit === "string",
        "Unexpected Climatiq response shape: co2e_unit not found"
    );

    return {
        status: response.status,
        ms: response.ms,
        details: `${response.json.co2e} ${response.json.co2e_unit}`,
    };
});

await runTest("CarbonSutra app playground endpoint", async () => {
    const appBaseUrl =
        process.env.APP_BASE_URL ||
        process.env.NEXT_PUBLIC_APP_URL ||
        "http://localhost:3001";

    const url = `${appBaseUrl.replace(/\/$/, "")}/api/dev/carbonsutra/test`;

    const response = await httpJson(url, {
        method: "POST",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            endpoint: "vehicleModel",
            payload: {
                vehicle_make: "Toyota",
                vehicle_model: "Corolla",
                distance_value: 12,
                distance_unit: "km",
            },
        }),
    });

    assert(
        response.ok,
        `HTTP ${response.status}: ${response.text.slice(0, 500)}`
    );

    assert(
        response.json?.ok === true,
        `CarbonSutra app route returned ok=false: ${response.text.slice(0, 500)}`
    );

    const co2eKg =
        response.json?.normalized?.co2eKg ??
        response.json?.normalized?.co2Kg ??
        response.json?.co2eKg ??
        response.json?.co2Kg;

    assert(
        typeof co2eKg === "number",
        `CarbonSutra response did not include normalized co2e kg value: ${response.text.slice(
            0,
            500
        )}`
    );

    return {
        status: response.status,
        ms: response.ms,
        details: `CarbonSutra app route working: ${co2eKg} kg CO2e`,
    };
});

await runTest("AGRIBALYSE local data available", async () => {
    const candidates = [
        process.env.AGRIBALYSE_DATA_PATH,
        "data/agribalyse/agribalyse-31-synthese.csv",
        "data/agribalyse/agribalyse-31-detail-par-etape.csv",
        "data/agribalyse/agribalyse-31-detail-par-ingredient.csv",
        "data/agribalyse.csv",
        "data/agribalyse.json",
        "data/AGRIBALYSE.csv",
        "public/data/agribalyse.csv",
        "prisma/agribalyse.csv",
    ].filter(Boolean);

    const found = candidates.find((file) => fs.existsSync(path.resolve(file)));

    if (!found) {
        return {
            skipped: true,
            reason:
                "AGRIBALYSE local CSV not found. Set AGRIBALYSE_DATA_PATH to data/agribalyse/agribalyse-31-synthese.csv.",
        };
    }

    const stat = fs.statSync(path.resolve(found));

    assert(stat.size > 1000, `AGRIBALYSE file looks too small: ${found}`);

    return {
        status: "local",
        ms: "-",
        details: `${found} found, ${(stat.size / 1024 / 1024).toFixed(2)} MB`,
    };
});

console.log("\nCarbon Compass API Health Check\n");
console.table(results);

const failed = results.filter((result) => result.status === "FAIL");

if (failed.length > 0) {
    console.log("\nUnavailable or failing APIs (prototype fallbacks remain active):");

    for (const fail of failed) {
        console.log(`- ${fail.name}: ${fail.details}`);
    }

    console.log("\nHealth check completed without blocking the prototype.\n");
} else {
    console.log("\nAll API checks passed or were intentionally skipped.\n");
}
