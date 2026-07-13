import express from "express";
import { adminLoginController, adminGetStatsController, adminGetUsersController, adminGetAssessmentsController, adminDeleteUserController, adminDeleteAssessmentController, adminGetUserAssessmentsController, adminGetAtRiskPatientsController } from "../controllers/admin.controller.js";
import { adminAuthMiddleware } from "../middlewares/adminAuth.middleware.js";

export const adminRoutes = express.Router();

adminRoutes.post("/login", adminLoginController);
adminRoutes.get("/stats", adminAuthMiddleware, adminGetStatsController);
adminRoutes.get("/users", adminAuthMiddleware, adminGetUsersController);
adminRoutes.get("/assessments", adminAuthMiddleware, adminGetAssessmentsController);
adminRoutes.get("/users/:id/assessments", adminAuthMiddleware, adminGetUserAssessmentsController);
adminRoutes.get("/at-risk-patients", adminAuthMiddleware, adminGetAtRiskPatientsController);
adminRoutes.delete("/users/:id", adminAuthMiddleware, adminDeleteUserController);
adminRoutes.delete("/assessments/:id", adminAuthMiddleware, adminDeleteAssessmentController);
