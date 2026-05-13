export const reportSample = {
  report: 'API usage',
  generatedAt: '2026-05-12T09:30:00.000Z',
  customer: {
    name: 'Northwind Labs',
    plan: 'Scale',
    region: 'EU'
  },
  endpoints: [
    { path: '/v1/search', p95: 184, requests: 12904, healthy: true },
    { path: '/v1/export', p95: 421, requests: 870, healthy: true },
    { path: '/v1/import', p95: 890, requests: 312, healthy: false }
  ],
  notes: ['Nested JSON stays readable', 'Tables are detected automatically']
};

export const rowsSample = [
  { name: 'Search API', owner: 'Platform', status: 'healthy', p95: 184, requests: 12904 },
  { name: 'Export API', owner: 'Data', status: 'healthy', p95: 421, requests: 870 },
  { name: 'Import API', owner: 'Data', status: 'degraded', p95: 890, requests: 312 }
];

export const largeRowsSample = Array.from({ length: 250 }, (_, index) => {
  const id = index + 1;
  const p95 = 120 + ((id * 37) % 780);

  return {
    id,
    endpoint: `/v1/events/${id.toString().padStart(3, '0')}`,
    team: ['Platform', 'Data', 'Billing', 'Support'][index % 4],
    p95,
    requests: 240 + ((id * 163) % 18000),
    healthy: p95 < 720,
    metadata: {
      region: ['EU', 'US', 'APAC'][index % 3],
      tier: ['standard', 'priority', 'batch'][index % 3]
    }
  };
});

export const terminalSample = `NAME        READY   STATUS    RESTARTS   AGE
api-7f9d    1/1     Running   0          4h
worker-21   1/1     Running   1          2h
sync-03     0/1     Pending   0          12m`;

export const textCandidatesSample = [
  'Create invoice',
  'Export invoices',
  'Import contacts',
  'Payment export',
  'Search endpoint',
  'Customer support notes',
  'Marseille office'
];

export const svgSample = `<svg viewBox="0 0 240 120" role="img" aria-labelledby="title desc">
  <title id="title">Latency chart</title>
  <desc id="desc">Three bars showing endpoint response time.</desc>
  <g class="bars" fill="#2563eb">
    <rect x="24" y="48" width="42" height="48" rx="6" data-label="search" />
    <rect x="98" y="24" width="42" height="72" rx="6" data-label="export" />
    <rect x="172" y="64" width="42" height="32" rx="6" data-label="import" />
  </g>
  <!-- baseline -->
  <path d="M18 96H222" stroke="#111827" stroke-width="2" />
</svg>`;

export const frontmatterSample = `---
title: Release notes
draft: false
tags:
  - docs
  - release
author:
  name: Developer Kits
  team: Content tooling
---
# Release notes

Short intro for the public changelog.

<!-- more -->

Full article body with implementation details.`;

export const dataUrlSample =
  'data:image/svg+xml;charset=utf-8,%3Csvg%20viewBox%3D%220%200%20240%20120%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Crect%20width%3D%22240%22%20height%3D%22120%22%20rx%3D%2218%22%20fill%3D%22%230891b2%22%2F%3E%3Ctext%20x%3D%22120%22%20y%3D%2268%22%20font-size%3D%2228%22%20text-anchor%3D%22middle%22%20fill%3D%22white%22%3Edata-url-kit%3C%2Ftext%3E%3C%2Fsvg%3E';

export const colorCssSample = `.button {
  color: #fff;
  background: #336699;
  border-color: #12zzzz;
  box-shadow: 0 0 0 3px #0f38;
}`;

export const importSourceSample = `import React from "react";
import jsx from "react/jsx-runtime";
import local from "./local.js";
export { helper } from "@scope/pkg/subpath";
const legacy = require("legacy-package/utils");
const fs = await import("node:fs");`;

export const jmxSample = `<?xml version="1.0" encoding="UTF-8"?>
<jmeterTestPlan version="1.2">
  <hashTree>
    <TestPlan testname="Checkout load test">
      <elementProp name="TestPlan.user_defined_variables" elementType="Arguments">
        <collectionProp name="Arguments.arguments" />
      </elementProp>
    </TestPlan>
    <hashTree>
      <ThreadGroup testname="Users">
        <stringProp name="ThreadGroup.num_threads">5</stringProp>
        <stringProp name="ThreadGroup.ramp_time">10</stringProp>
        <elementProp name="ThreadGroup.main_controller" elementType="LoopController">
          <stringProp name="LoopController.loops">3</stringProp>
        </elementProp>
      </ThreadGroup>
      <hashTree>
        <HTTPSamplerProxy testname="Search API">
          <stringProp name="HTTPSampler.domain">api.example.com</stringProp>
          <stringProp name="HTTPSampler.protocol">https</stringProp>
          <stringProp name="HTTPSampler.path">/v1/search</stringProp>
          <stringProp name="HTTPSampler.method">GET</stringProp>
        </HTTPSamplerProxy>
        <hashTree />
      </hashTree>
    </hashTree>
  </hashTree>
</jmeterTestPlan>`;

export const protoSample = `syntax = "proto3";

package demo.inventory;

message ListProductsRequest {
  string query = 1;
  repeated string tags = 2;
  map<string, int32> limits_by_region = 3;
}

message ListProductsResponse {
  repeated Product products = 1;
}

message Product {
  string id = 1;
  Status status = 2;
}

enum Status {
  STATUS_UNKNOWN = 0;
  STATUS_ACTIVE = 1;
}

service ProductCatalog {
  rpc ListProducts(ListProductsRequest) returns (ListProductsResponse);
}`;
