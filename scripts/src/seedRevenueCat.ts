import { getUncachableRevenueCatClient } from "./revenueCatClient";

import {
  listProjects,
  createProject,
  listApps,
  createApp,
  listAppPublicApiKeys,
  listProducts,
  createProduct,
  listEntitlements,
  createEntitlement,
  attachProductsToEntitlement,
  listOfferings,
  createOffering,
  updateOffering,
  listPackages,
  createPackages,
  attachProductsToPackage,
  type App,
  type Product,
  type Project,
  type Entitlement,
  type Offering,
  type Package,
  type CreateProductData,
} from "@replit/revenuecat-sdk";

const PROJECT_NAME = "Florish";

const ENTITLEMENT_IDENTIFIER = "premium";
const ENTITLEMENT_DISPLAY_NAME = "Premium Access";

const OFFERING_IDENTIFIER = "default";
const OFFERING_DISPLAY_NAME = "Default Offering";

const APP_STORE_APP_NAME = "Florish iOS";
const APP_STORE_BUNDLE_ID = "com.florish.app";
const PLAY_STORE_APP_NAME = "Florish Android";
const PLAY_STORE_PACKAGE_NAME = "com.florish.app";

const PRODUCTS = [
  {
    identifier: "florish_weekly",
    playIdentifier: "florish_weekly:weekly",
    displayName: "Florish Weekly",
    title: "Weekly Premium",
    duration: "P1W" as const,
    packageId: "$rc_weekly",
    packageName: "Weekly",
    prices: [
      { amount_micros: 6990000, currency: "USD" },
    ],
  },
  {
    identifier: "florish_monthly",
    playIdentifier: "florish_monthly:monthly",
    displayName: "Florish Monthly",
    title: "Monthly Premium",
    duration: "P1M" as const,
    packageId: "$rc_monthly",
    packageName: "Monthly",
    prices: [
      { amount_micros: 19990000, currency: "USD" },
    ],
  },
  {
    identifier: "florish_yearly",
    playIdentifier: "florish_yearly:yearly",
    displayName: "Florish Yearly",
    title: "Yearly Premium",
    duration: "P1Y" as const,
    packageId: "$rc_annual",
    packageName: "Yearly",
    prices: [
      { amount_micros: 99990000, currency: "USD" },
    ],
  },
];

type TestStorePricesResponse = { object: string; prices: { amount_micros: number; currency: string }[] };

async function seedRevenueCat() {
  const client = await getUncachableRevenueCatClient();

  let project: Project;
  const { data: existingProjects, error: listProjectsError } = await listProjects({ client, query: { limit: 20 } });
  if (listProjectsError) throw new Error("Failed to list projects");

  const existingProject = existingProjects.items?.find((p) => p.name === PROJECT_NAME);
  if (existingProject) {
    console.log("Project already exists:", existingProject.id);
    project = existingProject;
  } else {
    const { data: newProject, error } = await createProject({ client, body: { name: PROJECT_NAME } });
    if (error) throw new Error("Failed to create project");
    console.log("Created project:", newProject.id);
    project = newProject;
  }

  const { data: apps, error: listAppsError } = await listApps({ client, path: { project_id: project.id }, query: { limit: 20 } });
  if (listAppsError || !apps || apps.items.length === 0) throw new Error("No apps found");

  let testApp: App | undefined = apps.items.find((a) => a.type === "test_store");
  let appStoreApp: App | undefined = apps.items.find((a) => a.type === "app_store");
  let playStoreApp: App | undefined = apps.items.find((a) => a.type === "play_store");

  if (!testApp) throw new Error("No test store app found");
  console.log("Test store app:", testApp.id);

  if (!appStoreApp) {
    const { data: newApp, error } = await createApp({ client, path: { project_id: project.id }, body: { name: APP_STORE_APP_NAME, type: "app_store", app_store: { bundle_id: APP_STORE_BUNDLE_ID } } });
    if (error) throw new Error("Failed to create App Store app");
    appStoreApp = newApp;
    console.log("Created App Store app:", appStoreApp.id);
  } else {
    console.log("App Store app:", appStoreApp.id);
  }

  if (!playStoreApp) {
    const { data: newApp, error } = await createApp({ client, path: { project_id: project.id }, body: { name: PLAY_STORE_APP_NAME, type: "play_store", play_store: { package_name: PLAY_STORE_PACKAGE_NAME } } });
    if (error) throw new Error("Failed to create Play Store app");
    playStoreApp = newApp;
    console.log("Created Play Store app:", playStoreApp.id);
  } else {
    console.log("Play Store app:", playStoreApp.id);
  }

  const { data: existingProducts, error: listProductsError } = await listProducts({ client, path: { project_id: project.id }, query: { limit: 100 } });
  if (listProductsError) throw new Error("Failed to list products");

  const ensureProduct = async (targetApp: App, storeId: string, isTestStore: boolean, displayName: string, title: string, duration: "P1W" | "P1M" | "P1Y"): Promise<Product> => {
    const existing = existingProducts.items?.find((p) => p.store_identifier === storeId && p.app_id === targetApp.id);
    if (existing) { console.log(`Product ${storeId} exists:`, existing.id); return existing; }

    const body: CreateProductData["body"] = { store_identifier: storeId, app_id: targetApp.id, type: "subscription", display_name: displayName };
    if (isTestStore) { body.subscription = { duration }; body.title = title; }

    const { data: created, error } = await createProduct({ client, path: { project_id: project.id }, body });
    if (error) throw new Error(`Failed to create product ${storeId}`);
    console.log(`Created product ${storeId}:`, created.id);
    return created;
  };

  const createdProducts: { test: Product; appStore: Product; playStore: Product }[] = [];

  for (const prod of PRODUCTS) {
    const testProd = await ensureProduct(testApp, prod.identifier, true, prod.displayName, prod.title, prod.duration);
    const appStoreProd = await ensureProduct(appStoreApp, prod.identifier, false, prod.displayName, prod.title, prod.duration);
    const playStoreProd = await ensureProduct(playStoreApp, prod.playIdentifier, false, prod.displayName, prod.title, prod.duration);

    // Add prices to test store product
    const { data: _, error: priceError } = await client.post<TestStorePricesResponse>({
      url: "/projects/{project_id}/products/{product_id}/test_store_prices",
      path: { project_id: project.id, product_id: testProd.id },
      body: { prices: prod.prices },
    });
    if (priceError && typeof priceError === "object" && "type" in priceError && priceError["type"] !== "resource_already_exists") {
      console.warn(`Price error for ${prod.identifier}:`, priceError);
    } else {
      console.log(`Prices set for ${prod.identifier}`);
    }

    createdProducts.push({ test: testProd, appStore: appStoreProd, playStore: playStoreProd });
  }

  // Entitlement
  const { data: existingEntitlements, error: listEntitlementsError } = await listEntitlements({ client, path: { project_id: project.id }, query: { limit: 20 } });
  if (listEntitlementsError) throw new Error("Failed to list entitlements");

  let entitlement: Entitlement;
  const existingEnt = existingEntitlements.items?.find((e) => e.lookup_key === ENTITLEMENT_IDENTIFIER);
  if (existingEnt) {
    console.log("Entitlement exists:", existingEnt.id);
    entitlement = existingEnt;
  } else {
    const { data: newEnt, error } = await createEntitlement({ client, path: { project_id: project.id }, body: { lookup_key: ENTITLEMENT_IDENTIFIER, display_name: ENTITLEMENT_DISPLAY_NAME } });
    if (error) throw new Error("Failed to create entitlement");
    console.log("Created entitlement:", newEnt.id);
    entitlement = newEnt;
  }

  const allProductIds = createdProducts.flatMap((p) => [p.test.id, p.appStore.id, p.playStore.id]);
  const { error: attachEntitlementError } = await attachProductsToEntitlement({ client, path: { project_id: project.id, entitlement_id: entitlement.id }, body: { product_ids: allProductIds } });
  if (attachEntitlementError && attachEntitlementError.type !== "unprocessable_entity_error") {
    throw new Error("Failed to attach products to entitlement");
  }
  console.log("Products attached to entitlement");

  // Offering
  const { data: existingOfferings, error: listOfferingsError } = await listOfferings({ client, path: { project_id: project.id }, query: { limit: 20 } });
  if (listOfferingsError) throw new Error("Failed to list offerings");

  let offering: Offering;
  const existingOff = existingOfferings.items?.find((o) => o.lookup_key === OFFERING_IDENTIFIER);
  if (existingOff) {
    console.log("Offering exists:", existingOff.id);
    offering = existingOff;
  } else {
    const { data: newOff, error } = await createOffering({ client, path: { project_id: project.id }, body: { lookup_key: OFFERING_IDENTIFIER, display_name: OFFERING_DISPLAY_NAME } });
    if (error) throw new Error("Failed to create offering");
    console.log("Created offering:", newOff.id);
    offering = newOff;
  }

  if (!offering.is_current) {
    const { error } = await updateOffering({ client, path: { project_id: project.id, offering_id: offering.id }, body: { is_current: true } });
    if (error) throw new Error("Failed to set current offering");
    console.log("Offering set as current");
  }

  // Packages
  const { data: existingPkgs, error: listPkgsError } = await listPackages({ client, path: { project_id: project.id, offering_id: offering.id }, query: { limit: 20 } });
  if (listPkgsError) throw new Error("Failed to list packages");

  for (let i = 0; i < PRODUCTS.length; i++) {
    const prod = PRODUCTS[i]!;
    const cp = createdProducts[i]!;
    let pkg: Package;

    const existingPkg = existingPkgs.items?.find((p) => p.lookup_key === prod.packageId);
    if (existingPkg) {
      console.log(`Package ${prod.packageId} exists:`, existingPkg.id);
      pkg = existingPkg;
    } else {
      const { data: newPkg, error } = await createPackages({ client, path: { project_id: project.id, offering_id: offering.id }, body: { lookup_key: prod.packageId, display_name: prod.packageName } });
      if (error) throw new Error(`Failed to create package ${prod.packageId}`);
      console.log(`Created package ${prod.packageId}:`, newPkg.id);
      pkg = newPkg;
    }

    const { error: attachPkgError } = await attachProductsToPackage({
      client,
      path: { project_id: project.id, package_id: pkg.id },
      body: { products: [
        { product_id: cp.test.id, eligibility_criteria: "all" },
        { product_id: cp.appStore.id, eligibility_criteria: "all" },
        { product_id: cp.playStore.id, eligibility_criteria: "all" },
      ]},
    });
    if (attachPkgError && !(attachPkgError.type === "unprocessable_entity_error" && attachPkgError.message?.includes("Cannot attach product"))) {
      console.warn(`Package attach warning for ${prod.packageId}:`, attachPkgError);
    } else {
      console.log(`Products attached to package ${prod.packageId}`);
    }
  }

  // API Keys
  const { data: testKeys } = await listAppPublicApiKeys({ client, path: { project_id: project.id, app_id: testApp.id } });
  const { data: appStoreKeys } = await listAppPublicApiKeys({ client, path: { project_id: project.id, app_id: appStoreApp.id } });
  const { data: playStoreKeys } = await listAppPublicApiKeys({ client, path: { project_id: project.id, app_id: playStoreApp.id } });

  console.log("\n====================");
  console.log("Florish RevenueCat Setup Complete!");
  console.log("Project ID:", project.id);
  console.log("Test Store App ID:", testApp.id);
  console.log("App Store App ID:", appStoreApp.id);
  console.log("Play Store App ID:", playStoreApp.id);
  console.log("EXPO_PUBLIC_REVENUECAT_TEST_API_KEY:", testKeys?.items.map((k) => k.key).join(", ") ?? "N/A");
  console.log("EXPO_PUBLIC_REVENUECAT_IOS_API_KEY:", appStoreKeys?.items.map((k) => k.key).join(", ") ?? "N/A");
  console.log("EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY:", playStoreKeys?.items.map((k) => k.key).join(", ") ?? "N/A");
  console.log("REVENUECAT_PROJECT_ID:", project.id);
  console.log("REVENUECAT_TEST_STORE_APP_ID:", testApp.id);
  console.log("REVENUECAT_APPLE_APP_STORE_APP_ID:", appStoreApp.id);
  console.log("REVENUECAT_GOOGLE_PLAY_STORE_APP_ID:", playStoreApp.id);
  console.log("====================\n");
}

seedRevenueCat().catch(console.error);
