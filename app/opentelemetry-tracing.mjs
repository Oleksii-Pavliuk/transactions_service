import {NodeSDK } from "@opentelemetry/sdk-node";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { SemanticResourceAttributes } from "@opentelemetry/semantic-conventions";
import { Resource} from "@opentelemetry/resources";

import config from "./config/config.mjs"

export const otelReg = () => {
  
  const JAEGER_HOST = config.get("jaegerHost")
  const JAEGER_PORT = config.get("jaegerPort")
  const JAEGER_SERVICE_NAME= config.get("ServiceName");

  const resource  = new Resource({
      [SemanticResourceAttributes.SERVICE_NAME]: JAEGER_SERVICE_NAME,
    });
  const sdk = new NodeSDK({
      resource  ,
      traceExporter: new OTLPTraceExporter({url: `http://${JAEGER_HOST}:${JAEGER_PORT}/v1/traces`,headers: {}, concurrencyLimit: 10 }),
      instrumentations: [getNodeAutoInstrumentations()],
    });

  sdk.start()
  console.log("Registred with Open telemetry")
}