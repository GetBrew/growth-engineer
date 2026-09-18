/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as aliases from "../aliases.js";
import type * as companies from "../companies.js";
import type * as documents from "../documents.js";
import type * as documents_render from "../documents_render.js";
import type * as map from "../map.js";
import type * as model_agent_level from "../model/agent_level.js";
import type * as model_hash from "../model/hash.js";
import type * as model_keys from "../model/keys.js";
import type * as model_render_access from "../model/render_access.js";
import type * as model_render_markdown from "../model/render_markdown.js";
import type * as seed_companies from "../seed/companies.js";
import type * as seed_run from "../seed/run.js";
import type * as seed_tags from "../seed/tags.js";
import type * as seed_tools from "../seed/tools.js";
import type * as seed_workflows from "../seed/workflows.js";
import type * as shared_auth from "../shared/auth.js";
import type * as shared_builders from "../shared/builders.js";
import type * as shared_errors from "../shared/errors.js";
import type * as shared_reads from "../shared/reads.js";
import type * as shared_validators from "../shared/validators.js";
import type * as tags from "../tags.js";
import type * as tools from "../tools.js";
import type * as tools_search from "../tools_search.js";
import type * as workflows from "../workflows.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  aliases: typeof aliases;
  companies: typeof companies;
  documents: typeof documents;
  documents_render: typeof documents_render;
  map: typeof map;
  "model/agent_level": typeof model_agent_level;
  "model/hash": typeof model_hash;
  "model/keys": typeof model_keys;
  "model/render_access": typeof model_render_access;
  "model/render_markdown": typeof model_render_markdown;
  "seed/companies": typeof seed_companies;
  "seed/run": typeof seed_run;
  "seed/tags": typeof seed_tags;
  "seed/tools": typeof seed_tools;
  "seed/workflows": typeof seed_workflows;
  "shared/auth": typeof shared_auth;
  "shared/builders": typeof shared_builders;
  "shared/errors": typeof shared_errors;
  "shared/reads": typeof shared_reads;
  "shared/validators": typeof shared_validators;
  tags: typeof tags;
  tools: typeof tools;
  tools_search: typeof tools_search;
  workflows: typeof workflows;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
