import express from "express";
import { addAssessmentController, deleteAssessmentController, getAssessmentsController } from "../controllers/assessment.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

export const assessmentRoutes = express.Router();

// All routes require login
assessmentRoutes.use(authMiddleware);

assessmentRoutes.post("/add", addAssessmentController);
assessmentRoutes.get("/get", getAssessmentsController);
assessmentRoutes.delete("/delete/:id", deleteAssessmentController);
