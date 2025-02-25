/**
 * Type definitions for route structure interfaces
 */

/**
 * Interface defining the structure for feature-specific routes (policies and claims)
 * @interface IFeatureRoutes
 */
interface IFeatureRoutes {
  /** Base route for the feature */
  readonly BASE: string;
  /** Route for listing items */
  readonly LIST: string;
  /** Route for creating new items */
  readonly CREATE: string;
  /** Route for editing items with dynamic ID parameter */
  readonly EDIT: string;
  /** Route for viewing item details with dynamic ID parameter */
  readonly DETAILS: string;
}

/**
 * Interface defining the structure for tools-related routes
 * @interface IToolsRoutes
 */
interface IToolsRoutes {
  /** Base route for tools section */
  readonly BASE: string;
  /** Route for configuration management */
  readonly CONFIG: string;
  /** Route for reports generation */
  readonly REPORTS: string;
  /** Route for administration panel */
  readonly ADMIN: string;
}

/**
 * Interface defining the complete route constant structure for the application
 * @interface IRouteConstants
 */
interface IRouteConstants {
  /** Application root route */
  readonly BASE_ROUTE: string;
  /** Authentication route */
  readonly LOGIN_ROUTE: string;
  /** Main dashboard route */
  readonly DASHBOARD_ROUTE: string;
  /** Policy management routes */
  readonly POLICY_ROUTES: IFeatureRoutes;
  /** Claims processing routes */
  readonly CLAIMS_ROUTES: IFeatureRoutes;
  /** Tools and administration routes */
  readonly TOOLS_ROUTES: IToolsRoutes;
}

/**
 * Centralized route constants for the insurance management system
 * Provides immutable route definitions with TypeScript type safety
 * @constant ROUTES
 */
export const ROUTES: IRouteConstants = Object.freeze({
  /** Root application path */
  BASE_ROUTE: '/',
  
  /** Authentication path */
  LOGIN_ROUTE: '/login',
  
  /** Dashboard path */
  DASHBOARD_ROUTE: '/dashboard',
  
  /** Policy management route structure */
  POLICY_ROUTES: Object.freeze({
    BASE: '/policies',
    LIST: '/policies/list',
    CREATE: '/policies/create',
    EDIT: '/policies/:id',
    DETAILS: '/policies/:id/details'
  }),
  
  /** Claims processing route structure */
  CLAIMS_ROUTES: Object.freeze({
    BASE: '/claims',
    LIST: '/claims/list',
    CREATE: '/claims/create',
    EDIT: '/claims/:id',
    DETAILS: '/claims/:id/details'
  }),
  
  /** Tools and administration route structure */
  TOOLS_ROUTES: Object.freeze({
    BASE: '/tools',
    CONFIG: '/tools/config',
    REPORTS: '/tools/reports',
    ADMIN: '/tools/admin'
  })
});

/**
 * Export individual route constants for direct access
 */
export const {
  BASE_ROUTE,
  LOGIN_ROUTE,
  DASHBOARD_ROUTE,
  POLICY_ROUTES,
  CLAIMS_ROUTES,
  TOOLS_ROUTES
} = ROUTES;