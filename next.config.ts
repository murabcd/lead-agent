import { withBotId } from "botid/next/config";
import type { NextConfig } from "next";
import { withWorkflow } from "workflow/next";

import "./env";

const nextConfig: NextConfig = {};

export default withWorkflow(withBotId(nextConfig));
