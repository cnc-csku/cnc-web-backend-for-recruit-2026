// This function is to pick only allow field from data

import { Kind } from "@sinclair/typebox";

export function extractSchemaKeys(schema: any): string[] {
  const keys = new Set<string>();

  const walk = (s: any) => {
    if (!s) return;

    // t.Object
    if (s[Kind] === "Object" && s.properties) {
      for (const key of Object.keys(s.properties)) {
        keys.add(key);
      }
    }

    // t.Partial / t.Omit wrap an inner schema
    if (s.schema) {
      walk(s.schema);
    }

    // t.Intersect
    if (Array.isArray(s.allOf)) {
      for (const sub of s.allOf) {
        walk(sub);
      }
    }
  };

  walk(schema);
  return [...keys];
}

export function pickSafe(data: any, allowTypeSchema: any) {
  const allowedFields = extractSchemaKeys(allowTypeSchema);

  return Object.fromEntries(
    Object.entries(data).filter(([k]) => allowedFields.includes(k))
  );
}
