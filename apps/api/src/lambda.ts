import serverless from "serverless-http";
import { createApp } from "./app.js";

// Lambda Function URLs deliver API-Gateway-v2-shaped events, which
// serverless-http understands out of the box.
export const handler = serverless(createApp());
