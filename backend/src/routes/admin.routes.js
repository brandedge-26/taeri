import express from "express";
import { adminLoginController, adminGetStatsController, adminGetUsersController, adminGetAssessmentsController, adminDeleteUserController, adminDeleteAssessmentController, adminGetUserAssessmentsController, adminGetAtRiskPatientsController, adminGetAlertsController, adminChangePasswordController, adminGetSingleUserController } from "../controllers/admin.controller.js";
import { adminAuthMiddleware } from "../middlewares/adminAuth.middleware.js";

export const adminRoutes = express.Router();

adminRoutes.post("/login", adminLoginController);
adminRoutes.get("/stats", adminAuthMiddleware, adminGetStatsController);
adminRoutes.get("/users", adminAuthMiddleware, adminGetUsersController);
adminRoutes.get("/assessments", adminAuthMiddleware, adminGetAssessmentsController);
adminRoutes.get("/users/:id/assessments", adminAuthMiddleware, adminGetUserAssessmentsController);
adminRoutes.get("/users/:id", adminAuthMiddleware, adminGetSingleUserController);
adminRoutes.get("/at-risk-patients", adminAuthMiddleware, adminGetAtRiskPatientsController);
adminRoutes.get("/alerts", adminAuthMiddleware, adminGetAlertsController);
adminRoutes.post("/change-password", adminAuthMiddleware, adminChangePasswordController);
adminRoutes.delete("/users/:id", adminAuthMiddleware, adminDeleteUserController);
adminRoutes.delete("/assessments/:id", adminAuthMiddleware, adminDeleteAssessmentController);
