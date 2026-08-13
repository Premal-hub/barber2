// Single short entry point for backend access.
// Import from here instead of the long generated path:
//   import { supabase } from "@/supabase";
//   import type { Database, Tables } from "@/supabase";
//
// NOTE: server-only modules are intentionally NOT re-exported here, because this
// file is imported by client code. Keep using them directly inside server handlers:
//   const { supabaseAdmin } = await import("@/integrations/client.server");
//   import { requireSupabaseAuth } from "@/integrations/auth-middleware";
export { supabase } from "@/integrations/client";
export type {
  Database,
  Json,
  Tables,
  TablesInsert,
  TablesUpdate,
  Enums,
  CompositeTypes,
} from "@/integrations/types";
export { Constants } from "@/integrations/types";
