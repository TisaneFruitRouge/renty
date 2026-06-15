/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as auth from "../auth.js";
import type * as authOptions from "../authOptions.js";
import type * as authUsers from "../authUsers.js";
import type * as channels from "../channels.js";
import type * as data from "../data.js";
import type * as documents from "../documents.js";
import type * as files from "../files.js";
import type * as http from "../http.js";
import type * as leases from "../leases.js";
import type * as properties from "../properties.js";
import type * as rentReceiptWorkflows from "../rentReceiptWorkflows.js";
import type * as rentReceipts from "../rentReceipts.js";
import type * as settings from "../settings.js";
import type * as subscriptionBilling from "../subscriptionBilling.js";
import type * as subscriptions from "../subscriptions.js";
import type * as tenants from "../tenants.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  authOptions: typeof authOptions;
  authUsers: typeof authUsers;
  channels: typeof channels;
  data: typeof data;
  documents: typeof documents;
  files: typeof files;
  http: typeof http;
  leases: typeof leases;
  properties: typeof properties;
  rentReceiptWorkflows: typeof rentReceiptWorkflows;
  rentReceipts: typeof rentReceipts;
  settings: typeof settings;
  subscriptionBilling: typeof subscriptionBilling;
  subscriptions: typeof subscriptions;
  tenants: typeof tenants;
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

export declare const components: {
  betterAuth: import("../betterAuth/_generated/component.js").ComponentApi<"betterAuth">;
};
